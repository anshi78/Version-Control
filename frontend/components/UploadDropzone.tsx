"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "@clerk/nextjs";
import { UploadCloud, CheckCircle2, Loader2, FileArchive } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UploadDropzone({
  siteId,
  onUploadSuccess,
}: {
  siteId: string;
  onUploadSuccess: () => void;
}) {
  const { getToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];

      if (!file.name.endsWith(".zip") && file.type !== "application/zip") {
        setError("Please upload a .zip file");
        return;
      }

      setUploading(true);
      setError("");
      setSuccess(null);
      setProgress(30);

      const formData = new FormData();
      formData.append("website", file);

      try {
        const token = await getToken();
        setProgress(50);

        const res = await fetch(`${API_URL}/api/sites/${siteId}/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        setProgress(100);
        setSuccess(data);
        onUploadSuccess();

        setTimeout(() => {
          setSuccess(null);
          setProgress(0);
        }, 5000);
      } catch (err: any) {
        setError(err.message);
        setProgress(0);
      } finally {
        setUploading(false);
      }
    },
    [siteId, getToken, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/zip": [".zip"] },
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className="w-full">
      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center animate-scale-in">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-emerald-900 mb-1">
            Upload Successful!
          </h3>
          <p className="text-sm text-emerald-600 mb-4">
            Version {success.version} is now live and tracked.
          </p>
          <div className="inline-flex items-center gap-3 text-sm font-mono bg-white border border-emerald-200 px-4 py-2 rounded-lg text-emerald-700">
            <span>{success.totalFiles} files total</span>
            <span className="text-emerald-300">|</span>
            <span className="font-semibold">+{success.newBlobs} new blobs</span>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group
            ${
              isDragActive
                ? "border-indigo-400 bg-indigo-50/50 scale-[1.02]"
                : "border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30"
            }
            ${uploading ? "opacity-60 pointer-events-none" : ""}
          `}
        >
          <input {...getInputProps()} />

          <div
            className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300
            ${
              isDragActive
                ? "bg-indigo-100 text-indigo-600 scale-110"
                : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
            }`}
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <h3 className="text-base font-semibold text-slate-800 mb-1">
            {uploading
              ? "Uploading..."
              : isDragActive
              ? "Drop ZIP to deploy"
              : "Drag & drop site ZIP here"}
          </h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Upload a{" "}
            <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-xs font-medium">
              .zip
            </span>{" "}
            file containing your static website files.
          </p>

          {uploading && (
            <div className="mt-4 max-w-xs mx-auto">
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">{progress}% complete</p>
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 py-2 px-4 rounded-lg inline-block">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

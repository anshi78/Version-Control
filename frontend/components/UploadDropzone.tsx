"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "@clerk/nextjs";
import { UploadCloud, CheckCircle2, FileArchive, Loader2 } from "lucide-react";

export default function UploadDropzone({ siteId, onUploadSuccess }: { siteId: string, onUploadSuccess: () => void }) {
  const { getToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    // Check if zip
    if (!file.name.endsWith('.zip') && file.type !== 'application/zip') {
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
      
      const res = await fetch(`http://localhost:5000/api/sites/${siteId}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      setSuccess(data);
      onUploadSuccess();
      
      // Auto dismiss success
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
  }, [siteId, getToken, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'] },
    multiple: false,
    disabled: uploading
  });

  return (
    <div className="w-full">
      {success ? (
        <div className="border border-green-500/30 bg-green-500/10 rounded-xl p-8 text-center text-green-400">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
          <h3 className="text-xl font-medium mb-1">Upload Successful!</h3>
          <p className="opacity-80">Version {success.version} created.</p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm font-mono bg-black/20 p-3 rounded-lg inline-flex">
            <span>{success.totalFiles} files total</span>
            <span className="text-neutral-500">|</span>
            <span className="text-indigo-400">+{success.newBlobs} new blobs stored</span>
          </div>
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
            ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-500 hover:bg-neutral-800'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-neutral-800 text-indigo-400 ring-4 ring-neutral-900">
             {uploading ? (
               <Loader2 className="w-8 h-8 animate-spin" />
             ) : (
               <UploadCloud className="w-8 h-8" />
             )}
          </div>
          
          <h3 className="text-lg font-medium text-white mb-2">
            {uploading ? "Uploading version..." : isDragActive ? "Drop ZIP here" : "Drag & drop site ZIP"}
          </h3>
          <p className="text-neutral-400 text-sm max-w-sm mx-auto">
            Upload a .zip file containing your static website. We'll automatically hash files and deduplicate against existing versions.
          </p>

          {error && (
             <div className="mt-4 text-red-400 text-sm bg-red-400/10 py-2 px-4 rounded-lg inline-block">
               {error}
             </div>
          )}
        </div>
      )}
    </div>
  );
}

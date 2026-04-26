"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import UploadDropzone from "@/components/UploadDropzone";
import AuditLogViewer from "@/components/AuditLogViewer";
import DiffViewer from "@/components/DiffViewer";
import {
  Loader2,
  GitCommit,
  ArrowLeft,
  History,
  Unlock,
  Lock,
  FileDiff,
  RotateCcw,
  Calendar,
  FileStack,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SiteView() {
  const { siteId } = useParams();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [site, setSite] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackLoading, setRollbackLoading] = useState<string | null>(null);

  const [diffBaseId, setDiffBaseId] = useState<string | null>(null);
  const [diffTargetId, setDiffTargetId] = useState<string | null>(null);

  const fetchSiteAndVersions = async () => {
    try {
      const token = await getToken();
      const siteRes = await fetch(`${API_URL}/api/sites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (siteRes.ok) {
        const sites = await siteRes.json();
        setSite(sites.find((s: any) => s._id === siteId));
      }

      const verRes = await fetch(
        `${API_URL}/api/sites/${siteId}/versions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (verRes.ok) {
        setVersions(await verRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchSiteAndVersions();
    }
  }, [isLoaded, isSignedIn, siteId]);

  const handleRollback = async (versionId: string) => {
    if (
      !confirm(
        "Are you sure you want to rollback to this version? The live site pointer will be updated."
      )
    )
      return;

    setRollbackLoading(versionId);
    try {
      const token = await getToken();
      const res = await fetch(
        `${API_URL}/api/sites/${siteId}/versions/${versionId}/rollback`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        await fetchSiteAndVersions();
      } else {
        alert("Rollback failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRollbackLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar />
      <div className="ml-[260px]">
        <Navbar />
        <main className="px-8 py-8 max-w-[1400px] mx-auto animate-fade-in">
          {/* Breadcrumb & Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Link
                href="/"
                className="hover:text-indigo-600 transition-colors"
              >
                Projects
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900 font-medium">{site?.name}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="w-10 h-10 bg-white border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all shadow-sm group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {site?.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      ID: {String(site?._id || "").slice(-8)}
                    </span>
                    {site?.currentVersionId && (
                      <span className="badge-success">
                        <Unlock className="w-3 h-3" />
                        v{site.currentVersionId.versionNumber} Live
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column — Upload & Info */}
            <div className="space-y-6 lg:col-span-1">
              {/* Deploy Card */}
              <div className="card rounded-xl overflow-hidden animate-slide-up stagger-1">
                <div className="px-6 py-4 border-b border-slate-100 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <GitCommit className="w-[18px] h-[18px] text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Deploy New Version
                      </h2>
                      <p className="text-xs text-slate-500">
                        Upload a ZIP to create a new version
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-white">
                  <UploadDropzone
                    siteId={siteId as string}
                    onUploadSuccess={fetchSiteAndVersions}
                  />
                </div>
              </div>

              {/* Site Info Card */}
              <div className="card rounded-xl p-6 animate-slide-up stagger-2">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                    <History className="w-[18px] h-[18px] text-slate-500" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Site Overview
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">
                      Total Deployments
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {versions.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-slate-500">Live Version</span>
                    {site?.currentVersionId ? (
                      <span className="badge-success">
                        v{site.currentVersionId.versionNumber}
                      </span>
                    ) : (
                      <span className="badge-neutral">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column — Timeline, Diff, Audit */}
            <div className="lg:col-span-2 space-y-6">
              {/* Diff Viewer */}
              {diffBaseId && diffTargetId && (
                <div className="card rounded-xl overflow-hidden animate-slide-up">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <FileDiff className="w-[18px] h-[18px] text-indigo-600" />
                      </div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Version Comparison
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setDiffBaseId(null);
                        setDiffTargetId(null);
                      }}
                      className="btn-ghost text-xs"
                    >
                      <X className="w-4 h-4" /> Close
                    </button>
                  </div>
                  <div className="p-5 bg-white">
                    <DiffViewer
                      baseVersionId={diffBaseId}
                      targetVersionId={diffTargetId}
                    />
                  </div>
                </div>
              )}

              {/* Version Timeline */}
              <div className="card rounded-xl overflow-hidden animate-slide-up stagger-3">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileStack className="w-[18px] h-[18px] text-slate-500" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Version Timeline
                      </h2>
                      <p className="text-xs text-slate-500">
                        {versions.length} versions deployed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar bg-white">
                  {versions.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">
                      No versions deployed yet. Upload a ZIP to get started.
                    </div>
                  ) : (
                    versions.map((ver) => {
                      const isActive =
                        site?.currentVersionId?._id === ver._id;
                      const isBase = diffBaseId === ver._id;

                      return (
                        <div
                          key={ver._id}
                          className={`px-6 py-5 transition-all group hover:bg-slate-50/60 ${
                            isActive ? "bg-emerald-50/30" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {/* Version badge */}
                              <div
                                className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm border-2 transition-all
                                ${
                                  isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-50 text-slate-500 border-slate-200 group-hover:border-indigo-200 group-hover:text-indigo-600"
                                }`}
                              >
                                v{ver.versionNumber}
                              </div>

                              <div>
                                <div className="flex items-center gap-2.5">
                                  <h3 className="text-sm font-semibold text-slate-800">
                                    Version {ver.versionNumber}
                                  </h3>
                                  {isActive && (
                                    <span className="badge-success text-[10px]">
                                      <Unlock className="w-3 h-3" /> Live
                                    </span>
                                  )}
                                  {isBase && (
                                    <span className="badge-primary text-[10px]">
                                      Diff Base
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(ver.createdAt).toLocaleString()}
                                  </span>
                                  <span>•</span>
                                  <span>{ver.manifest.length} files</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  if (!diffBaseId) setDiffBaseId(ver._id);
                                  else if (diffBaseId !== ver._id)
                                    setDiffTargetId(ver._id);
                                }}
                                className="btn-ghost text-xs"
                              >
                                <FileDiff className="w-3.5 h-3.5" />
                                {diffBaseId === ver._id
                                  ? "Cancel"
                                  : !diffBaseId
                                  ? "Compare"
                                  : "Target"}
                              </button>

                              {!isActive && (
                                <button
                                  onClick={() => handleRollback(ver._id)}
                                  disabled={rollbackLoading === ver._id}
                                  className="btn-primary text-xs px-3 py-1.5"
                                >
                                  {rollbackLoading === ver._id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  )}
                                  Rollback
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Audit Logs */}
              <div className="animate-slide-up stagger-4">
                <AuditLogViewer siteId={siteId as string} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

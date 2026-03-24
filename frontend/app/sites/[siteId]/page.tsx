"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import UploadDropzone from "@/components/UploadDropzone";
import { Loader2, GitCommit, ArrowLeft, History, Lock, Unlock, FileDiff } from "lucide-react";
import Link from "next/link";
import DiffViewer from "@/components/DiffViewer";

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
      // Fetch sites (to find current)
      const siteRes = await fetch(`http://localhost:5000/api/sites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (siteRes.ok) {
        const sites = await siteRes.json();
        setSite(sites.find((s: any) => s._id === siteId));
      }

      // Fetch versions
      const verRes = await fetch(`http://localhost:5000/api/sites/${siteId}/versions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    if (!confirm("Are you sure you want to rollback to this version? The live site pointer will be instantly updated.")) return;
    
    setRollbackLoading(versionId);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/sites/${siteId}/versions/${versionId}/rollback`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
    return <div className="min-h-screen bg-neutral-950 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {site?.name}
              <span className="text-sm font-medium bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full border border-neutral-700">ID: {site?._id.slice(-6)}</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Meta */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-indigo-400" /> Deploy New Version
              </h2>
              <UploadDropzone siteId={siteId as string} onUploadSuccess={fetchSiteAndVersions} />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-neutral-400" /> Site Information
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-neutral-800 pb-3">
                  <span className="text-neutral-500">Total Deployments</span>
                  <span className="font-medium">{versions.length}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-500">Live Pointer (Active)</span>
                  {site?.currentVersionId ? (
                    <span className="bg-green-500/10 text-green-400 px-2.5 py-0.5 rounded-md font-mono text-xs font-semibold">
                      v{site.currentVersionId.versionNumber}
                    </span>
                  ) : (
                    <span className="text-neutral-500 font-medium">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - History & Diff */}
          <div className="lg:col-span-2 space-y-6">
             
            {(diffBaseId && diffTargetId) && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl animate-in slide-in-from-top-4">
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-lg font-medium flex items-center gap-2">
                     <FileDiff className="w-5 h-5 text-indigo-400" /> Version Comparison
                   </h2>
                   <button onClick={() => { setDiffBaseId(null); setDiffTargetId(null); }} className="text-sm text-neutral-400 hover:text-white">Close X</button>
                 </div>
                 <DiffViewer baseVersionId={diffBaseId} targetVersionId={diffTargetId} />
              </div>
            )}

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
                <h2 className="text-lg font-medium">Version History</h2>
              </div>
              
              <div className="divide-y divide-neutral-800 max-h-[600px] overflow-y-auto">
                {versions.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">No versions deployed yet.</div>
                ) : (
                  versions.map((ver) => {
                    const isActive = site?.currentVersionId?._id === ver._id;
                    const isBase = diffBaseId === ver._id;
                    
                    return (
                      <div key={ver._id} className={`p-6 transition-all group hover:bg-neutral-800/40 ${isActive ? 'bg-indigo-500/5' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border
                              ${isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}
                            >
                              v{ver.versionNumber}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white">Version {ver.versionNumber}</h3>
                                {isActive && <span className="bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider"><Unlock className="w-3 h-3" /> Live Active</span>}
                                {isBase && <span className="text-[10px] bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded uppercase">Diff Base</span>}
                              </div>
                              <p className="text-sm text-neutral-500 mt-1">
                                {new Date(ver.createdAt).toLocaleString()} • {ver.manifest.length} files
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button
                               onClick={() => {
                                 if (!diffBaseId) setDiffBaseId(ver._id);
                                 else if (diffBaseId !== ver._id) setDiffTargetId(ver._id);
                               }}
                               disabled={isActive && !diffBaseId}
                               className="text-sm px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition-colors disabled:opacity-50"
                            >
                               {diffBaseId === ver._id ? 'Cancel Compare' : !diffBaseId ? 'Select to Compare' : 'Compare with base'}
                            </button>

                            {!isActive && (
                              <button
                                onClick={() => handleRollback(ver._id)}
                                disabled={rollbackLoading === ver._id}
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-900 rounded-lg font-medium text-sm transition-colors"
                              >
                                {rollbackLoading === ver._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                Rollback here
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
          </div>
        </div>
      </main>
    </div>
  );
}

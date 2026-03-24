"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import CreateSiteModal from "@/components/CreateSiteModal";
import Link from "next/link";
import { Globe, Plus, ArrowRight, Loader2, GitCommitHorizontal } from "lucide-react";

export default function Dashboard() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSites = async () => {
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/sites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSites(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchSites();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isSignedIn ? (
          <div className="text-center py-32 space-y-6">
            <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">
              Version Control for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Websites</span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Safe website deployment, visual comparison of changes, and instant rollback without requiring advanced Git knowledge.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Your Projects</h1>
                <p className="text-neutral-400 mt-1">Manage and deploy your web projects</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>

            {sites.length === 0 ? (
              <div className="border border-dashed border-neutral-800 rounded-2xl p-12 text-center bg-neutral-900/30">
                <Globe className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
                <p className="text-neutral-400 mb-6">Create your first project to start tracking versions.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sites.map((site) => (
                  <Link href={`/sites/${site._id}`} key={site._id} className="group flex flex-col justify-between bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-neutral-800/80 transition-all cursor-pointer">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                          <Globe className="w-6 h-6 text-indigo-400" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{site.name}</h3>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-sm text-neutral-400">
                      <div className="flex items-center gap-2">
                        <GitCommitHorizontal className="w-4 h-4" />
                        <span>{site.currentVersionId ? `v${site.currentVersionId.versionNumber || 'X'}` : 'No versions'}</span>
                      </div>
                      <span>{new Date(site.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      
      {isModalOpen && (
        <CreateSiteModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchSites();
          }}
        />
      )}
    </div>
  );
}

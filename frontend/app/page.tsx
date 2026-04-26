"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CreateSiteModal from "@/components/CreateSiteModal";
import Link from "next/link";
import {
  Globe,
  Plus,
  ArrowRight,
  Loader2,
  GitCommitHorizontal,
  TrendingUp,
  Clock,
  FolderOpen,
  Sparkles,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSites = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/sites`, {
        headers: { Authorization: `Bearer ${token}` },
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-32 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full border border-indigo-100 mb-8">
            <Sparkles className="w-4 h-4" />
            Website Version Control Made Simple
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Deploy, Version &<br />
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Rollback Instantly
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Safe website deployment, visual comparison of changes, and instant
            rollback without requiring advanced Git knowledge.
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn-primary text-base px-8 py-3">
              Get Started Free
            </button>
            <button className="btn-secondary text-base px-8 py-3">
              Learn More
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalVersions = sites.reduce(
    (acc, site) => acc + (site.currentVersionId?.versionNumber || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar />
      <div className="ml-[260px]">
        <Navbar />
        <main className="px-8 py-8 max-w-[1400px] mx-auto animate-fade-in">
          {/* Welcome Section */}
          <div className="mb-8 animate-slide-up">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.firstName || "there"} 👋
            </h1>
            <p className="text-slate-500 mt-1">
              Here&apos;s an overview of your projects and recent activity.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div className="stat-card animate-slide-up stagger-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="badge-primary">Active</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{sites.length}</p>
              <p className="text-sm text-slate-500 mt-1">Total Projects</p>
            </div>

            <div className="stat-card animate-slide-up stagger-2">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="badge-success">Live</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {totalVersions}
              </p>
              <p className="text-sm text-slate-500 mt-1">Total Versions</p>
            </div>

            <div className="stat-card animate-slide-up stagger-3">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <span className="badge-warning">Recent</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {sites.length > 0
                  ? new Date(
                      sites[sites.length - 1].created_at
                    ).toLocaleDateString()
                  : "—"}
              </p>
              <p className="text-sm text-slate-500 mt-1">Last Activity</p>
            </div>
          </div>

          {/* Projects Section */}
          <div
            id="sites"
            className="animate-slide-up stagger-4"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Your Projects
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Manage and deploy your web projects
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>

            {sites.length === 0 ? (
              <div className="card rounded-2xl p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FolderOpen className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Create your first project to start tracking versions and
                  deploying instantly.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4" /> Create First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sites.map((site) => (
                  <Link
                    href={`/sites/${site._id}`}
                    key={site._id}
                    className="card rounded-xl p-5 group cursor-pointer hover:border-indigo-200 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl flex items-center justify-center border border-indigo-100/50 group-hover:scale-110 transition-transform duration-300">
                        <Globe className="w-5 h-5 text-indigo-600" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
                      {site.name}
                    </h3>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <GitCommitHorizontal className="w-4 h-4" />
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                          {site.currentVersionId
                            ? `v${site.currentVersionId.versionNumber || "—"}`
                            : "No versions"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(site.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

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

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, PlusCircle, MinusCircle, Edit2, FileText } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DiffViewer({
  baseVersionId,
  targetVersionId,
}: {
  baseVersionId: string;
  targetVersionId: string;
}) {
  const { getToken } = useAuth();
  const [diff, setDiff] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiff = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(
          `${API_URL}/api/versions/compare/${baseVersionId}/${targetVersionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          setDiff(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (baseVersionId && targetVersionId) {
      fetchDiff();
    }
  }, [baseVersionId, targetVersionId, getToken]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-500">Comparing versions...</p>
      </div>
    );
  }

  if (!diff) return null;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60">
          <PlusCircle className="w-4 h-4" />
          {diff.added.length} Added
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200/60">
          <MinusCircle className="w-4 h-4" />
          {diff.removed.length} Removed
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60">
          <Edit2 className="w-4 h-4" />
          {diff.modified.length} Modified
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 ml-auto">
          <FileText className="w-3.5 h-3.5" />
          {diff.unchanged.length} Unchanged
        </div>
      </div>

      {/* Diff table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="w-16 px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  File Path
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {diff.added.map((f: string) => (
                <tr
                  key={f}
                  className="bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors"
                >
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">
                      +
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono text-sm text-emerald-800">
                    {f}
                  </td>
                </tr>
              ))}
              {diff.removed.map((f: string) => (
                <tr
                  key={f}
                  className="bg-red-50/30 hover:bg-red-50/60 transition-colors"
                >
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-700 rounded-md text-xs font-bold">
                      −
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono text-sm text-red-800 line-through opacity-70">
                    {f}
                  </td>
                </tr>
              ))}
              {diff.modified.map((f: string) => (
                <tr
                  key={f}
                  className="bg-amber-50/30 hover:bg-amber-50/60 transition-colors"
                >
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-700 rounded-md text-xs font-bold">
                      ~
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono text-sm text-amber-800">
                    {f}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {diff.added.length === 0 &&
            diff.removed.length === 0 &&
            diff.modified.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                No changes detected between these versions.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

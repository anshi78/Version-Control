"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, PlusCircle, MinusCircle, Edit2, FileText } from "lucide-react";

export default function DiffViewer({ baseVersionId, targetVersionId }: { baseVersionId: string, targetVersionId: string }) {
  const { getToken } = useAuth();
  const [diff, setDiff] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiff = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        // The API sorts base vs target. Let's compare target (new) against base (old).
        const res = await fetch(`http://localhost:5000/api/versions/compare/${baseVersionId}/${targetVersionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
    return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-500" /></div>;
  }

  if (!diff) return null;

  return (
    <div className="space-y-4">
       <div className="flex gap-4 p-4 bg-neutral-950 rounded-lg text-sm font-mono border border-neutral-800">
          <div className="flex text-green-400 items-center gap-1.5"><PlusCircle className="w-4 h-4"/> {diff.added.length} Added</div>
          <div className="flex text-red-400 items-center gap-1.5"><MinusCircle className="w-4 h-4"/> {diff.removed.length} Removed</div>
          <div className="flex text-blue-400 items-center gap-1.5"><Edit2 className="w-4 h-4"/> {diff.modified.length} Modified</div>
          <div className="flex text-neutral-500 items-center gap-1.5 text-xs ml-auto"><FileText className="w-3 h-3"/> {diff.unchanged.length} Unchanged</div>
       </div>

       <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
             <table className="w-full text-sm text-left">
                <tbody>
                  {diff.added.map((f: string) => (
                    <tr key={f} className="bg-green-500/10 border-b border-green-500/20 text-green-400">
                      <td className="w-10 px-4 py-2 font-mono text-center select-none">+</td>
                      <td className="px-4 py-2 font-mono">{f}</td>
                    </tr>
                  ))}
                  {diff.removed.map((f: string) => (
                    <tr key={f} className="bg-red-500/10 border-b border-red-500/20 text-red-400 line-through">
                      <td className="w-10 px-4 py-2 font-mono text-center select-none">-</td>
                      <td className="px-4 py-2 font-mono">{f}</td>
                    </tr>
                  ))}
                  {diff.modified.map((f: string) => (
                    <tr key={f} className="bg-blue-500/5 hover:bg-blue-500/10 border-b border-blue-500/20 text-blue-300">
                      <td className="w-10 px-4 py-2 font-mono text-center select-none text-blue-500">~</td>
                      <td className="px-4 py-2 font-mono">{f}</td>
                    </tr>
                  ))}
                  {/* optionally show unchanged */}
                </tbody>
             </table>
             {diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0 && (
                <div className="p-8 text-center text-neutral-500">No changes detected between these versions.</div>
             )}
          </div>
       </div>
    </div>
  );
}

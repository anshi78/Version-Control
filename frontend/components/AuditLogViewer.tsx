"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Loader2,
  Upload,
  RotateCcw,
  ScrollText,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AuditLog {
  _id: string;
  action: string;
  userId: string;
  versionId: string | null;
  description: string;
  createdAt: string;
}

export default function AuditLogViewer({ siteId }: { siteId: string }) {
  const { getToken } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/sites/${siteId}/audit-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setLogs(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [siteId, getToken]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "UPLOAD":
        return <Upload className="w-3.5 h-3.5" />;
      case "ROLLBACK":
        return <RotateCcw className="w-3.5 h-3.5" />;
      default:
        return <ScrollText className="w-3.5 h-3.5" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "UPLOAD":
        return "badge-success";
      case "ROLLBACK":
        return "badge-warning";
      default:
        return "badge-neutral";
    }
  };

  const displayedLogs = expanded ? logs : logs.slice(0, 5);

  return (
    <div className="card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
            <ScrollText className="w-[18px] h-[18px] text-slate-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Audit Trail
            </h2>
            <p className="text-xs text-slate-500">{logs.length} events</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : logs.length === 0 ? (
        <div className="p-10 text-center text-slate-400 text-sm">
          No audit events recorded yet.
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayedLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <span
                        className={`${getActionBadge(log.action)} inline-flex items-center gap-1.5`}
                      >
                        {getActionIcon(log.action)}
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <User className="w-3 h-3" />
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {log.userId.length > 12
                            ? `${log.userId.slice(0, 12)}…`
                            : log.userId}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Show more */}
          {logs.length > 5 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors py-1 font-medium"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" /> Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" /> Show All {logs.length}{" "}
                    Events
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Upload,
  ScrollText,
  GitBranch,
  Settings,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "My Sites", href: "/#sites", icon: Globe },
  { label: "Activity", href: "/#activity", icon: ScrollText },
];

const bottomItems = [
  { label: "Help", href: "#", icon: HelpCircle },
  { label: "Settings", href: "#", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-slate-200/80 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/30">
          <GitBranch className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900 tracking-tight">
          WebVCS
        </span>
        <span className="ml-auto badge-primary text-[10px] px-1.5 py-0.5">
          Beta
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
          Main
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-500/5"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <item.icon
                className={`w-[18px] h-[18px] transition-colors ${isActive
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover:text-slate-600"
                  }`}
              />
              {item.label}
            </Link>
          );
        })}


      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100/60">
          <p className="text-xs font-semibold text-indigo-900 mb-1">
            Free Plan
          </p>
          <p className="text-[11px] text-indigo-600/70 leading-relaxed">
            3 of 5 projects used
          </p>
          <div className="mt-2.5 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all"
              style={{ width: "60%" }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

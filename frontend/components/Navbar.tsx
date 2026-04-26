"use client";

import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";

export default function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200/80">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side — Page context */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right side — Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200" />

          {/* User */}
          {!isLoaded ? (
            <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
          ) : isSignedIn ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-900 leading-tight">
                  {user?.firstName || "User"}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {user?.primaryEmailAddress?.emailAddress || ""}
                </p>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "w-9 h-9 ring-2 ring-slate-100 hover:ring-indigo-200 transition-all",
                  },
                }}
              />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="btn-primary text-sm">Sign In</button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}

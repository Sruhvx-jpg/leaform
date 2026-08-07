"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  FileText,
  Menu,
  X,
  Bell,
  User,
  Plus,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "~/providers/global";
import { GetStartedContent } from "~/components/getstarted/GetStartedContent";
import { FormsContent } from "~/components/forms/FormsContent";

export default function GetStartedPage() {
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "dashboard" | "myforms">("create");

  // Check localStorage for user profile data first
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user") || localStorage.getItem("userprofile");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const id = parsed?.id || parsed?.userId || parsed?.sub || parsed?.email;
          if (id) {
            setUserId(String(id));
          }
        }
      } catch (e) {
        console.error("Error reading user data from localStorage:", e);
      }
    }
  }, []);

  // If no data in localStorage, fetch from getMe endpoint
  const getMeQuery = trpc.auth.getMe.useQuery(undefined, {
    enabled: !userId,
    retry: false,
  });

  useEffect(() => {
    if (!userId && getMeQuery.data) {
      const fetchedId =
        (getMeQuery.data as any)?.id ||
        (getMeQuery.data as any)?.userId ||
        (getMeQuery.data as any)?.sub ||
        getMeQuery.data.email;
      if (fetchedId) {
        setUserId(String(fetchedId));
      }
    }
  }, [userId, getMeQuery.data]);

  const profileHref = `/userprofile/${userId || "user_id"}`;

  return (
    <main className="min-h-screen w-full bg-white dark:bg-black text-slate-900 dark:text-white flex relative overflow-x-hidden font-sans transition-colors duration-200">
      {/* Mobile Top Header Bar */}
      <div className="md:hidden flex items-center justify-between w-full p-4 border-b border-emerald-950/10 dark:border-neutral-900 bg-[#f4faf7] dark:bg-black fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-neutral-800 flex-shrink-0">
            <Image
              src="/leafform_logo.png"
              alt="LeafForm Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-emerald-950/10 dark:border-neutral-800 text-emerald-800 dark:text-neutral-400 hover:text-emerald-900 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:relative z-50 md:z-auto top-0 left-0 h-screen
          bg-[#f4faf7] dark:bg-[#0a0a0a] border-r border-t border-b border-emerald-950/10 dark:border-neutral-900 rounded-r-md p-4 flex flex-col
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 dark:border-neutral-800 flex-shrink-0">
              <Image
                src="/leafform_logo.png"
                alt="LeafForm Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Desktop Retract Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-neutral-950/30 text-[#0d5c41] dark:text-neutral-400 hover:text-[#065f46] dark:hover:text-white transition-colors flex-shrink-0 cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Retract sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Retract sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-neutral-950/30 text-[#0d5c41] dark:text-neutral-400 hover:text-[#065f46] dark:hover:text-white transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Separator Line */}
        <div className="w-full border-b border-emerald-950/10 my-4" />

        {/* Navigation Options */}
        <nav className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("create");
              setIsMobileOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left cursor-pointer ${
              isCollapsed ? "md:justify-center" : ""
            } ${
              activeTab === "create"
                ? "bg-[#0d5c41] text-white font-medium shadow-md"
                : "text-emerald-800 dark:text-neutral-400 hover:text-[#0d5c41] dark:hover:text-white hover:bg-emerald-50/50 dark:hover:bg-neutral-900/50 font-medium"
            }`}
            title="Create"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-sm whitespace-nowrap">Create</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("dashboard");
              setIsMobileOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left cursor-pointer ${
              isCollapsed ? "md:justify-center" : ""
            } ${
              activeTab === "dashboard"
                ? "bg-[#0d5c41] text-white font-medium shadow-md"
                : "text-emerald-800 dark:text-neutral-400 hover:text-[#0d5c41] dark:hover:text-white hover:bg-emerald-50/50 dark:hover:bg-neutral-900/50 font-medium"
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-sm whitespace-nowrap">Dashboard</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("myforms");
              setIsMobileOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left cursor-pointer ${
              isCollapsed ? "md:justify-center" : ""
            } ${
              activeTab === "myforms"
                ? "bg-[#0d5c41] text-white font-medium shadow-md"
                : "text-emerald-800 dark:text-neutral-400 hover:text-[#0d5c41] dark:hover:text-white hover:bg-emerald-50/50 dark:hover:bg-neutral-900/50 font-medium"
            }`}
            title="My Forms"
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-sm whitespace-nowrap">My Forms</span>
            )}
          </button>
        </nav>

        {/* Flex Spacer */}
        <div className="flex-grow" />

        {/* Theme Toggle Container */}
        <div className="mt-auto pt-4 border-t border-emerald-950/10 dark:border-neutral-900">
          {isCollapsed && !isMobileOpen ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setTheme(theme === "light" ? "dark" : "light");
              }}
              className="flex items-center justify-center p-2.5 rounded-md bg-emerald-50/50 dark:bg-neutral-900 hover:bg-emerald-50 dark:hover:bg-neutral-800 text-emerald-800 dark:text-neutral-400 hover:text-[#0d5c41] dark:hover:text-white transition-all w-full cursor-pointer"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
            </button>
          ) : (
            <div className="flex items-center justify-between p-1 bg-emerald-950/5 dark:bg-neutral-950 rounded-md border border-emerald-950/10 dark:border-neutral-850">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setTheme("light");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  theme === "light"
                    ? "bg-[#0d5c41] text-white shadow-sm"
                    : "text-emerald-800 dark:text-neutral-400 hover:text-[#0d5c41] dark:hover:text-white"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setTheme("dark");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-[#0d5c41] text-white shadow-sm"
                    : "text-emerald-800 dark:text-neutral-400 hover:text-[#0d5c41] dark:hover:text-white"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Region */}
      <div className="flex-1 p-6 mt-16 md:mt-0 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-gray-100 dark:border-neutral-900">
          {/* Left section: Clean Header Title */}
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white capitalize">
              {activeTab === "create" ? "Create Form" : activeTab === "myforms" ? "My Forms" : "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Icon & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors relative cursor-pointer"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-md shadow-lg p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-900 mb-3">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</h4>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-500 dark:text-neutral-400 text-center py-4">No new notifications</p>
                </div>
              </div>
            )}
          </div>

          {/* User Account Profile Link */}
          <Link
            href={profileHref}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors border border-slate-200 dark:border-neutral-800"
            aria-label="User Profile"
            title="User Profile"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-neutral-800 text-white dark:text-neutral-300 flex items-center justify-center font-semibold text-sm">
              <User className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </header>

        {/* Dynamic Content Component Display */}
        <div className="flex-1 w-full">
          {activeTab === "dashboard" ? (
            <GetStartedContent />
          ) : (
            <FormsContent
              activeSubTab={activeTab === "create" ? "create" : "myforms"}
              setActiveSubTab={(subTab) => setActiveTab(subTab)}
            />
          )}
        </div>
      </div>
    </main>
  );
}

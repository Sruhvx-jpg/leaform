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
} from "lucide-react";
import { GetStartedContent } from "~/components/getstarted/GetStartedContent";
import { FormsContent } from "~/components/forms/FormsContent";

export default function GetStartedPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"forms" | "dashboard">("forms");

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
    <main className="min-h-screen w-full bg-white flex relative overflow-x-hidden font-sans">
      {/* Mobile Top Header Bar */}
      <div className="md:hidden flex items-center justify-between w-full p-4 border-b border-gray-200 bg-gray-100 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 flex-shrink-0">
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
          className="p-2 rounded-lg bg-white border border-black/20 text-slate-700 hover:text-slate-900 transition-colors"
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
          bg-gray-100 border-r border-t border-b border-black rounded-r-xl p-4 flex flex-col
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 flex-shrink-0">
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
            className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-200 text-slate-700 hover:text-slate-900 transition-colors flex-shrink-0"
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
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-200 text-slate-700 hover:text-slate-900 transition-colors flex-shrink-0"
            aria-label="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Separator Line */}
        <div className="w-full border-b border-slate-300 my-4" />

        {/* Navigation Options */}
        <nav className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("forms");
              setIsMobileOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
              isCollapsed ? "md:justify-center" : ""
            } ${
              activeTab === "forms"
                ? "bg-slate-900 text-white font-medium shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 font-medium"
            }`}
            title="Forms"
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-sm whitespace-nowrap">Forms</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("dashboard");
              setIsMobileOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
              isCollapsed ? "md:justify-center" : ""
            } ${
              activeTab === "dashboard"
                ? "bg-slate-900 text-white font-medium shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 font-medium"
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-sm whitespace-nowrap">Dashboard</span>
            )}
          </button>
        </nav>
      </aside>

      {/* Main Content Region */}
      <div className="flex-1 p-6 mt-16 md:mt-0 min-h-screen flex flex-col">
        {/* Top Right Header Bar */}
        <header className="flex items-center justify-end gap-3 pb-4 mb-6 border-b border-gray-100">
          {/* Notification Icon & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-100 text-slate-600 hover:text-slate-900 transition-colors relative"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
                  <h4 className="font-semibold text-sm text-slate-900">Notifications</h4>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-500 text-center py-4">No new notifications</p>
                </div>
              </div>
            )}
          </div>

          {/* User Account Profile Link */}
          <Link
            href={profileHref}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors border border-slate-200"
            aria-label="User Profile"
            title="User Profile"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
              <User className="w-4 h-4" />
            </div>
          </Link>
        </header>

        {/* Dynamic Content Component Display */}
        <div className="flex-1 w-full">
          {activeTab === "dashboard" ? <GetStartedContent /> : <FormsContent />}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { DefaultBackground } from "~/components/background/DefaultBackground";
import { useWorkspace } from "~/providers/workspace";
import { Folder, ChevronDown, Copy, Users, Check, Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function GetStartedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Loading dashboard...</div>}>
      <GetStartedPageContent />
    </Suspense>
  );
}

function GetStartedPageContent() {
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "dashboard" | "myforms">("create");

  // Workspace states
  const { workspaces, activeWorkspace, setActiveWorkspace, refetchWorkspaces } = useWorkspace();
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [showJoinWorkspaceModal, setShowJoinWorkspaceModal] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState("");
  const [showInviteTeamModal, setShowInviteTeamModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const searchParams = useSearchParams();
  const joinCode = searchParams?.get("join") || "";

  const { data: members, refetch: refetchMembers } = trpc.workspace.getWorkspaceMembers.useQuery(
    { workspaceId: activeWorkspace?.id ?? "" },
    { enabled: !!activeWorkspace?.id && showInviteTeamModal }
  );

  const createWorkspaceMutation = trpc.workspace.createWorkspace.useMutation({
    onSuccess: (data) => {
      refetchWorkspaces();
      setActiveWorkspace(data);
      setShowCreateWorkspaceModal(false);
      setNewWorkspaceName("");
      toast.success("Workspace created successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create workspace");
    }
  });

  const joinWorkspaceMutation = trpc.workspace.joinWorkspace.useMutation({
    onSuccess: (data) => {
      refetchWorkspaces();
      setActiveWorkspace(data);
      setShowJoinWorkspaceModal(false);
      setJoinInviteCode("");
      toast.success(`Joined workspace "${data.name}" successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to join workspace");
    }
  });

  const updateRoleMutation = trpc.workspace.updateMemberRole.useMutation({
    onSuccess: () => {
      refetchMembers();
      toast.success("Member role updated successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update role");
    }
  });

  const handleCopyInviteCode = () => {
    if (activeWorkspace?.inviteCode) {
      const code = activeWorkspace.inviteCode;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(() => {
          setCopiedCode(true);
          toast.success(`Invite code copied: ${code}`);
          setTimeout(() => setCopiedCode(false), 2000);
        }).catch(() => {
          fallbackCopyText(code);
        });
      } else {
        fallbackCopyText(code);
      }
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        setCopiedCode(true);
        toast.success(`Invite code copied: ${text}`);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        toast.error(`Failed to copy. Invite code is: ${text}`);
      }
    } catch (err) {
      toast.error(`Failed to copy. Invite code is: ${text}`);
    }
  };

  // Handle auto-joining via shared invite link query parameter
  useEffect(() => {
    if (joinCode) {
      // Clear link param to prevent loops
      const url = new URL(window.location.href);
      url.searchParams.delete("join");
      window.history.replaceState({}, "", url.toString());

      toast.info(`Joining workspace with code ${joinCode}...`);
      joinWorkspaceMutation.mutate({ inviteCode: joinCode });
    }
  }, [joinCode]);

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
    <DefaultBackground>
      <main className="min-h-screen w-full bg-transparent text-slate-900 dark:text-white flex relative overflow-x-hidden font-sans transition-colors duration-200">
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
          bg-[#F2EADF] border-r-2 border-t-2 border-b-2 border-slate-900 p-4 flex flex-col
          transition-all duration-300 ease-in-out shadow-[4px_4px_0px_0px_#16a34a]
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-20" : "md:w-64"}
        `}
        style={{ borderRadius: "0 25px 25px 0/0 25px 25px 0" }}
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
            className="hidden md:flex p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-neutral-950/30 text-[#16a34a] dark:text-neutral-400 hover:text-[#065f46] dark:hover:text-white transition-colors flex-shrink-0 cursor-pointer"
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
            className="md:hidden p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-neutral-950/30 text-[#16a34a] dark:text-neutral-400 hover:text-[#065f46] dark:hover:text-white transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Separator Line */}
        <div className="w-full border-b border-emerald-950/10 my-4" />

        {/* Navigation Options */}
        <nav className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("create");
              setIsMobileOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 transition-all w-full text-left cursor-pointer border-2 ${
              isCollapsed ? "md:justify-center" : ""
            } ${
              activeTab === "create"
                ? "bg-[#16a34a] text-white font-extrabold border-slate-900 shadow-[2px_2px_0px_0px_#000]"
                : "text-emerald-800 hover:text-[#16a34a] border-transparent font-medium"
            }`}
            style={{ borderRadius: "10px 4px 8px 3px/3px 8px 3px 10px" }}
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
            className={`flex items-center gap-3 px-3 py-2.5 transition-all w-full text-left cursor-pointer border-2 ${
              isCollapsed ? "md:justify-center" : ""
            } ${
              activeTab === "dashboard"
                ? "bg-[#16a34a] text-white font-extrabold border-slate-900 shadow-[2px_2px_0px_0px_#000]"
                : "text-emerald-800 hover:text-[#16a34a] border-transparent font-medium"
            }`}
            style={{ borderRadius: "10px 4px 8px 3px/3px 8px 3px 10px" }}
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
            className={`flex items-center gap-3 px-3 py-2.5 transition-all w-full text-left cursor-pointer border-2 ${
              isCollapsed ? "md:justify-center" : ""
            } ${
              activeTab === "myforms"
                ? "bg-[#16a34a] text-white font-extrabold border-slate-900 shadow-[2px_2px_0px_0px_#000]"
                : "text-emerald-800 hover:text-[#16a34a] border-transparent font-medium"
            }`}
            style={{ borderRadius: "10px 4px 8px 3px/3px 8px 3px 10px" }}
            title="My Forms"
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-sm whitespace-nowrap">My Forms</span>
            )}
          </button>
        </nav>

      </aside>

      {/* Main Content Region */}
      <div className="flex-1 p-6 mt-16 md:mt-0 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-gray-100 dark:border-neutral-900 select-none">
          {/* Left section: Workspace switcher & invite link */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-slate-900 rounded-lg text-sm text-slate-800 font-bold hover:bg-slate-50 transition-colors select-none cursor-pointer"
                style={{ borderRadius: "10px 4px 8px 3px/3px 8px 3px 10px" }}
              >
                <Folder className="w-4 h-4 text-[#16a34a]" />
                <span>{activeWorkspace?.name || "My Workspace"}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showWorkspaceDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-white border-2 border-slate-900 rounded-xl shadow-lg p-2 z-50 animate-fadeIn" style={{ borderRadius: "15px 15px 15px 15px" }}>
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Workspaces
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          setActiveWorkspace(ws);
                          setShowWorkspaceDropdown(false);
                        }}
                        className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          activeWorkspace?.id === ws.id
                            ? "bg-emerald-50 text-[#16a34a]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Folder className="w-3.5 h-3.5" />
                          <span className="truncate">{ws.name}</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase shrink-0">
                          {ws.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 my-2" />

                  <button
                    onClick={() => {
                      setShowCreateWorkspaceModal(true);
                      setShowWorkspaceDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[#16a34a] hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Workspace</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowJoinWorkspaceModal(true);
                      setShowWorkspaceDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Join with Code</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowInviteTeamModal(true)}
              className="text-xs font-bold text-[#16a34a] hover:text-[#15803d] transition-colors cursor-pointer"
            >
              + Invite Team
            </button>
            <span className="text-slate-300 text-xs select-none">|</span>
            <button
              onClick={() => setShowJoinWorkspaceModal(true)}
              className="text-xs font-bold text-[#16a34a] hover:text-[#15803d] transition-colors cursor-pointer"
            >
              + Join Workspace
            </button>
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

          <Link
            href={profileHref}
            className="flex items-center gap-2 rounded-full hover:scale-105 active:scale-95 transition-all"
            aria-label="User Profile"
            title="User Profile"
          >
            <img
              src="/leafform_profile_logo.png"
              alt="User Profile"
              className="w-14 h-14 rounded-full object-contain border border-slate-200 dark:border-neutral-800"
            />
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
              workspaceId={activeWorkspace?.id ?? ""}
              isReadOnly={activeWorkspace ? activeWorkspace.role === "read" : false}
              onInviteTeam={() => setShowInviteTeamModal(true)}
            />
          )}
        </div>
      </div>
      {/* Create Workspace Modal */}
      {showCreateWorkspaceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-2 border-slate-900 rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 relative text-slate-900" style={{ borderRadius: "20px 20px 20px 20px" }}>
            <button
              onClick={() => setShowCreateWorkspaceModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-black tracking-tight text-slate-900">Create New Workspace</h3>
              <p className="text-xs text-slate-500 font-medium">Create a workspace to group your forms and invite team members.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Marketing"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-[#16a34a] transition-all"
                  style={{ borderRadius: "10px 4px 8px 3px/3px 8px 3px 10px" }}
                />
              </div>
              <button
                onClick={() => {
                  if (newWorkspaceName.trim()) {
                    createWorkspaceMutation.mutate({ name: newWorkspaceName.trim() });
                  }
                }}
                disabled={createWorkspaceMutation.isPending || !newWorkspaceName.trim()}
                className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm shadow-md rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-900"
                style={{ borderRadius: "10px 4px 8px 3px/3px 8px 3px 10px" }}
              >
                {createWorkspaceMutation.isPending ? "Creating..." : "Create Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Workspace Modal */}
      {showJoinWorkspaceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-2 border-slate-900 rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 relative text-slate-900" style={{ borderRadius: "20px 20px 20px 20px" }}>
            <button
              onClick={() => setShowJoinWorkspaceModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-black tracking-tight text-slate-900">Join Workspace</h3>
              <p className="text-xs text-slate-500 font-medium">Enter the 12-character invitation code to join a workspace.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Invitation Code</label>
                <input
                  type="text"
                  placeholder="e.g. LF-ABCD-1234"
                  value={joinInviteCode}
                  onChange={(e) => setJoinInviteCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-[#16a34a] transition-all uppercase text-center tracking-wider font-mono font-bold"
                  style={{ borderRadius: "10px 4px 8px 3px/3px 8px 3px 10px" }}
                />
              </div>
              <button
                onClick={() => {
                  if (joinInviteCode.trim()) {
                    joinWorkspaceMutation.mutate({ inviteCode: joinInviteCode.trim() });
                  }
                }}
                disabled={joinWorkspaceMutation.isPending || !joinInviteCode.trim()}
                className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm shadow-md rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-900"
                style={{ borderRadius: "10px 4px 8px 3px/3px 8px 3px 10px" }}
              >
                {joinWorkspaceMutation.isPending ? "Joining..." : "Join Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Team Modal */}
      {showInviteTeamModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-2 border-slate-900 rounded-xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-5 relative text-slate-900" style={{ borderRadius: "20px 20px 20px 20px" }}>
            <button
              onClick={() => setShowInviteTeamModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-1 text-center">
              <h3 className="text-xl font-black tracking-tight text-slate-900">Workspace Invitation</h3>
              <p className="text-xs text-slate-500 font-medium">Invite colleagues to join <span className="font-bold text-[#16a34a]">{activeWorkspace?.name}</span></p>
            </div>

            <div className="space-y-4">
              {/* Copy Invitation Code Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="truncate flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Workspace Invite Code</label>
                  <input
                    type="text"
                    readOnly
                    value={activeWorkspace?.inviteCode || ""}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="text-sm font-mono font-black text-slate-800 bg-slate-100 border border-slate-200 rounded px-2.5 py-1.5 w-full text-center select-all focus:outline-none"
                    style={{ borderRadius: "6px" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopyInviteCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Workspace Members ({members?.length || 0})</span>
                </h4>
                
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {members?.map((member) => (
                    <div key={member.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{member.fullName}</span>
                        <span className="text-slate-400 block text-[10px]">{member.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {activeWorkspace?.role === "owner" && member.role !== "owner" ? (
                          <select
                            value={member.role}
                            onChange={(e) => {
                              updateRoleMutation.mutate({
                                workspaceId: activeWorkspace.id,
                                userId: member.id,
                                role: e.target.value as any,
                              });
                            }}
                            className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none"
                          >
                            <option value="read">Read Only</option>
                            <option value="write">Read & Write</option>
                          </select>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide bg-slate-100 text-slate-500">
                            {member.role}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </DefaultBackground>
  );
}

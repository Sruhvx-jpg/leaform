"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  MessageSquare,
  Mail,
  Calendar,
  Briefcase,
  ArrowRight,
  Share2,
  Trash2,
  Check,
  Loader2,
  X,
  AlertTriangle,
  BarChart3,
  Database,
} from "lucide-react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { AlertCircle, UserPlus } from "lucide-react";

interface FormsContentProps {
  activeSubTab: "create" | "myforms";
  setActiveSubTab: (tab: "create" | "myforms") => void;
  workspaceId: string;
  isReadOnly: boolean;
  onInviteTeam?: () => void;
}

export function FormsContent({ activeSubTab, setActiveSubTab, workspaceId, isReadOnly, onInviteTeam }: FormsContentProps) {
  const router = useRouter();
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  // Expanded analytics state
  const [expandedFormId, setExpandedFormId] = useState<string | null>(null);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<"analytics" | "responses">("analytics");

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.form.getUserForms.useQuery({ workspaceId }, {
    enabled: !!workspaceId,
    retry: false,
  });

  // Query submissions for the expanded form
  const { data: submissionsData, isLoading: isLoadingSubmissions } = trpc.form.getFormSubmissions.useQuery(
    { formId: expandedFormId || "" },
    { enabled: !!expandedFormId },
  );

  const deleteFormMutation = trpc.form.deleteForm.useMutation({
    onSuccess: () => {
      utils.form.getUserForms.invalidate({ workspaceId });
    },
  });

  const handleDeleteClick = (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    setFormToDelete(formId);
  };

  const confirmDeleteForm = async () => {
    if (!formToDelete) return;
    const formId = formToDelete;
    setFormToDelete(null);
    try {
      setDeletingFormId(formId);
      await deleteFormMutation.mutateAsync({ id: formId });
    } catch (err) {
      console.error("Error deleting form:", err);
    } finally {
      setDeletingFormId(null);
    }
  };

  const handleShareForm = (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/submit/${formId}`
        : `/submit/${formId}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setCopiedFormId(formId);
    setTimeout(() => setCopiedFormId(null), 2000);
  };

  const hasNoForms = !data || (data as unknown) === 0 || (Array.isArray(data) && data.length === 0);

  const preMadeLayouts = [
    {
      id: "layout-feedback",
      title: "Customer Feedback",
      description: "Collect ratings, comments, and satisfaction scores from your users.",
      icon: MessageSquare,
      badge: "Popular",
    },
    {
      id: "layout-contact",
      title: "Contact Us & Inquiry",
      description: "Standard contact form with name, email, topic, and message fields.",
      icon: Mail,
      badge: "Essential",
    },
    {
      id: "layout-event",
      title: "Event Registration",
      description: "RSVP form for webinars, workshops, or community meetups.",
      icon: Calendar,
      badge: "Event",
    },
    {
      id: "layout-job",
      title: "Job Application",
      description: "Collect applicant details, resumes, work experience, and cover letters.",
      icon: Briefcase,
      badge: "Career",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* Tab 1: Create Tab */}
      {activeSubTab === "create" && (
        <div className="w-full flex flex-col gap-6">
          {/* Start Blank Form Card */}
          <div
            onClick={() => {
              if (isReadOnly) {
                toast.error("Unauthorized: Read-only access to workspace.");
              } else {
                router.push(`/buildform?workspaceId=${workspaceId}`);
              }
            }}
            className="w-full p-8 rounded-xl bg-gradient-to-r from-[#092218] via-[#0e2c20] to-[#081a13] text-white border border-[#134e3b] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-2xl transition-all cursor-pointer group"
          >
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
                <Plus className="w-3.5 h-3.5" />
                <span>Blank Builder</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white transition-colors">
                Build a New Form from Scratch
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Start with a blank canvas. Drag and drop input fields, customize colors, fonts,
                styles, and set up multi-page logic flows.
              </p>
            </div>

             <button
              type="button"
              className="px-6 py-3.5 rounded-md bg-white text-[#092218] font-extrabold text-xs flex items-center gap-2 group-hover:bg-[#16a34a] group-hover:text-white active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span>Start Building</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pre-made Layouts Grid */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Pre-made Form Layouts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Pick a pre-configured template to jumpstart your form design.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {preMadeLayouts.map((layout) => {
                const IconComponent = layout.icon;
                return (
                   <div
                    key={layout.id}
                    onClick={() => {
                      if (isReadOnly) {
                        toast.error("Unauthorized: Read-only access to workspace.");
                      } else {
                        router.push(`/buildform?workspaceId=${workspaceId}`);
                      }
                    }}
                    className="p-5 rounded-xl bg-white border border-slate-200 hover:border-[#16a34a] hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 cursor-pointer group text-slate-900"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[#16a34a] dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-emerald-950/50 text-slate-600 dark:text-slate-300">
                          {layout.badge}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                        {layout.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">{layout.description}</p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-[#16a34a] pt-4 group-hover:gap-2 transition-all">
                      <span>Use Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: My Forms Tab */}
      {activeSubTab === "myforms" && (
        <div className="w-full flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Forms</h2>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">All forms created by your account.</p>
            </div>
          </div>

          {isLoading ? (
            /* Skeletal Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between min-h-[220px] animate-pulse"
                >
                  <div className="space-y-3">
                    <div className="h-6 bg-slate-200 rounded-md w-3/4" />
                    <div className="h-3.5 bg-slate-100 rounded w-full" />
                    <div className="h-3.5 bg-slate-100 rounded w-1/2" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="h-6 w-20 bg-slate-200 rounded-full" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-slate-100" />
                      <div className="w-8 h-8 rounded-md bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : hasNoForms ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0e0e0e] rounded-xl border border-slate-100 dark:border-neutral-800 text-center gap-4 min-h-[300px] shadow-sm">
              <div className="w-12 h-12 rounded-full border border-slate-200 text-slate-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-slate-700 font-medium text-base">No forms created in this workspace yet.</h3>
                <p className="text-xs text-slate-400 font-medium">What would you like to do?</p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isReadOnly) {
                      toast.error("Unauthorized: Read-only access");
                    } else {
                      router.push(`/buildform?workspaceId=${workspaceId}`);
                    }
                  }}
                  className="px-4 py-2 border-2 border-slate-900 rounded-lg bg-white text-slate-800 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                  style={{ borderRadius: "10px 4px 8px 3px/3px 8px 3px 10px" }}
                >
                  <Plus className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>Create Form</span>
                </button>
                <button
                  type="button"
                  onClick={onInviteTeam}
                  className="px-4 py-2 border-2 border-slate-900 rounded-lg bg-white text-slate-800 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                  style={{ borderRadius: "10px 4px 8px 3px/3px 8px 3px 10px" }}
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>Invite Team</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(data) &&
                data.map((form) => (
                   <div
                    key={form.id}
                    onClick={() => {
                      if (isReadOnly) {
                        toast.error("Unauthorized: Read-only access to forms");
                      } else {
                        router.push(`/buildform?id=${form.id}&workspaceId=${workspaceId}`);
                      }
                    }}
                    className={`p-6 rounded-xl bg-white border border-slate-200 hover:border-[#16a34a]/50 hover:shadow-md transition-all cursor-pointer group relative ${
                      expandedFormId === form.id
                        ? "col-span-full border-[#16a34a] shadow-md"
                        : "shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-[#16a34a] dark:group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {form.title}
                        </h3>

                        {/* Share and Delete Action Icons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleShareForm(e, form.id)}
                            className="p-2 rounded-md text-slate-400 hover:text-[#16a34a] hover:bg-emerald-50 dark:hover:bg-[#0e0e0e] transition-all cursor-pointer"
                            title="Share / Copy Submission Link"
                          >
                            {copiedFormId === form.id ? (
                              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={deletingFormId === form.id}
                            onClick={(e) => handleDeleteClick(e, form.id)}
                            className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer disabled:opacity-50"
                            title="Delete Form"
                          >
                            {deletingFormId === form.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {form.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {form.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-emerald-950/30 mt-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                            form.state === "published"
                              ? "bg-emerald-100 dark:bg-emerald-950/50 text-[#16a34a] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/30"
                              : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/30"
                          }`}
                        >
                          {form.state || "drafted"}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (expandedFormId === form.id) {
                              setExpandedFormId(null);
                            } else {
                              setExpandedFormId(form.id);
                              setActiveAnalyticsTab("analytics");
                            }
                          }}
                          className="px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-900 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {expandedFormId === form.id ? "Hide Analytics" : "View Analytics"}
                        </button>
                      </div>

                      <span className="text-[11px] font-bold text-[#16a34a] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Edit Form <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>

                    {/* Expanded Analytics & Submissions Section */}
                    {expandedFormId === form.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-6 pt-6 border-t border-slate-100 dark:border-neutral-800 select-text cursor-default animate-expand overflow-hidden"
                      >
                        {/* Tabs header */}
                        <div className="flex items-center gap-4 mb-5 border-b border-slate-100 dark:border-neutral-800 pb-2">
                          <button
                            type="button"
                            onClick={() => setActiveAnalyticsTab("analytics")}
                            className={`flex items-center gap-2 pb-2 text-xs font-bold transition-all border-b-2 -mb-[10px] cursor-pointer ${
                              activeAnalyticsTab === "analytics"
                                ? "border-[#16a34a] text-[#16a34a] dark:text-emerald-400"
                                : "border-transparent text-slate-400 dark:text-neutral-500 hover:text-slate-600"
                            }`}
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span>Analytics Summary</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveAnalyticsTab("responses")}
                            className={`flex items-center gap-2 pb-2 text-xs font-bold transition-all border-b-2 -mb-[10px] cursor-pointer ${
                              activeAnalyticsTab === "responses"
                                ? "border-[#16a34a] text-[#16a34a] dark:text-emerald-400"
                                : "border-transparent text-slate-400 dark:text-neutral-500 hover:text-slate-600"
                            }`}
                          >
                            <Database className="w-4 h-4" />
                            <span>Submissions ({submissionsData?.submissions?.length ?? 0})</span>
                          </button>
                        </div>

                        {/* Tab content */}
                        {isLoadingSubmissions ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#16a34a]" />
                          </div>
                        ) : !submissionsData || submissionsData.submissions.length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-400 dark:text-neutral-500">
                            No submissions received yet for this form.
                          </div>
                        ) : activeAnalyticsTab === "analytics" ? (
                          <div className="space-y-6">
                            {/* Basic Stats Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/30">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Total Submissions</span>
                                <div className="text-2xl font-black text-[#16a34a] dark:text-emerald-400 mt-1">
                                  {submissionsData.submissions.length}
                                </div>
                              </div>
                              <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/30">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Active Status</span>
                                <div className="text-sm font-extrabold text-slate-700 dark:text-neutral-300 mt-2 uppercase">
                                  {submissionsData.form.state}
                                </div>
                              </div>
                              <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/30">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Total Fields</span>
                                <div className="text-2xl font-black text-slate-700 dark:text-neutral-300 mt-1">
                                  {submissionsData.fields.length}
                                </div>
                              </div>
                              <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/30">
                                <span className="text-[10px] uppercase font-bold text-slate-400">First Response</span>
                                <div className="text-[11px] font-bold text-slate-600 dark:text-neutral-400 mt-2">
                                  {submissionsData.submissions.length > 0
                                    ? new Date(submissionsData.submissions[submissionsData.submissions.length - 1].submittedAt).toLocaleDateString()
                                    : "N/A"}
                                </div>
                              </div>
                            </div>

                            {/* Fields Summaries */}
                            <div className="space-y-4 pt-2">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Responses Summary by Field</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {submissionsData.fields
                                  .filter((f: any) => f.fieldType !== "statement")
                                  .map((field: any) => {
                                    const answersForField = submissionsData.submissions
                                      .map((sub: any) => sub.answers.find((a: any) => a.fieldId === field.id)?.value)
                                      .filter((v: any) => v !== undefined && v !== null && v !== "");

                                    let summaryEl = null;
                                    if (field.fieldType === "rating") {
                                      const ratings = answersForField.map(Number).filter((v: any) => !isNaN(v));
                                      const avg = ratings.length > 0 ? (ratings.reduce((a: any, b: any) => a + b, 0) / ratings.length).toFixed(1) : "N/A";
                                      summaryEl = (
                                        <div className="text-xs text-slate-600 dark:text-neutral-400">
                                          Average rating: <span className="font-extrabold text-[#16a34a] dark:text-emerald-400">{avg} / 5 stars</span> ({ratings.length} ratings)
                                        </div>
                                      );
                                    } else if (["multiple_choice", "dropdown", "yes_no"].includes(field.fieldType || "")) {
                                      const counts: Record<string, number> = {};
                                      answersForField.forEach((val: any) => {
                                        const strVal = String(val);
                                        counts[strVal] = (counts[strVal] || 0) + 1;
                                      });
                                      const sortedChoices = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]);
                                      summaryEl = (
                                        <div className="space-y-1">
                                          {sortedChoices.slice(0, 3).map(([choice, count]: [string, number]) => {
                                            const pct = ((count / answersForField.length) * 100).toFixed(0);
                                            return (
                                              <div key={choice} className="flex justify-between items-center text-[11px] text-slate-600 dark:text-neutral-400">
                                                <span className="truncate max-w-[180px]">{choice}</span>
                                                <span className="font-bold">{count} responses ({pct}%)</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      );
                                    } else {
                                      summaryEl = (
                                        <div className="space-y-1 max-h-[90px] overflow-y-auto">
                                          {answersForField.slice(0, 3).map((val: any, idx: number) => (
                                            <div key={idx} className="text-[11px] text-slate-600 dark:text-neutral-400 border-l-2 border-emerald-100 dark:border-emerald-900/30 pl-2 py-0.5 truncate">
                                              "{String(val)}"
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    }

                                    return (
                                      <div key={field.id} className="p-4 rounded-lg border border-slate-100 dark:border-neutral-900 bg-white dark:bg-[#121212] space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{field.label}</span>
                                          <span className="text-[9px] uppercase font-black px-1.5 py-0.5 bg-slate-100 dark:bg-neutral-800 text-slate-500 rounded">{field.fieldType}</span>
                                        </div>
                                        {summaryEl}
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                            {submissionsData.submissions.map((sub: any, index: number) => (
                              <div key={sub.id} className="p-4 rounded-lg border border-slate-100 dark:border-neutral-900 bg-slate-50/50 dark:bg-[#121212] space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-800">
                                  <span className="text-xs font-black text-slate-800 dark:text-white font-serif">Submission #{submissionsData.submissions.length - index}</span>
                                  <span className="text-[10px] font-medium text-slate-400">
                                    {new Date(sub.submittedAt).toLocaleString()}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {sub.answers.map((ans: any, idx: number) => (
                                    <div key={idx} className="space-y-1">
                                      <span className="block text-[10px] font-bold text-slate-400 truncate">{ans.label}</span>
                                      <span className="block text-xs font-medium text-slate-700 dark:text-neutral-300 break-words">
                                        {Array.isArray(ans.value) ? ans.value.join(", ") : String(ans.value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal Card */}
      {formToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-neutral-900 flex flex-col gap-5 text-center relative select-none">
            <button
              type="button"
              onClick={() => setFormToDelete(null)}
              className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-md bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Delete Form?</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Are you sure you want to permanently delete this form? This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={confirmDeleteForm}
                className="w-full py-3 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Form</span>
              </button>

              <button
                type="button"
                onClick={() => setFormToDelete(null)}
                className="w-full py-3 px-4 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
} from "lucide-react";
import { trpc } from "~/trpc/client";

interface FormsContentProps {
  activeSubTab: "create" | "myforms";
  setActiveSubTab: (tab: "create" | "myforms") => void;
}

export function FormsContent({ activeSubTab, setActiveSubTab }: FormsContentProps) {
  const router = useRouter();
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.form.getUserForms.useQuery(undefined, {
    retry: false,
  });

  const deleteFormMutation = trpc.form.deleteForm.useMutation({
    onSuccess: () => {
      utils.form.getUserForms.invalidate();
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
            onClick={() => router.push("/buildform")}
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
              className="px-6 py-3.5 rounded-md bg-white text-[#092218] font-extrabold text-xs flex items-center gap-2 group-hover:bg-emerald-400 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
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
                    onClick={() => router.push("/buildform")}
                    className="p-5 rounded-xl bg-white dark:bg-[#0e0e0e] border border-slate-200/90 dark:border-neutral-900 hover:border-[#0d5c41] dark:hover:border-[#34d399] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 cursor-pointer group text-slate-900 dark:text-white"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[#0d5c41] dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
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

                    <div className="flex items-center gap-1 text-xs font-semibold text-[#0d5c41] pt-4 group-hover:gap-2 transition-all">
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
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0e0e0e] rounded-xl border border-dashed border-slate-300 dark:border-neutral-800 text-center gap-3 min-h-[260px]">
              <div className="w-12 h-12 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[#0d5c41] dark:text-emerald-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">No forms created yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 max-w-xs">
                Switch to the Create tab to build a blank form or choose a template layout.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab("create")}
                className="mt-2 px-4 py-2 rounded-md bg-[#0d5c41] text-white font-medium text-xs flex items-center gap-1.5 hover:bg-[#065f46] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Go to Create</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(data) &&
                data.map((form) => (
                  <div
                    key={form.id}
                    onClick={() => router.push(`/buildform?id=${form.id}`)}
                    className="p-6 rounded-xl bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-neutral-900 shadow-xs hover:border-[#0d5c41]/50 hover:shadow-md transition-all cursor-pointer group relative"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-[#0d5c41] dark:group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {form.title}
                        </h3>

                        {/* Share and Delete Action Icons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleShareForm(e, form.id)}
                            className="p-2 rounded-md text-slate-400 hover:text-[#0d5c41] hover:bg-emerald-50 dark:hover:bg-[#0e0e0e] transition-all cursor-pointer"
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
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                          form.state === "published"
                            ? "bg-emerald-100 dark:bg-emerald-950/50 text-[#0d5c41] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/30"
                            : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/30"
                        }`}
                      >
                        {form.state || "drafted"}
                      </span>

                      <span className="text-[11px] font-bold text-[#0d5c41] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Edit Form <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
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

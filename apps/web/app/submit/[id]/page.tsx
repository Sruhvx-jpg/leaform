"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Star,
} from "lucide-react";
import { trpc } from "~/trpc/client";

export default function PublicSubmitFormPage() {
  const params = useParams();
  const formId = (params?.id as string) || "";
  const router = useRouter();

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setLoadingStage(1), 800);
    const timer2 = setTimeout(() => setLoadingStage(2), 1600);
    const timer3 = setTimeout(() => setLoadingStage(3), 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const stages = ["Fetching your form...", "Building your form...", "Styling your form..."];

  const { data, isLoading, isError, error } = trpc.form.getPublicForm.useQuery(
    { id: formId },
    { enabled: !!formId, retry: false },
  );

  const showLoader = (isLoading || loadingStage < 3) && !isError;

  const submitMutation = trpc.form.submitFormResponse.useMutation();

  const formTheme = useMemo(() => {
    const theme = data?.form?.theme || {};
    return {
      backgroundColor: theme.backgroundColor || "#092218",
      cardBackgroundColor: theme.cardBackgroundColor || "#0e2c20",
      textColor: theme.textColor || "#ffffff",
      accentColor: theme.accentColor || "#0d5c41",
      language: theme.language || "en",
      pages: theme.pages || [{ id: 1, title: "Page 1" }],
    };
  }, [data?.form?.theme]);

  const fields = data?.fields || [];

  const pages = useMemo(() => {
    if (formTheme.pages && formTheme.pages.length > 0) {
      return formTheme.pages;
    }
    return [{ id: 1, title: "Page 1" }];
  }, [formTheme.pages]);

  const currentPageFields = useMemo(() => {
    if (pages.length <= 1) return fields;
    const pageId = pages[activePageIndex]?.id || activePageIndex + 1;
    // Map fields by page offset if available or distribute evenly
    const fieldsPerPage = Math.ceil(fields.length / pages.length) || 1;
    const start = activePageIndex * fieldsPerPage;
    return fields.slice(start, start + fieldsPerPage);
  }, [fields, pages, activePageIndex]);

  const handleFieldChange = (fieldId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
  };

  const validatePage = (pageIdx: number): boolean => {
    const pageId = pages[pageIdx]?.id || pageIdx + 1;
    const fieldsPerPage = Math.ceil(fields.length / pages.length) || 1;
    const start = pageIdx * fieldsPerPage;
    const pageFields = fields.slice(start, start + fieldsPerPage);

    for (const field of pageFields) {
      const isReq = field.isRequired ?? field.required ?? false;
      if (isReq) {
        const val = answers[field.id];
        if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
          return false;
        }
      }
    }
    return true;
  };

  const handleNextPage = () => {
    setSubmissionError(null);
    if (!validatePage(activePageIndex)) {
      setSubmissionError("Please answer all required questions on this page.");
      return;
    }
    setActivePageIndex((p) => Math.min(pages.length - 1, p + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    // Validate all pages
    for (let i = 0; i < pages.length; i++) {
      if (!validatePage(i)) {
        setActivePageIndex(i); // jump to the page with missing required fields
        setSubmissionError("Please fill out all required fields before submitting.");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const formattedAnswers = fields.map((field: any) => ({
        fieldId: field.id,
        label: field.label,
        value: answers[field.id] !== undefined ? String(answers[field.id]).trim() : "",
      }));

      await submitMutation.mutateAsync({
        formId,
        answers: formattedAnswers,
      });

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmissionError(err?.message || "Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showLoader) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6 text-white select-none relative overflow-hidden">
        {/* Radial ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="w-full max-w-xs flex flex-col gap-6 relative z-10">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-emerald-400 tracking-wider uppercase text-center">
              Preparing Experience
            </h3>
            <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">
              LeafForm Interactive
            </p>
          </div>

          {/* Checklist of stages */}
          <div className="space-y-4 py-2">
            {stages.map((stageText, idx) => {
              const isCompleted = loadingStage > idx;
              const isActive = loadingStage === idx;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 transition-all duration-500 ${
                    isActive ? "scale-[1.02] translate-x-1" : ""
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-emerald-300 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-950/40 bg-emerald-950/20" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold tracking-wide transition-colors duration-500 ${
                      isActive
                        ? "text-white font-extrabold"
                        : isCompleted
                          ? "text-emerald-500/65 line-through decoration-emerald-800/20"
                          : "text-slate-500/40"
                    }`}
                  >
                    {stageText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Glowing Gradient Progress Bar */}
          <div className="w-full bg-emerald-950/40 rounded-full h-1.5 overflow-hidden border border-emerald-900/10 mt-2">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              style={{ width: `${Math.min(((loadingStage + 1) / 3) * 100, 100)}%` }}
            />
          </div>

          <span className="text-[9px] text-emerald-600/50 uppercase tracking-widest text-center font-bold">
            conversational data logic active
          </span>
        </div>
      </main>
    );
  }

  if (isError || !data?.form) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6 text-white select-none">
        <div className="max-w-md w-full bg-neutral-950 border border-neutral-900 p-8 rounded-xl text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Form Not Found</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            This form link may be invalid, closed, or no longer available.
          </p>
        </div>
      </main>
    );
  }

  if (isSubmitted) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-6 select-none transition-colors"
        style={{ backgroundColor: formTheme.backgroundColor }}
      >
        <div
          className="max-w-lg w-full p-8 sm:p-10 rounded-xl border shadow-2xl text-center space-y-6 animate-fadeIn"
          style={{
            backgroundColor: formTheme.cardBackgroundColor,
            color: formTheme.textColor,
            borderColor: `${formTheme.accentColor}40`,
          }}
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Response Submitted!</h2>
            <p className="text-xs opacity-80 leading-relaxed">
              Thank you for completing <span className="font-bold">{data.form.title}</span>. Your
              answers have been safely recorded.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setAnswers({});
                setActivePageIndex(0);
              }}
              className="px-5 py-2.5 rounded-md text-xs font-extrabold text-white transition-all cursor-pointer shadow-md hover:opacity-90"
              style={{ backgroundColor: formTheme.accentColor }}
            >
              Submit Another Response
            </button>
            <span className="text-[10px] opacity-40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Powered by LeafForm
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 select-none transition-colors py-12"
      style={{ backgroundColor: formTheme.backgroundColor }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl p-6 sm:p-10 rounded-xl border shadow-2xl flex flex-col gap-6"
        style={{
          backgroundColor: formTheme.cardBackgroundColor,
          color: formTheme.textColor,
          borderColor: `${formTheme.accentColor}35`,
        }}
      >
        {/* Header Title */}
        <div className="text-center space-y-1.5 pb-4 border-b border-white/10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{data.form.title}</h1>
          {data.form.description && (
            <p className="text-xs opacity-70 leading-relaxed max-w-md mx-auto">
              {data.form.description}
            </p>
          )}
          {pages.length > 1 && (
            <div className="inline-block mt-2 px-3 py-1 rounded-md text-[10px] font-extrabold bg-white/10 text-white">
              Page {activePageIndex + 1} of {pages.length}
            </div>
          )}
        </div>

        {/* Error Banner */}
        {submissionError && (
          <div className="p-3.5 rounded-md bg-red-500/20 text-red-200 border border-red-500/30 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{submissionError}</span>
          </div>
        )}

        {/* Fields List */}
        <div className="space-y-6 min-h-[160px]">
          {currentPageFields.length === 0 ? (
            <p className="text-xs opacity-60 text-center py-6">No questions on this page.</p>
          ) : (
            currentPageFields.map((field: any, idx: number) => {
              const val = answers[field.id] || "";
              const fType = field.fieldType || field.type || "short_text";
              const isReq = field.isRequired ?? field.required ?? false;

              return (
                <div
                  key={field.id || idx}
                  className="space-y-2.5 p-4 rounded-md bg-white/5 border border-white/10"
                >
                  <label className="block text-xs sm:text-sm font-bold tracking-wide">
                    {field.label || `Question ${idx + 1}`}
                    {isReq && <span className="text-red-400 font-bold ml-1">*</span>}
                  </label>

                  {field.description && (
                    <p className="text-[11px] opacity-60 leading-snug">{field.description}</p>
                  )}

                  {/* Render Input by Type */}
                  {fType === "long_text" || fType === "rich_text" ? (
                    <textarea
                      rows={3}
                      value={val}
                      required={isReq}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder || "Type your response..."}
                      className="w-full px-3.5 py-2.5 text-xs rounded-md bg-white/10 border border-white/20 focus:outline-none focus:border-emerald-400 transition-all"
                    />
                  ) : fType === "multiple_choice" || fType === "dropdown" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(field.options || ["Option 1", "Option 2"]).map(
                        (opt: string, oIdx: number) => {
                          const isSelected = val === opt;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleFieldChange(field.id, opt);
                              }}
                              className={`px-3.5 py-2.5 rounded-md border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-500/20 border-emerald-400 text-white"
                                  : "bg-white/5 border-white/15 hover:bg-white/10 text-white/80"
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  ) : fType === "rating" || fType === "nps" || fType === "opinion_scale" ? (
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleFieldChange(field.id, star);
                          }}
                          className={`p-2 rounded-md transition-all cursor-pointer ${
                            Number(val) >= star
                              ? "bg-amber-400 text-slate-900 shadow-md scale-105"
                              : "bg-white/10 text-white/40 hover:bg-white/20"
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={
                        fType === "email"
                          ? "email"
                          : fType === "number"
                            ? "number"
                            : fType === "phone_number" || fType === "phone"
                              ? "tel"
                              : fType === "url"
                                ? "url"
                                : fType === "date"
                                  ? "date"
                                  : "text"
                      }
                      value={val}
                      required={isReq}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder || "Your answer..."}
                      className="w-full px-3.5 py-2.5 text-xs rounded-md bg-white/10 border border-white/20 focus:outline-none focus:border-emerald-400 transition-all"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation & Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {pages.length > 1 && (
            <button
              type="button"
              disabled={activePageIndex === 0}
              onClick={(e) => {
                e.preventDefault();
                setActivePageIndex((p) => Math.max(0, p - 1));
              }}
              className="px-4 py-2 rounded-md text-xs font-bold border border-white/20 text-white/80 disabled:opacity-30 flex items-center gap-1 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          )}

          {activePageIndex < pages.length - 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleNextPage();
              }}
              style={{ backgroundColor: formTheme.accentColor }}
              className="ml-auto px-5 py-2.5 rounded-md text-xs font-extrabold text-white flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer shadow-md"
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: formTheme.accentColor }}
              className="ml-auto px-6 py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Response</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}

"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  const changePage = useCallback((targetIndex: number) => {
    setActivePageIndex(targetIndex);
  }, []);
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
      accentColor: theme.accentColor || "#16a34a",
      language: theme.language || "en",
      pages: theme.pages || [{ id: 1, title: "Page 1" }],
    };
  }, [data?.form?.theme]);

  const isDark = useMemo(() => {
    // 1. Try card background color first
    let bg = (formTheme.cardBackgroundColor || "").trim().toLowerCase();
    if (bg === "transparent" || !bg) {
      bg = (formTheme.backgroundColor || "").trim().toLowerCase();
    }
    if (bg === "white" || bg === "#ffffff" || bg === "#fff") return false;
    if (bg === "black" || bg === "#000000" || bg === "#000") return true;

    // Helper to calculate HSP luminance
    const getLuminance = (r: number, g: number, b: number) => {
      return Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    };

    // Hex parsing
    if (bg.startsWith("#")) {
      const color = bg.substring(1);
      let r = 0,
        g = 0,
        b = 0;
      if (color.length === 6) {
        r = parseInt(color.substring(0, 2), 16);
        g = parseInt(color.substring(2, 4), 16);
        b = parseInt(color.substring(4, 6), 16);
      } else if (color.length === 3) {
        r = parseInt(color.charAt(0) + color.charAt(0), 16);
        g = parseInt(color.charAt(1) + color.charAt(1), 16);
        b = parseInt(color.charAt(2) + color.charAt(2), 16);
      }
      return getLuminance(r, g, b) < 127.5;
    }

    // RGB/RGBA parsing
    const rgbMatch = bg.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]!, 10);
      const g = parseInt(rgbMatch[2]!, 10);
      const b = parseInt(rgbMatch[3]!, 10);
      return getLuminance(r, g, b) < 127.5;
    }

    // 2. Fallback: check text color. If text color is dark, background is light
    const text = (formTheme.textColor || "").trim().toLowerCase();
    if (text === "white" || text === "#ffffff" || text === "#fff") return true;
    if (text === "black" || text === "#000000" || text === "#000") return false;
    if (text.startsWith("#")) {
      const color = text.substring(1);
      let r = 0,
        g = 0,
        b = 0;
      if (color.length === 6) {
        r = parseInt(color.substring(0, 2), 16);
        g = parseInt(color.substring(2, 4), 16);
        b = parseInt(color.substring(4, 6), 16);
      } else if (color.length === 3) {
        r = parseInt(color.charAt(0) + color.charAt(0), 16);
        g = parseInt(color.charAt(1) + color.charAt(1), 16);
        b = parseInt(color.charAt(2) + color.charAt(2), 16);
      }
      return getLuminance(r, g, b) >= 127.5;
    }

    return true;
  }, [formTheme.cardBackgroundColor, formTheme.backgroundColor, formTheme.textColor]);

  const fields = data?.fields || [];

  const pages = useMemo(() => {
    if (formTheme.pages && formTheme.pages.length > 0) {
      return formTheme.pages;
    }
    return [{ id: 1, title: "Page 1" }];
  }, [formTheme.pages]);

  const getPageFields = useCallback((pIdx: number) => {
    if (pages.length <= 1) return fields;
    return fields.filter((field: any) => {
      const pageIndex = Math.floor((field.orderIndex ?? 0) / 100);
      return pageIndex === pIdx;
    });
  }, [fields, pages]);

  const handleFieldChange = (fieldId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
  };

  const validatePage = useCallback((pageIdx: number): boolean => {
    const pageFields = getPageFields(pageIdx);

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
  }, [getPageFields, answers]);

  const handleNextPage = () => {
    setSubmissionError(null);
    if (!validatePage(activePageIndex)) {
      setSubmissionError("Please answer all required questions on this page.");
      return;
    }
    changePage(activePageIndex + 1);
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
        className="w-full max-w-xl p-6 sm:p-10 rounded-xl border shadow-2xl flex flex-col gap-6 transition-colors duration-300 overflow-hidden"
        style={{
          backgroundColor: formTheme.cardBackgroundColor,
          color: formTheme.textColor,
          borderColor: `${formTheme.accentColor}35`,
        }}
      >
        {/* Pages Slider Wrapper */}
        <div className="w-full overflow-hidden relative flex-1">
          <div
            className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex"
            style={{
              transform: `translateX(-${(activePageIndex * 100) / pages.length}%)`,
              width: `${pages.length * 100}%`,
            }}
          >
            {pages.map((page: any, pIdx: number) => {
              const pageFields = getPageFields(pIdx);

              return (
                <div
                  key={page.id || pIdx}
                  className="w-full shrink-0 flex flex-col gap-6"
                  style={{ width: `${100 / pages.length}%` }}
                >
                  {/* Header Title */}
                  <div
                    className={`text-center space-y-1.5 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-200/80"}`}
                  >
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{data.form.title}</h1>
                    {data.form.description && (
                      <p className="text-xs opacity-70 leading-relaxed max-w-md mx-auto">
                        {data.form.description}
                      </p>
                    )}
                    {pages.length > 1 && (
                      <div
                        className={`inline-block mt-2 px-3 py-1 rounded-md text-[10px] font-extrabold ${
                          isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        Page {pIdx + 1} of {pages.length}
                      </div>
                    )}
                  </div>

                  {/* Error Banner */}
                  {submissionError && activePageIndex === pIdx && (
                    <div className="p-3.5 rounded-md bg-red-500/20 text-red-200 border border-red-500/30 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{submissionError}</span>
                    </div>
                  )}

                  {/* Fields List */}
                  <div className="space-y-6 min-h-[160px]">
                    {pageFields.length === 0 ? (
                      <p className="text-xs opacity-60 text-center py-6">No questions on this page.</p>
                    ) : (
                      pageFields.map((field: any, idx: number) => {
                        const val = answers[field.id] || "";
                        const fType = field.fieldType || field.type || "short_text";
                        const isReq = field.isRequired ?? field.required ?? false;

                        return (
                          <div
                            key={field.id || idx}
                            className="w-full py-6 space-y-4 transition-all"
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
                                className={`w-full px-3.5 py-2.5 text-xs rounded-md border focus:outline-none focus:border-emerald-400 transition-all ${
                                  isDark
                                    ? "bg-white/10 border-white/20 text-white placeholder-white/30"
                                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-emerald-500/20"
                                }`}
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
                                            ? isDark
                                              ? "bg-emerald-500/20 border-emerald-400 text-white"
                                              : "bg-emerald-50/80 border-emerald-500 text-emerald-800"
                                            : isDark
                                              ? "bg-white/5 border-white/15 hover:bg-white/10 text-white/80"
                                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                                        }`}
                                      >
                                        <span>{opt}</span>
                                        {isSelected && (
                                          <CheckCircle2
                                            className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                                          />
                                        )}
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            ) : fType === "rating" ? (
                              <div className="flex items-center gap-1.5 pt-1">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const active = Number(val) >= star;
                                  return (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleFieldChange(field.id, star);
                                      }}
                                      className="p-1 rounded-md hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                                    >
                                      <Star
                                        className={`w-7 h-7 transition-colors ${
                                          active
                                            ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                                            : isDark
                                              ? "text-white/20 hover:text-amber-300"
                                              : "text-slate-300 hover:text-amber-400"
                                        }`}
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                            ) : fType === "nps" || fType === "opinion_scale" ? (
                              <div className="flex items-center gap-1 overflow-x-auto py-1">
                                {Array.from({ length: 11 }, (_, i) => i).map((num) => {
                                  const isSelected = val === num || Number(val) === num;
                                  return (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleFieldChange(field.id, num);
                                      }}
                                      style={
                                        isSelected
                                          ? {
                                              backgroundColor: formTheme.accentColor,
                                              borderColor: formTheme.accentColor,
                                              color: "#ffffff",
                                            }
                                          : {}
                                      }
                                      className={`w-9 h-9 rounded-md border text-xs font-black flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                        isSelected
                                          ? "shadow-md scale-105"
                                          : isDark
                                            ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                                            : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:border-slate-300"
                                      }`}
                                    >
                                      {num}
                                    </button>
                                  );
                                })}
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
                                className={`w-full px-3.5 py-2.5 text-xs rounded-md border focus:outline-none focus:border-emerald-400 transition-all ${
                                  isDark
                                    ? "bg-white/10 border-white/20 text-white placeholder-white/30"
                                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-emerald-500/20"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation & Submit Button */}
        <div
          className={`flex items-center justify-between pt-4 border-t ${isDark ? "border-white/10" : "border-slate-200/80"}`}
        >
          {pages.length > 1 && (
            <button
              type="button"
              disabled={activePageIndex === 0}
              onClick={(e) => {
                e.preventDefault();
                changePage(activePageIndex - 1);
              }}
              className={`px-4 py-2 rounded-md text-xs font-bold border disabled:opacity-30 flex items-center gap-1 transition-colors ${
                isDark
                  ? "border-white/20 text-white/80 hover:bg-white/10"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
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
              className="ml-auto px-5 py-2.5 rounded-md text-xs font-extrabold text-white flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
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

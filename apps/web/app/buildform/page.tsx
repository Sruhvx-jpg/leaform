"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Pencil,
  Eye,
  LayoutGrid,
  Settings,
  Plus,
  Trash2,
  FileText,
  AlignLeft,
  CheckSquare,
  Mail,
  Phone,
  Hash,
  Calendar,
  Upload,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ListPlus,
  X,
  Edit3,
  MapPin,
  Globe,
  Sliders,
  ChevronDown,
  Image,
  Clock,
  Star,
  MessageSquare,
  BarChart3,
  SlidersHorizontal,
  ToggleLeft,
  Info,
  Grid,
  ListOrdered,
  PenTool,
  Palette,
  ShieldCheck,
  Lock,
  Loader2,
  GripVertical,
  Type,
  Check,
  CheckCircle2,
  Sparkles,
  Copy,
  ExternalLink,
  Bold,
  Italic,
  Underline,
  type LucideIcon,
} from "lucide-react";
import { trpc } from "~/trpc/client";

export const AVAILABLE_FONTS = [
  // Pixel & Retro Gaming Fonts
  { name: "Press Start 2P (Pixel)", value: "Press Start 2P", family: "'Press Start 2P', monospace" },
  { name: "VT323 (Retro Terminal)", value: "VT323", family: "'VT323', monospace" },
  { name: "Silkscreen (Pixel)", value: "Silkscreen", family: "'Silkscreen', monospace" },

  // Elegant Serif & Luxury
  { name: "Playfair Display", value: "Playfair Display", family: "'Playfair Display', serif" },
  { name: "Cinzel Decorative", value: "Cinzel Decorative", family: "'Cinzel Decorative', serif" },
  { name: "Cormorant Garamond", value: "Cormorant Garamond", family: "'Cormorant Garamond', serif" },
  { name: "EB Garamond", value: "EB Garamond", family: "'EB Garamond', serif" },
  { name: "Merriweather", value: "Merriweather", family: "'Merriweather', serif" },
  { name: "Lora", value: "Lora", family: "'Lora', serif" },

  // Handwriting & Script
  { name: "Caveat", value: "Caveat", family: "'Caveat', cursive" },
  { name: "Great Vibes", value: "Great Vibes", family: "'Great Vibes', cursive" },
  { name: "Sacramento", value: "Sacramento", family: "'Sacramento', cursive" },
  { name: "Pacifico", value: "Pacifico", family: "'Pacifico', cursive" },
  { name: "Dancing Script", value: "Dancing Script", family: "'Dancing Script', cursive" },

  // Modern Sans-Serif
  { name: "Inter", value: "Inter", family: "var(--font-inter), 'Inter', sans-serif" },
  { name: "Roboto", value: "Roboto", family: "'Roboto', sans-serif" },
  { name: "Outfit", value: "Outfit", family: "'Outfit', sans-serif" },
  { name: "Plus Jakarta", value: "Plus Jakarta Sans", family: "'Plus Jakarta Sans', sans-serif" },
  { name: "Poppins", value: "Poppins", family: "'Poppins', sans-serif" },
  { name: "Montserrat", value: "Montserrat", family: "'Montserrat', sans-serif" },
  { name: "Space Grotesk", value: "Space Grotesk", family: "'Space Grotesk', sans-serif" },

  // Monospace & Tech
  { name: "Fira Code", value: "Fira Code", family: "'Fira Code', monospace" },
  { name: "JetBrains Mono", value: "JetBrains Mono", family: "'JetBrains Mono', monospace" },
  { name: "Space Mono", value: "Space Mono", family: "'Space Mono', monospace" },
];

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English (US)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "zh", name: "Chinese (中文)" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "pt", name: "Portuguese (Português)" },
];

export function parseFontFamily(fontName?: string): string {
  if (!fontName) return "var(--font-inter), 'Inter', sans-serif";
  const found = AVAILABLE_FONTS.find(
    (f) => f.value.toLowerCase() === fontName.toLowerCase()
  );
  return found ? found.family : fontName;
}

// Icon lookup map – maps backend icon string names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  AlignLeft,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Globe,
  Hash,
  Sliders,
  CheckSquare,
  ChevronDown,
  Image,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  BarChart3,
  SlidersHorizontal,
  ToggleLeft,
  Info,
  Grid,
  ListOrdered,
  PenTool,
  CreditCard,
  Palette,
  ShieldCheck,
  Lock,
  Upload,
};

export interface FieldStyle {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
}

export interface FormTheme {
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  cardBackgroundColor: string;
  language?: string;
}

export const PRESET_THEMES: FormTheme[] = [
  {
    name: "LeafForm Clean",
    backgroundColor: "#f8fafc",
    cardBackgroundColor: "#ffffff",
    textColor: "#0f172a",
    accentColor: "#0d5c41",
  },
  {
    name: "Deep Forest",
    backgroundColor: "#092218",
    cardBackgroundColor: "#0e2c20",
    textColor: "#ffffff",
    accentColor: "#34d399",
  },
  {
    name: "Soft Peach",
    backgroundColor: "#fff7ed",
    cardBackgroundColor: "#ffffff",
    textColor: "#431407",
    accentColor: "#ea580c",
  },
  {
    name: "Nordic Ice",
    backgroundColor: "#f0f9ff",
    cardBackgroundColor: "#ffffff",
    textColor: "#0c4a6e",
    accentColor: "#0284c7",
  },
];

export const COLOR_SWATCHES = [
  "#092218", // Deep Forest
  "#0d5c41", // Leaf Green
  "#134e3b", // Forest Dark
  "#065f46", // Dark Emerald
  "#34d399", // Emerald Light
  "#10b981", // Emerald
  "#0284c7", // Sky Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ea580c", // Orange
  "#eab308", // Yellow
  "#475569", // Slate
  "#0f172a", // Dark Slate
  "#ffffff", // White
  "#f8fafc", // Off White
];

export function ColorRingPicker({
  color,
  onChange,
  label,
}: {
  color: string;
  onChange: (newColor: string) => void;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Convert Hex to HSL for the Hue ring calculation
  const hexToHsl = (hex: string) => {
    let c = (hex || "#0d5c41").replace("#", "");
    if (c.length === 3) c = c.split("").map((x) => x + x).join("");
    const num = parseInt(c, 16);
    if (isNaN(num)) return { h: 160, s: 75, l: 20 };
    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const colorVal = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * colorVal)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const { h, s, l } = hexToHsl(color || "#0d5c41");

  const handleHueRingClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    const newHue = Math.round(angle);
    onChange(hslToHex(newHue, s > 10 ? s : 75, l > 10 && l < 90 ? l : 40));
  };

  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      {/* Trigger Button with Ring Preview Swatch */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200 transition-all cursor-pointer group"
        title={label || "Pick color"}
      >
        <div
          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs ring-2 ring-offset-1 ring-emerald-500/30 group-hover:scale-110 transition-transform shrink-0"
          style={{ backgroundColor: color || "#0d5c41" }}
        />
        {label && <span className="text-[9px] font-bold text-slate-700">{label}</span>}
      </button>

      {/* Popover Color Wheel Ring Picker */}
      {isOpen && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute top-full left-0 mt-2 z-50 w-64 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-4 shadow-2xl flex flex-col gap-3.5 animate-fadeIn select-none"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#0d5c41]" />
              Color Ring Palette
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hue Color Ring Wheel */}
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={handleHueRingClick}
              className="relative w-36 h-36 rounded-full cursor-crosshair shadow-inner flex items-center justify-center p-3 border-4 border-white shadow-md transition-transform hover:scale-105"
              style={{
                background:
                  "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
              }}
            >
              {/* Inner cutout hole to make it a ring */}
              <div
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center border border-slate-200 shadow-inner"
                style={{ backgroundColor: color || "#0d5c41" }}
              >
                <span
                  className={`text-[10px] font-extrabold uppercase font-mono px-2 py-0.5 rounded-full ${
                    l > 60 ? "text-slate-900 bg-white/80" : "text-white bg-black/40"
                  }`}
                >
                  {color}
                </span>
              </div>

              {/* Ring Cursor Indicator Thumb */}
              <div
                className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg pointer-events-none ring-2 ring-black/40"
                style={{
                  backgroundColor: color,
                  left: `calc(50% + ${Math.cos((h * Math.PI) / 180) * 54}px - 10px)`,
                  top: `calc(50% + ${Math.sin((h * Math.PI) / 180) * 54}px - 10px)`,
                }}
              />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Click or drag around color ring
            </span>
          </div>

          {/* Preset Swatches Grid with Selection Rings */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
              Preset Palette
            </span>
            <div className="grid grid-cols-8 gap-1.5">
              {COLOR_SWATCHES.map((swatch) => {
                const isSelected = color?.toLowerCase() === swatch.toLowerCase();
                return (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => onChange(swatch)}
                    className={`w-5 h-5 rounded-full border border-slate-300 transition-all cursor-pointer relative ${
                      isSelected
                        ? "ring-2 ring-offset-1 ring-[#0d5c41] scale-110 shadow-xs"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: swatch }}
                    title={swatch}
                  />
                );
              })}
            </div>
          </div>

          {/* Hex Code Direct Input */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-600">Hex Code:</span>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={color || "#0d5c41"}
                onChange={(e) => onChange(e.target.value)}
                className="w-24 px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none uppercase"
              />
              <input
                type="color"
                value={color || "#0d5c41"}
                onChange={(e) => onChange(e.target.value)}
                className="w-6 h-6 rounded-md border border-slate-200 cursor-pointer overflow-hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CanvasNode {
  id: string;
  label: string;
  description?: string;
  type: string;
  x: number;
  y: number;
  font?: string;
  required?: boolean;
  style?: FieldStyle;
}

interface FormFieldItem {
  id: string;
  type: string;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  font?: string;
  options?: string[];
  style?: FieldStyle;
}

interface FormPage {
  id: number;
  title: string;
  fields: FormFieldItem[];
}

const DEFAULT_FIELD_TYPES = [
  { type: "short_text", name: "Short Text", category: "Text", icon: "FileText" },
  { type: "long_text", name: "Long Text", category: "Text", icon: "AlignLeft" },
  { type: "rich_text", name: "Rich Text Editor", category: "Text", icon: "Edit3" },
  { type: "email", name: "Email Address", category: "Contact", icon: "Mail" },
  { type: "phone_number", name: "Phone Number", category: "Contact", icon: "Phone" },
  { type: "address", name: "Street Address", category: "Contact", icon: "MapPin" },
  { type: "url", name: "Website URL", category: "Contact", icon: "Globe" },
  { type: "number", name: "Number Input", category: "Choice", icon: "Hash" },
  { type: "slider", name: "Range Slider", category: "Choice", icon: "Sliders" },
  { type: "multiple_choice", name: "Multiple Choice", category: "Choice", icon: "CheckSquare" },
  { type: "checkboxes", name: "Checkboxes", category: "Choice", icon: "CheckSquare" },
  { type: "dropdown", name: "Dropdown Select", category: "Choice", icon: "ChevronDown" },
  { type: "picture_choice", name: "Picture Choice", category: "Choice", icon: "Image" },
  { type: "date", name: "Date Picker", category: "Date & Time", icon: "Calendar" },
  { type: "time", name: "Time Picker", category: "Date & Time", icon: "Clock" },
  { type: "rating", name: "Star Rating", category: "Feedback", icon: "Star" },
  { type: "review", name: "Customer Review", category: "Feedback", icon: "MessageSquare" },
  { type: "nps", name: "Net Promoter Score (NPS)", category: "Feedback", icon: "BarChart3" },
  { type: "opinion_scale", name: "Opinion Scale", category: "Feedback", icon: "SlidersHorizontal" },
  { type: "yes_no", name: "Yes / No Toggle", category: "Choice", icon: "ToggleLeft" },
  { type: "statement", name: "Statement Block", category: "Layout", icon: "Info" },
  { type: "matrix", name: "Matrix Grid", category: "Advanced", icon: "Grid" },
  { type: "ranking", name: "Drag & Drop Ranking", category: "Advanced", icon: "ListOrdered" },
  { type: "signature", name: "E-Signature", category: "Advanced", icon: "PenTool" },
  { type: "payment", name: "Payment Integration", category: "Advanced", icon: "CreditCard" },
  { type: "color_picker", name: "Color Picker", category: "Advanced", icon: "Palette" },
  { type: "terms_consent", name: "Terms & Consent", category: "Legal", icon: "ShieldCheck" },
  { type: "captcha", name: "CAPTCHA Verification", category: "Security", icon: "Lock" },
];

function TypeformFieldRenderer({
  field,
  index,
  formTheme,
}: {
  field: FormFieldItem;
  index: number;
  formTheme?: FormTheme;
}) {
  const [value, setValue] = useState<any>("");

  const cardBg =
    field.style?.backgroundColor ||
    formTheme?.cardBackgroundColor ||
    "#ffffff";
  const textColor =
    field.style?.textColor || formTheme?.textColor || "#0f172a";
  const accentColor =
    field.style?.accentColor || formTheme?.accentColor || "#0d5c41";

  const fontStyle = {
    fontFamily: parseFontFamily(field.font),
    backgroundColor: cardBg,
    color: textColor,
    borderColor: `${accentColor}35`,
  };
  const letterBadges = ["A", "B", "C", "D", "E", "F"];
  const defaultChoices = field.options || [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
  ];

  return (
    <div
      className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4 text-left group"
      style={fontStyle}
    >
      {/* Typeform Question Header: Number + Title + Required */}
      <div className="space-y-1">
        <div className="flex items-start gap-2.5">
          <span className="text-xs font-black text-[#0d5c41] bg-emerald-50 px-2 py-0.5 rounded-lg shrink-0 flex items-center gap-1 border border-emerald-100 mt-0.5">
            <span>{index + 1}</span>
            <ChevronRight className="w-3 h-3 text-[#0d5c41]" />
          </span>
          <div className="flex-1">
            <h3
              className="text-sm sm:text-base font-extrabold tracking-tight leading-snug"
              style={{ color: textColor }}
            >
              {field.label}{" "}
              {field.required && (
                <span className="text-red-500 font-bold ml-0.5">*</span>
              )}
            </h3>
            {field.description && (
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                {field.description}
              </p>
            )}
          </div>
          {field.font && (
            <span className="text-[9px] font-semibold text-[#0d5c41] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
              {field.font}
            </span>
          )}
        </div>
      </div>

      {/* Typeform Specific Field Inputs */}
      {["multiple_choice", "checkboxes", "dropdown", "picture_choice"].includes(
        field.type
      ) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {defaultChoices.map((choice, i) => {
            const letter = letterBadges[i % letterBadges.length];
            const isSelected = value === choice;
            return (
              <button
                key={choice}
                type="button"
                onClick={() => setValue(choice)}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50/90 border-[#0d5c41] text-[#0d5c41] shadow-xs ring-1 ring-[#0d5c41]/30"
                    : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center border transition-colors ${
                    isSelected
                      ? "bg-[#0d5c41] text-white border-[#0d5c41]"
                      : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  {letter}
                </span>
                <span className="truncate">{choice}</span>
              </button>
            );
          })}
        </div>
      ) : field.type === "yes_no" ? (
        <div className="flex items-center gap-3 pt-1">
          {["Yes", "No"].map((opt) => {
            const isSelected = value === opt;
            const keyLetter = opt.charAt(0);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setValue(opt)}
                className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50/90 border-[#0d5c41] text-[#0d5c41] shadow-xs ring-1 ring-[#0d5c41]/30"
                    : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    isSelected
                      ? "bg-[#0d5c41] text-white border-[#0d5c41]"
                      : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  {keyLetter}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      ) : field.type === "rating" ? (
        <div className="flex items-center gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = (value || 0) >= star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setValue(star)}
                className="p-1 rounded-xl hover:scale-110 transition-transform cursor-pointer"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    active
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300 hover:text-amber-300"
                  }`}
                />
              </button>
            );
          })}
        </div>
      ) : ["nps", "opinion_scale"].includes(field.type) ? (
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {Array.from({ length: 11 }, (_, i) => i).map((num) => {
            const isSelected = value === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setValue(num)}
                className={`w-8 h-9 rounded-xl border text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#0d5c41] text-white border-[#0d5c41] shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      ) : field.type === "statement" ? (
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-emerald-950 text-xs leading-relaxed font-medium">
          Press the button below to acknowledge and continue.
        </div>
      ) : (
        <div className="relative flex items-center">
          <input
            type={
              field.type === "email"
                ? "email"
                : field.type === "number"
                ? "number"
                : field.type === "date"
                ? "date"
                : "text"
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.placeholder || "Type your answer here..."}
            style={fontStyle}
            className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-[#0d5c41] focus:ring-2 focus:ring-emerald-500/20 text-slate-900 transition-all focus:outline-none"
          />
        </div>
      )}

      {/* Typeform Bottom Shortcut Hint Bar */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100/60">
        <span>Typeform field layout</span>
        <button
          type="button"
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-[#0d5c41] text-slate-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>OK</span>
          <span className="font-mono text-[9px]">↵</span>
        </button>
      </div>
    </div>
  );
}

function BuildFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingFormId = searchParams?.get("id") || "";

  const utils = trpc.useUtils();
  const saveFormMutation = trpc.form.saveForm.useMutation();

  const { data: existingForm } = trpc.form.getPublicForm.useQuery(
    { id: existingFormId },
    { enabled: !!existingFormId, retry: false }
  );

  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [activeView, setActiveView] = useState<"canvas" | "preview">("canvas");
  const [zoom, setZoom] = useState(100);
  const [isFieldsPanelOpen, setIsFieldsPanelOpen] = useState(true);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [formTheme, setFormTheme] = useState<FormTheme>(PRESET_THEMES[0]!);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishTab, setPublishTab] = useState<"preview" | "theme" | "settings">("preview");
  const [savedFormId, setSavedFormId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishSuccess, setIsPublishSuccess] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (existingForm?.form) {
      setSavedFormId(existingForm.form.id);
      if (existingForm.form.title) {
        setFormTitle(existingForm.form.title);
      }
      if (existingForm.form.theme) {
        setFormTheme((prev) => ({ ...prev, ...existingForm.form.theme }));
      }
      if (existingForm.fields && existingForm.fields.length > 0) {
        const mappedFields: FormFieldItem[] = existingForm.fields.map((f: any, idx: number) => ({
          id: f.id || `field_${idx}`,
          type: f.fieldType || f.type || "short_text",
          label: f.label || "Untitled Field",
          description: f.description || "",
          placeholder: f.placeholder || "",
          required: f.isRequired ?? f.required ?? false,
          font: f.font || "Inter",
          style: f.style || {},
          options: f.options || [],
        }));

        setPages([
          {
            id: 1,
            title: "Page 1",
            fields: mappedFields,
          },
        ]);
        setNodes(
          mappedFields.map((f, i) => ({
            id: f.id,
            x: 60,
            y: 60 + i * 180,
            label: f.label,
            font: f.font,
            style: f.style,
            type: f.type,
            description: f.description,
          }))
        );
      }
    }
  }, [existingForm]);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const handleConfirmPublishLive = async () => {
    try {
      setIsPublishing(true);
      await handleSaveFormDraft("published", false);
      await new Promise((resolve) => setTimeout(resolve, 900));
      setIsPublishing(false);
      setIsPublishSuccess(true);
    } catch (err) {
      console.error("Publish error:", err);
      setIsPublishing(false);
    }
  };

  const handleSaveFormDraft = async (
    targetState: "drafted" | "published" | "closed" = "drafted",
    exitAfterSave: boolean = true
  ) => {
    try {
      setIsSavingDraft(true);
      const allFields = pages.flatMap((page, pIdx) =>
        page.fields.map((field, fIdx) => ({
          type: field.type,
          label: field.label,
          description: field.description,
          placeholder: field.placeholder,
          required: field.required,
          font: field.font,
          style: field.style,
          options: field.options,
          orderIndex: pIdx * 100 + fIdx,
        }))
      );

      const res = await saveFormMutation.mutateAsync({
        id: savedFormId || undefined,
        title: formTitle || "Untitled Form",
        description: `Form with ${pages.length} pages and ${allFields.length} fields`,
        state: targetState,
        theme: {
          ...formTheme,
          pages: pages.map((p) => ({ id: p.id, title: p.title })),
        },
        fields: allFields,
      });

      if (res?.id) {
        setSavedFormId(res.id);
        utils.form.getUserForms.invalidate();
      }

      setSaveSuccessMessage(
        `Form successfully saved to database as ${targetState.toUpperCase()}!`
      );
      setTimeout(() => setSaveSuccessMessage(null), 3000);

      setIsExitModalOpen(false);
      if (exitAfterSave) {
        router.push("/userprofile");
      }
    } catch (err: any) {
      console.error("Error saving form draft:", err);
      setSaveSuccessMessage(
        err?.message || "Error saving form to database. Please check your login session."
      );
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Fetch available field types from the backend
  const { data: fieldTypes, isLoading: isFieldTypesLoading } =
    trpc.form.getAvailableFieldTypes.useQuery(undefined, {
      staleTime: 1000 * 60 * 30, // cache for 30 mins – field types rarely change
    });

  const activeFieldTypes = useMemo(() => {
    if (Array.isArray(fieldTypes) && fieldTypes.length > 0) {
      return fieldTypes;
    }
    return DEFAULT_FIELD_TYPES;
  }, [fieldTypes]);

  // Group field types by category for the palette drawer
  const groupedFieldTypes = useMemo(() => {
    return activeFieldTypes.reduce(
      (acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category]!.push(item);
        return acc;
      },
      {} as Record<string, typeof activeFieldTypes>
    );
  }, [activeFieldTypes]);

  // Multi-Page State (Max 5 pages)
  const [pages, setPages] = useState<FormPage[]>([
    {
      id: 1,
      title: "Page 1",
      fields: [
        {
          id: "f-1",
          type: "short_text",
          label: "Full Name",
          placeholder: "e.g. John Doe",
          required: true,
        },
      ],
    },
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const [nodes, setNodes] = useState<CanvasNode[]>([
    { id: "node-start", label: "Start", type: "start", x: 0, y: 100 },
    { id: "node-end", label: "End", type: "end", x: 0, y: 380 },
  ]);

  // Load Google Fonts for field font customization
  useEffect(() => {
    const linkId = "google-fonts-leafform";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@400;700&family=Cinzel:wght@400;700&family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;500;700&family=Dancing+Script:wght@400;700&family=EB+Garamond:wght@400;700&family=Fira+Code:wght@400;600&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Lato:wght@400;700&family=Lobster&family=Lora:wght@400;600;700&family=Manrope:wght@400;600;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;600;700&family=Nunito:wght@400;600;700&family=Open+Sans:wght@400;600;700&family=Outfit:wght@400;600;700&family=Pacifico&family=Playfair+Display:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700&family=Poppins:wght@400;600;700&family=Roboto:wght@400;500;700&family=Space+Grotesk:wght@400;600;700&family=Space+Mono:wght@400;700&family=Syne:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const getCanvasCenterX = useCallback(() => {
    const container = canvasContainerRef.current;
    if (!container || container.clientWidth === 0) return 300;
    return Math.max(40, container.clientWidth / 2 - 320);
  }, []);

  // Keep canvas nodes strictly synced with the active page's fields
  useEffect(() => {
    const activePage = pages[activePageIndex];
    if (!activePage) return;

    const centerX = getCanvasCenterX();

    setNodes((prevNodes) => {
      const prevNodeMap = new Map(prevNodes.map((n) => [n.id, n]));

      const startNode: CanvasNode = {
        id: "node-start",
        label: `Start (${activePage.title})`,
        type: "start",
        x: prevNodeMap.get("node-start")?.x ?? centerX,
        y: 80,
      };

      const fieldNodes: CanvasNode[] = activePage.fields.map((field, idx) => {
        const existing = prevNodeMap.get(field.id);
        return {
          id: field.id,
          label: field.label,
          description: field.description,
          type: field.type,
          x: existing ? existing.x : centerX,
          y: existing ? existing.y : idx * 280 + 180,
          font: field.font || "Inter",
          required: field.required,
          style: field.style,
        };
      });

      const lastFieldY =
        fieldNodes.length > 0
          ? Math.max(...fieldNodes.map((n) => n.y))
          : 100;

      const endNode: CanvasNode = {
        id: "node-end",
        label: `End (${activePage.title})`,
        type: "end",
        x: prevNodeMap.get("node-end")?.x ?? centerX,
        y: lastFieldY + 280,
      };

      return [startNode, ...fieldNodes, endNode];
    });
  }, [activePageIndex, pages, getCanvasCenterX]);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom((z) => Math.min(z + 15, 180));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 15, 50));
  const handleResetZoom = () => setZoom(100);

  const handleAddPage = () => {
    if (pages.length >= 5) return;
    const newPageId = pages.length + 1;
    const newPage: FormPage = {
      id: newPageId,
      title: `Page ${newPageId}`,
      fields: [],
    };
    setPages([...pages, newPage]);
    setActivePageIndex(pages.length);
  };

  const handleRemovePage = (index: number) => {
    if (pages.length <= 1) return;
    const updatedPages = pages.filter((_, i) => i !== index);
    setPages(updatedPages);
    if (activePageIndex >= updatedPages.length) {
      setActivePageIndex(updatedPages.length - 1);
    }
  };

  const handleRemoveField = useCallback(
    (fieldId: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== fieldId));
      setPages((prevPages) => {
        const updated = [...prevPages];
        const page = updated[activePageIndex];
        if (page) {
          updated[activePageIndex] = {
            ...page,
            fields: page.fields.filter((f) => f.id !== fieldId),
          };
        }
        return updated;
      });
    },
    [activePageIndex]
  );

  const handleUpdateFieldLabel = useCallback(
    (fieldId: string, newLabel: string) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === fieldId ? { ...n, label: newLabel } : n))
      );
      setPages((prevPages) => {
        const updated = [...prevPages];
        const page = updated[activePageIndex];
        if (page) {
          updated[activePageIndex] = {
            ...page,
            fields: page.fields.map((f) =>
              f.id === fieldId ? { ...f, label: newLabel } : f
            ),
          };
        }
        return updated;
      });
    },
    [activePageIndex]
  );

  const handleUpdateFieldFont = useCallback(
    (fieldId: string, newFont: string) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === fieldId ? { ...n, font: newFont } : n))
      );
      setPages((prevPages) => {
        const updated = [...prevPages];
        const page = updated[activePageIndex];
        if (page) {
          updated[activePageIndex] = {
            ...page,
            fields: page.fields.map((f) =>
              f.id === fieldId ? { ...f, font: newFont } : f
            ),
          };
        }
        return updated;
      });
    },
    [activePageIndex]
  );

  const handleUpdateFieldDescription = useCallback(
    (fieldId: string, newDesc: string) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === fieldId ? { ...n, description: newDesc } : n))
      );
      setPages((prevPages) => {
        const updated = [...prevPages];
        const page = updated[activePageIndex];
        if (page) {
          updated[activePageIndex] = {
            ...page,
            fields: page.fields.map((f) =>
              f.id === fieldId ? { ...f, description: newDesc } : f
            ),
          };
        }
        return updated;
      });
    },
    [activePageIndex]
  );

  const handleToggleFieldRequired = useCallback(
    (fieldId: string) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === fieldId ? { ...n, required: !n.required } : n))
      );
      setPages((prevPages) => {
        const updated = [...prevPages];
        const page = updated[activePageIndex];
        if (page) {
          updated[activePageIndex] = {
            ...page,
            fields: page.fields.map((f) =>
              f.id === fieldId ? { ...f, required: !f.required } : f
            ),
          };
        }
        return updated;
      });
    },
    [activePageIndex]
  );

  const handleUpdateFieldStyle = useCallback(
    (fieldId: string, styleUpdate: Partial<FieldStyle>) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === fieldId
            ? { ...n, style: { ...n.style, ...styleUpdate } }
            : n
        )
      );
      setPages((prevPages) => {
        const updated = [...prevPages];
        const page = updated[activePageIndex];
        if (page) {
          updated[activePageIndex] = {
            ...page,
            fields: page.fields.map((f) =>
              f.id === fieldId
                ? { ...f, style: { ...f.style, ...styleUpdate } }
                : f
            ),
          };
        }
        return updated;
      });
    },
    [activePageIndex]
  );

  const handleUpdateFieldPlaceholder = useCallback(
    (fieldId: string, newPlaceholder: string) => {
      setPages((prevPages) => {
        const updated = [...prevPages];
        const page = updated[activePageIndex];
        if (page) {
          updated[activePageIndex] = {
            ...page,
            fields: page.fields.map((f) =>
              f.id === fieldId ? { ...f, placeholder: newPlaceholder } : f
            ),
          };
        }
        return updated;
      });
    },
    [activePageIndex]
  );

  const handleUpdateFieldOptions = useCallback(
    (fieldId: string, newOptions: string[]) => {
      setPages((prevPages) => {
        const updated = [...prevPages];
        const page = updated[activePageIndex];
        if (page) {
          updated[activePageIndex] = {
            ...page,
            fields: page.fields.map((f) =>
              f.id === fieldId ? { ...f, options: newOptions } : f
            ),
          };
        }
        return updated;
      });
    },
    [activePageIndex]
  );

  const handleAddFieldToActivePage = useCallback(
    (fieldType: string, fieldName: string) => {
      const activePage = pages[activePageIndex];
      if (!activePage) return;

      const newField: FormFieldItem = {
        id: `field-${Date.now()}`,
        type: fieldType,
        label: fieldName,
        placeholder: `Enter ${fieldName.toLowerCase()}...`,
        required: false,
        font: "Inter",
      };

      const updatedPages = [...pages];
      updatedPages[activePageIndex] = {
        ...activePage,
        fields: [...activePage.fields, newField],
      };
      setPages(updatedPages);
    },
    [pages, activePageIndex]
  );

  // HTML5 Drag & Drop handlers for palette → canvas
  const handleDragStart = useCallback(
    (e: React.DragEvent, fieldType: string, fieldName: string) => {
      e.dataTransfer.setData("application/leafform-field-type", fieldType);
      e.dataTransfer.setData("application/leafform-field-name", fieldName);
      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/leafform-field-type")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const fieldType = e.dataTransfer.getData("application/leafform-field-type");
      const fieldName = e.dataTransfer.getData("application/leafform-field-name");
      if (!fieldType || !fieldName) return;

      // Convert drop coordinates to canvas space (account for zoom + container offset)
      const container = canvasContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scale = zoom / 100;
      const dropX = Math.max(10, (e.clientX - rect.left) / scale);
      const dropY = Math.max(10, (e.clientY - rect.top) / scale);

      handleAddFieldToActivePage(fieldType, fieldName);
    },
    [handleAddFieldToActivePage]
  );

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingId(id);
    const node = nodes.find((n) => n.id === id);
    if (node) {
      dragOffset.current = {
        x: (e.clientX - node.x * (zoom / 100)) / (zoom / 100),
        y: (e.clientY - node.y * (zoom / 100)) / (zoom / 100),
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    const scale = zoom / 100;
    const newX = Math.max(10, (e.clientX - dragOffset.current.x * scale) / scale);
    const newY = Math.max(10, (e.clientY - dragOffset.current.y * scale) / scale);
    setNodes((prev) =>
      prev.map((n) => (n.id === draggingId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const activePage = pages[activePageIndex] || pages[0] || { id: 1, title: "Page 1", fields: [] };

  const resolveIcon = (iconName: string): LucideIcon => {
    return ICON_MAP[iconName] || FileText;
  };

  return (
    <main
      className="w-screen h-screen overflow-hidden bg-slate-50 relative select-none flex flex-col font-sans"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Navbar */}
      <header className="relative w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between z-30 shadow-xs">
        {/* Left Section: Back Button & Editable Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsExitModalOpen(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="h-5 w-[1px] bg-slate-200" />

          {/* Editable Title Input & Pencil Icon */}
          <div className="flex items-center gap-1.5 group">
            <input
              ref={titleInputRef}
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="font-bold text-slate-900 text-sm sm:text-base bg-transparent border border-transparent hover:border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl px-2.5 py-1 transition-all"
              placeholder="Enter form title..."
            />
            <button
              type="button"
              onClick={() => titleInputRef.current?.focus()}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Edit title"
              aria-label="Edit title"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Section: Centered Segmented Canvas / Preview Switcher */}
        <div className="absolute left-1/2 -translate-x-1/2 bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveView("canvas")}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === "canvas"
                ? "bg-[#0d5c41] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("preview")}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === "preview"
                ? "bg-[#0d5c41] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {/* Right Section: Theme Palette, Save Draft & Publish Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsThemePanelOpen(!isThemePanelOpen)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isThemePanelOpen
                ? "bg-[#0d5c41] text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
            title="Form Theme & Global Styling"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Theme & Styling</span>
          </button>

          {/* Save Draft Button */}
          <button
            type="button"
            disabled={isSavingDraft}
            onClick={() => handleSaveFormDraft("drafted", false)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Save as Draft in Database"
          >
            {isSavingDraft ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0d5c41]" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-[#0d5c41]" />
            )}
            <span>Save Draft</span>
          </button>

          {/* Publish Form Button */}
          <button
            type="button"
            disabled={isSavingDraft}
            onClick={async () => {
              if (!savedFormId) {
                await handleSaveFormDraft("published", false);
              }
              setIsPublishModalOpen(true);
            }}
            className="px-4 py-1.5 rounded-xl bg-[#0d5c41] hover:bg-[#065f46] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Review & Publish Form"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* Floating Form Theme Customization Drawer */}
      {isThemePanelOpen && (
        <div className="absolute top-16 right-6 z-40 w-80 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto animate-fadeIn select-none">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-[#0d5c41] font-bold text-xs">
              <Palette className="w-4 h-4" />
              <span>Form Theme & Global Styling</span>
            </div>
            <button
              type="button"
              onClick={() => setIsThemePanelOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Presets */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Preset Themes
            </span>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_THEMES.map((theme) => {
                const isActive = formTheme.name === theme.name;
                return (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => setFormTheme(theme)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? "border-[#0d5c41] bg-emerald-50/80 text-[#0d5c41] shadow-xs"
                        : "border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-5 h-5 rounded-full border border-slate-300 shadow-xs flex items-center justify-center shrink-0"
                        style={{ backgroundColor: theme.backgroundColor }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                      </div>
                      <span>{theme.name}</span>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-[#0d5c41]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Theme Color Inputs with ColorRingPicker Wheel */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Custom Theme Colors
            </span>

            {/* Form Background Color */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Form Background</span>
              <ColorRingPicker
                color={formTheme.backgroundColor}
                onChange={(c) =>
                  setFormTheme({ ...formTheme, backgroundColor: c })
                }
              />
            </div>

            {/* Card Background Color */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Card Background</span>
              <ColorRingPicker
                color={formTheme.cardBackgroundColor}
                onChange={(c) =>
                  setFormTheme({ ...formTheme, cardBackgroundColor: c })
                }
              />
            </div>

            {/* Text Color */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Text Color</span>
              <ColorRingPicker
                color={formTheme.textColor}
                onChange={(c) => setFormTheme({ ...formTheme, textColor: c })}
              />
            </div>

            {/* Accent Color */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Accent Color</span>
              <ColorRingPicker
                color={formTheme.accentColor}
                onChange={(c) => setFormTheme({ ...formTheme, accentColor: c })}
              />
            </div>

            {/* Form Language Selector */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#0d5c41]" />
                <span>Form Language</span>
              </div>
              <select
                value={formTheme.language || "en"}
                onChange={(e) =>
                  setFormTheme({ ...formTheme, language: e.target.value })
                }
                className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main View Area */}
      {activeView === "canvas" ? (
        <div
          ref={canvasContainerRef}
          className="flex-1 relative w-full h-full cursor-crosshair bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] transition-colors duration-300"
          style={{ backgroundColor: formTheme.backgroundColor }}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          {/* Page Selector Floating Top Ribbon (Up to 5 Pages) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-1.5 shadow-md flex items-center gap-1.5">
            {pages.map((page, idx) => (
              <div key={page.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActivePageIndex(idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activePageIndex === idx
                      ? "bg-[#0d5c41] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Page {page.id}
                </button>
                {pages.length > 1 && activePageIndex === idx && (
                  <button
                    type="button"
                    onClick={() => handleRemovePage(idx)}
                    className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete page"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {pages.length < 5 ? (
              <button
                type="button"
                onClick={handleAddPage}
                className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0d5c41] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Add Page (Up to 5 pages)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Page</span>
              </button>
            ) : (
              <span className="text-[10px] font-semibold text-slate-400 px-1.5">
                (5 Max)
              </span>
            )}
          </div>

          {/* Floating Canvas Fields Palette Drawer on Right of Canvas */}
          <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
            {!isFieldsPanelOpen ? (
              <button
                type="button"
                onClick={() => setIsFieldsPanelOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg text-slate-800 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ListPlus className="w-4 h-4 text-[#0d5c41]" />
                <span>Add Fields</span>
              </button>
            ) : (
              <div className="w-60 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-4 shadow-xl flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5 text-[#0d5c41] font-bold text-xs">
                    <ListPlus className="w-4 h-4" />
                    <span>Form Inputs</span>
                    <span className="px-1.5 py-0.5 text-[10px] bg-emerald-100 text-[#0d5c41] rounded-full font-extrabold">
                      {activeFieldTypes.length || DEFAULT_FIELD_TYPES.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFieldsPanelOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {Object.entries(groupedFieldTypes).map(
                    ([category, items]) => (
                      <div key={category} className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-0.5">
                          {category}
                        </span>
                        {items!.map((item) => {
                          const IconComp = resolveIcon(item.icon);
                          return (
                            <div
                              key={item.type}
                              draggable
                              onDragStart={(e) =>
                                handleDragStart(e, item.type, item.name)
                              }
                              onClick={() =>
                                handleAddFieldToActivePage(
                                  item.type,
                                  item.name
                                )
                              }
                              className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 transition-all flex items-center justify-between text-slate-700 hover:text-[#0d5c41] cursor-grab active:cursor-grabbing group text-xs font-semibold select-none"
                            >
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-400 shrink-0" />
                                <IconComp className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0d5c41] shrink-0" />
                                <span>{item.name}</span>
                              </div>
                              <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Zoomable Canvas Container */}
          <div
            className="absolute inset-0 origin-top-left transition-transform duration-75"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {/* SVG Connecting Flow Lines between Canvas Nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {nodes.slice(0, -1).map((node, i) => {
                const nextNode = nodes[i + 1];
                if (!nextNode) return null;
                const cardWidth = 640; // 640px wide card
                const cardHeight = node.type === "start" ? 50 : 200;
                const startX = node.x + cardWidth / 2;
                const startY = node.y + cardHeight;
                const endX = nextNode.x + cardWidth / 2;
                const endY = nextNode.y;

                const deltaY = Math.max(20, endY - startY);
                const controlY = Math.min(deltaY * 0.5, 80);

                return (
                  <g key={`line-${node.id}-${nextNode.id}`}>
                    <path
                      d={`M ${startX} ${startY} C ${startX} ${startY + controlY}, ${endX} ${endY - controlY}, ${endX} ${endY}`}
                      stroke="#0d5c41"
                      strokeWidth="2.5"
                      strokeDasharray="6 6"
                      fill="none"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Draggable Canvas Nodes */}
            {nodes.map((node) => {
              const activeField = pages[activePageIndex]?.fields.find(
                (f) => f.id === node.id
              );

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    backgroundColor:
                      node.style?.backgroundColor ||
                      formTheme.cardBackgroundColor ||
                      "#ffffff",
                    color: node.style?.textColor || formTheme.textColor || "#0f172a",
                  }}
                  className={`absolute w-[600px] sm:w-[640px] p-6 sm:p-7 rounded-[2rem] backdrop-blur-md shadow-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing z-10 flex flex-col gap-4 select-none ${
                    node.type === "start"
                      ? "border-emerald-500/60 ring-2 ring-emerald-500/10"
                      : node.type === "end"
                      ? "border-slate-300"
                      : "border-emerald-700/30 hover:border-emerald-500/60 hover:shadow-2xl"
                  }`}
                >
                  {node.type === "start" || node.type === "end" ? (
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          node.type === "start"
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-slate-700"
                        }`}
                      />
                      <span className="font-bold text-sm truncate" style={{ color: formTheme.textColor || "#0f172a" }}>
                        {node.label}
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Node Top Action Bar: Type, Required, Font, Card Colors, Delete */}
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0d5c41]" />
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0d5c41] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 whitespace-nowrap">
                            {node.type.replace("_", " ")}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Card Bg Color Ring Picker */}
                          <ColorRingPicker
                            color={
                              node.style?.backgroundColor ||
                              formTheme.cardBackgroundColor ||
                              "#ffffff"
                            }
                            onChange={(c) =>
                              handleUpdateFieldStyle(node.id, {
                                backgroundColor: c,
                              })
                            }
                            label="Bg"
                          />

                          {/* Card Text Color Ring Picker */}
                          <ColorRingPicker
                            color={
                              node.style?.textColor ||
                              formTheme.textColor ||
                              "#0f172a"
                            }
                            onChange={(c) =>
                              handleUpdateFieldStyle(node.id, { textColor: c })
                            }
                            label="Txt"
                          />

                          {/* Required Toggle */}
                          <button
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFieldRequired(node.id);
                            }}
                            className={`px-2 py-0.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                              node.required
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600"
                            }`}
                            title="Toggle Required Field"
                          >
                            {node.required ? "* Req" : "Opt"}
                          </button>

                          {/* Font Selector */}
                          <div className="relative flex items-center group">
                            <Type className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0d5c41] absolute left-1.5 pointer-events-none" />
                            <select
                              value={node.font || "Inter"}
                              onMouseDown={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleUpdateFieldFont(node.id, e.target.value);
                              }}
                              className="pl-5 pr-1.5 py-0.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:text-[#0d5c41] border border-slate-200 hover:border-emerald-300 rounded-lg focus:outline-none cursor-pointer transition-all appearance-none max-w-28 truncate"
                              title="Change field font"
                            >
                              {AVAILABLE_FONTS.map((font) => (
                                <option key={font.value} value={font.value}>
                                  {font.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Font Style Formatting Toggles (Bold, Italic, Underline) */}
                          <div className="flex items-center gap-0.5 bg-slate-100/90 border border-slate-200 rounded-lg p-0.5 shrink-0">
                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateFieldStyle(node.id, {
                                  fontWeight:
                                    node.style?.fontWeight === "bold"
                                      ? "normal"
                                      : "bold",
                                });
                              }}
                              className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                                node.style?.fontWeight === "bold"
                                  ? "bg-[#0d5c41] text-white shadow-xs"
                                  : "text-slate-600 hover:bg-slate-200"
                              }`}
                              title="Bold"
                            >
                              <Bold className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateFieldStyle(node.id, {
                                  fontStyle:
                                    node.style?.fontStyle === "italic"
                                      ? "normal"
                                      : "italic",
                                });
                              }}
                              className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                                node.style?.fontStyle === "italic"
                                  ? "bg-[#0d5c41] text-white shadow-xs"
                                  : "text-slate-600 hover:bg-slate-200"
                              }`}
                              title="Italic"
                            >
                              <Italic className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateFieldStyle(node.id, {
                                  textDecoration:
                                    node.style?.textDecoration === "underline"
                                      ? "none"
                                      : "underline",
                                });
                              }}
                              className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                                node.style?.textDecoration === "underline"
                                  ? "bg-[#0d5c41] text-white shadow-xs"
                                  : "text-slate-600 hover:bg-slate-200"
                              }`}
                              title="Underline"
                            >
                              <Underline className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Delete Field Button */}
                          <button
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveField(node.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                            title="Delete field"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Node Body Inputs: Title & Subtitle/Description */}
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={node.label}
                          onMouseDown={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleUpdateFieldLabel(node.id, e.target.value)
                          }
                          style={{
                            fontFamily: parseFontFamily(node.font),
                            fontWeight: node.style?.fontWeight || "inherit",
                            fontStyle: node.style?.fontStyle || "inherit",
                            textDecoration: node.style?.textDecoration || "none",
                            color: "inherit",
                          }}
                          placeholder="Question title..."
                          className="font-extrabold text-sm sm:text-base bg-transparent hover:bg-slate-500/10 focus:bg-white focus:text-slate-900 focus:outline-none border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded-xl px-2.5 py-1 w-full transition-all"
                        />

                        <input
                          type="text"
                          value={node.description || ""}
                          onMouseDown={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleUpdateFieldDescription(node.id, e.target.value)
                          }
                          style={{
                            fontFamily: parseFontFamily(node.font),
                            fontWeight: node.style?.fontWeight || "inherit",
                            fontStyle: node.style?.fontStyle || "inherit",
                            textDecoration: node.style?.textDecoration || "none",
                            color: "inherit",
                          }}
                          placeholder="Add instructions / description..."
                          className="text-xs font-medium opacity-70 bg-transparent hover:bg-slate-500/10 focus:bg-white focus:text-slate-900 focus:outline-none border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded-xl px-2.5 py-1 w-full transition-all italic placeholder:opacity-40"
                        />

                        {/* Inline Placeholder / Options Customizer directly on Canvas Card */}
                        {["multiple_choice", "checkboxes", "dropdown", "picture_choice"].includes(
                          node.type
                        ) ? (
                          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200/50">
                            <span className="text-[10px] font-extrabold uppercase opacity-50">
                              Options / Choices:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(activeField?.options || ["Option 1", "Option 2"]).map(
                                (opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-2 py-1 text-xs font-semibold text-slate-700"
                                  >
                                    <input
                                      type="text"
                                      value={opt}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onChange={(e) => {
                                        const curOpts = [
                                          ...(activeField?.options || ["Option 1", "Option 2"]),
                                        ];
                                        curOpts[optIdx] = e.target.value;
                                        handleUpdateFieldOptions(node.id, curOpts);
                                      }}
                                      className="bg-transparent focus:outline-none w-20"
                                    />
                                  </div>
                                )
                              )}
                              <button
                                type="button"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const curOpts = [
                                    ...(activeField?.options || ["Option 1", "Option 2"]),
                                    `Option ${
                                      (activeField?.options?.length || 2) + 1
                                    }`,
                                  ];
                                  handleUpdateFieldOptions(node.id, curOpts);
                                }}
                                className="px-2.5 py-1 rounded-xl bg-emerald-50 text-[#0d5c41] font-bold text-xs hover:bg-emerald-100 cursor-pointer border border-emerald-200"
                              >
                                + Add Option
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-slate-200/50">
                            <input
                              type="text"
                              value={activeField?.placeholder || ""}
                              onMouseDown={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handleUpdateFieldPlaceholder(node.id, e.target.value)
                              }
                              style={{ color: "inherit" }}
                              placeholder="Input placeholder text..."
                              className="text-xs font-medium opacity-75 bg-transparent hover:bg-slate-500/10 focus:bg-white focus:text-slate-900 focus:outline-none border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded-xl px-2.5 py-1 w-full transition-all"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Floating Bottom Left Zoom Interaction Control Bar */}
          <div className="absolute bottom-6 left-6 z-30 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-1.5 shadow-xl flex items-center gap-1 text-slate-700">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold px-2.5 min-w-12 text-center text-slate-800">
              {zoom}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="h-4 w-[1px] bg-slate-200 mx-1" />

            <button
              type="button"
              onClick={handleResetZoom}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Preview Mode Container (Supports Multi-Page Form Flow) */
        <div
          className="flex-1 w-full h-full p-6 flex flex-col items-center justify-center overflow-auto animate-fadeIn transition-colors duration-300"
          style={{ backgroundColor: formTheme.backgroundColor }}
        >
          <div
            className="w-full max-w-xl rounded-3xl p-8 sm:p-10 shadow-2xl border flex flex-col gap-6 transition-colors duration-300"
            style={{
              backgroundColor: formTheme.cardBackgroundColor || "#ffffff",
              color: formTheme.textColor || "#0f172a",
              borderColor: `${formTheme.accentColor || "#0d5c41"}40`,
            }}
          >
            <div className="space-y-2 text-center border-b border-slate-200/50 pb-6">
              <h2
                className="text-2xl font-black tracking-tight"
                style={{ color: formTheme.textColor || "#0f172a" }}
              >
                {formTitle || "Untitled Form"}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-[#0d5c41] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  Page {activePageIndex + 1} of {pages.length}
                </span>
              </div>
            </div>

            {/* Active Preview Page Fields */}
            <div className="space-y-4">
              {activePage.fields.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No fields configured for Page {activePage.id}. Use the Canvas Fields panel to add inputs.
                </p>
              ) : (
                activePage.fields.map((field, idx) => (
                  <TypeformFieldRenderer
                    key={field.id}
                    field={field}
                    index={idx}
                    formTheme={formTheme}
                  />
                ))
              )}
            </div>

            {/* Multi-Page Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
              <button
                type="button"
                disabled={activePageIndex === 0}
                onClick={() => setActivePageIndex((p) => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={activePageIndex >= pages.length - 1}
                onClick={() => setActivePageIndex((p) => Math.min(pages.length - 1, p + 1))}
                style={{ backgroundColor: formTheme.accentColor || "#0d5c41" }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-40 flex items-center gap-1 hover:opacity-90 transition-all cursor-pointer shadow-md"
              >
                <span>Next Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Toast Banner */}
      {saveSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d5c41] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn border border-emerald-400/30">
          <Check className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Exit / Save Draft Confirmation Modal Card */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 flex flex-col gap-5 text-center relative select-none">
            <button
              type="button"
              onClick={() => setIsExitModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0d5c41] border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
              <FileText className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Save Form Draft?
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Would you like to save this form's layout, fields, and flow as a <span className="font-bold text-[#0d5c41]">Draft</span> in your database before leaving?
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSavingDraft}
                onClick={() => handleSaveFormDraft("drafted", true)}
                className="w-full py-3 px-4 rounded-2xl bg-[#0d5c41] hover:bg-[#065f46] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Draft to Database...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Draft & Exit</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSavingDraft}
                onClick={() => {
                  setIsExitModalOpen(false);
                  router.push("/userprofile");
                }}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Discard Changes & Leave
              </button>

              <button
                type="button"
                disabled={isSavingDraft}
                onClick={() => setIsExitModalOpen(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors pt-1"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Form Modal Card with Preview, Theme, and Settings tabs */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn select-none">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0d5c41] border border-emerald-100 flex items-center justify-center font-black">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                    Publish Form
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Review preview, customize theme, or update settings before publishing live.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Publishing Animation, Success Celebration Screen, or Tabs */}
            {isPublishing ? (
              <div className="flex flex-col items-center justify-center p-14 text-center space-y-4 animate-fadeIn">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-[#0d5c41] animate-spin" />
                  <Sparkles className="w-8 h-8 text-[#0d5c41] absolute animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Publishing Your Form Live...
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Deploying pages, custom themes, and fields to public database.
                  </p>
                </div>
              </div>
            ) : isPublishSuccess ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center space-y-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#0d5c41] border border-emerald-200 flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-[#0d5c41]" />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    🎉 Form Published Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Your form <span className="font-bold text-slate-800">"{formTitle}"</span> is now live and ready to receive responses.
                  </p>
                </div>

                {/* Live Submission URL Card */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl w-full max-w-md flex flex-col gap-3 shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-left">
                    Public Submission Link
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 p-2.5 rounded-xl">
                    <span className="text-xs font-mono font-bold text-slate-800 truncate select-all">
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/submit/${savedFormId || ""}`
                        : `/submit/${savedFormId || ""}`}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const fullUrl = typeof window !== "undefined"
                            ? `${window.location.origin}/submit/${savedFormId || ""}`
                            : `/submit/${savedFormId || ""}`;
                          if (typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(fullUrl);
                          }
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0d5c41] hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy link"
                      >
                        {copiedLink ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={`/submit/${savedFormId || ""}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0d5c41] hover:bg-slate-100 transition-colors"
                        title="Open submission page in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPublishSuccess(false);
                      setIsPublishModalOpen(false);
                      router.push("/userprofile");
                    }}
                    className="w-full py-3 px-5 rounded-2xl bg-[#0d5c41] hover:bg-[#065f46] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Go to Dashboard & Submissions</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPublishSuccess(false);
                      setIsPublishModalOpen(false);
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Stay in Canvas Editor
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Segmented Tab Navigation: Preview, Theme, Settings */}
                <div className="px-6 pt-3 bg-slate-50/50 border-b border-slate-200 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPublishTab("preview")}
                    className={`px-4 py-2 rounded-t-xl font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      publishTab === "preview"
                        ? "border-[#0d5c41] text-[#0d5c41] bg-white shadow-2xs"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview Form</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishTab("theme")}
                    className={`px-4 py-2 rounded-t-xl font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      publishTab === "theme"
                        ? "border-[#0d5c41] text-[#0d5c41] bg-white shadow-2xs"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    <span>Theme & Styling</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishTab("settings")}
                    className={`px-4 py-2 rounded-t-xl font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      publishTab === "settings"
                        ? "border-[#0d5c41] text-[#0d5c41] bg-white shadow-2xs"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Tab Body Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                  {publishTab === "preview" ? (
                    /* 1. Preview Tab */
                    <div
                      className="w-full rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center transition-colors shadow-sm border border-slate-200/80"
                      style={{ backgroundColor: formTheme.backgroundColor }}
                    >
                      <div
                        className="w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-xl border flex flex-col gap-5"
                        style={{
                          backgroundColor: formTheme.cardBackgroundColor || "#ffffff",
                          color: formTheme.textColor || "#0f172a",
                          borderColor: `${formTheme.accentColor || "#0d5c41"}35`,
                        }}
                      >
                        <div className="text-center space-y-1 pb-4 border-b border-slate-200/40">
                          <h4
                            className="text-xl font-extrabold"
                            style={{ color: formTheme.textColor || "#0f172a" }}
                          >
                            {formTitle}
                          </h4>
                          <p className="text-xs opacity-70">
                            Interactive Live Preview ({pages.length} Pages)
                          </p>
                        </div>

                        <div className="space-y-4">
                          {activePage.fields.length === 0 ? (
                            <p className="text-xs opacity-60 text-center py-4">
                              No fields on this page yet.
                            </p>
                          ) : (
                            activePage.fields.map((field, idx) => (
                              <TypeformFieldRenderer
                                key={field.id}
                                field={field}
                                index={idx}
                                formTheme={formTheme}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : publishTab === "theme" ? (
                    /* 2. Theme Tab */
                    <div className="max-w-xl mx-auto space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          Preset Form Themes
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Select a curated color palette for your form.
                        </p>
                        <div className="grid grid-cols-2 gap-2.5 mt-3">
                          {PRESET_THEMES.map((theme) => {
                            const isActive = formTheme.name === theme.name;
                            return (
                              <button
                                key={theme.name}
                                type="button"
                                onClick={() => setFormTheme(theme)}
                                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                                  isActive
                                    ? "border-[#0d5c41] bg-emerald-50/60 text-[#0d5c41] ring-1 ring-[#0d5c41]"
                                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full border border-slate-300 shadow-xs flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: theme.backgroundColor }}
                                  >
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: theme.accentColor }}
                                    />
                                  </div>
                                  <span>{theme.name}</span>
                                </div>
                                {isActive && <Check className="w-3.5 h-3.5 text-[#0d5c41]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <h4 className="font-extrabold text-sm text-slate-900">
                          Custom Palette & Language
                        </h4>

                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span>Form Outer Background</span>
                          <ColorRingPicker
                            color={formTheme.backgroundColor}
                            onChange={(c) =>
                              setFormTheme({ ...formTheme, backgroundColor: c })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span>Card Background</span>
                          <ColorRingPicker
                            color={formTheme.cardBackgroundColor}
                            onChange={(c) =>
                              setFormTheme({ ...formTheme, cardBackgroundColor: c })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span>Text Color</span>
                          <ColorRingPicker
                            color={formTheme.textColor}
                            onChange={(c) => setFormTheme({ ...formTheme, textColor: c })}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span>Accent Color</span>
                          <ColorRingPicker
                            color={formTheme.accentColor}
                            onChange={(c) => setFormTheme({ ...formTheme, accentColor: c })}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-[#0d5c41]" />
                            <span>Form Language</span>
                          </div>
                          <select
                            value={formTheme.language || "en"}
                            onChange={(e) =>
                              setFormTheme({ ...formTheme, language: e.target.value })
                            }
                            className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
                          >
                            {SUPPORTED_LANGUAGES.map((lang) => (
                              <option key={lang.code} value={lang.code}>
                                {lang.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 3. Settings Tab (Empty State Placeholder) */
                    <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto">
                        <Settings className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-base text-slate-900">
                        Form Settings
                      </h4>
                      <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                        Form access permissions, response limits, email notifications, and integrations will appear here.
                      </p>
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full border border-slate-200 uppercase">
                        Configurable / Empty
                      </span>
                    </div>
                  )}
                </div>

                {/* Modal Footer: Live Submission URL Copy & Confirm Publish */}
                <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl w-full sm:w-auto">
                    <Globe className="w-3.5 h-3.5 text-[#0d5c41] shrink-0" />
                    <span className="text-xs font-mono font-bold text-slate-700 truncate max-w-xs select-all">
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/submit/${savedFormId || ""}`
                        : `/submit/${savedFormId || ""}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const fullUrl = typeof window !== "undefined"
                          ? `${window.location.origin}/submit/${savedFormId || ""}`
                          : `/submit/${savedFormId || ""}`;
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(fullUrl);
                        }
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="p-1 text-slate-400 hover:text-[#0d5c41] transition-colors shrink-0 cursor-pointer"
                      title="Copy submission link"
                    >
                      {copiedLink ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={`/submit/${savedFormId || ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-[#0d5c41] transition-colors shrink-0"
                      title="Open submission page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsPublishModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={isSavingDraft || isPublishing}
                      onClick={handleConfirmPublishLive}
                      className="px-5 py-2 rounded-xl bg-[#0d5c41] hover:bg-[#065f46] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingDraft || isPublishing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm & Publish Live</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function BuildFormPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#092218] flex items-center justify-center p-6 text-white text-xs font-semibold select-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            <p className="text-emerald-200 font-medium">Loading Form Canvas...</p>
          </div>
        </div>
      }
    >
      <BuildFormContent />
    </React.Suspense>
  );
}

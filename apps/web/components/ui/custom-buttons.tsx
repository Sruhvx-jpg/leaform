import * as React from "react";
import { Plus, ArrowUpRight } from "lucide-react";

interface CustomButtonProps extends React.ComponentProps<"button"> {
  isReadOnly?: boolean;
}

export const CreateFormButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, isReadOnly, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className="flex justify-center gap-2 items-center shadow-xl text-xs bg-gray-50 text-slate-900 font-extrabold border-gray-50 before:content-[''] before:absolute before:w-full before:transition-all before:duration-700 before:rounded-full before:bg-[#0d5c41] hover:text-white before:-z-10 before:aspect-square before:-left-full hover:before:left-0 hover:before:scale-150 hover:before:duration-700 relative z-10 px-6 py-3.5 overflow-hidden border-2 rounded-lg group cursor-pointer"
        {...props}
      >
        <span>{children || "Create New Form"}</span>
        <Plus className="w-4 h-4 text-slate-800 group-hover:text-white transition-colors" />
      </button>
    );
  }
);
CreateFormButton.displayName = "CreateFormButton";

export const ExploreTemplatesButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className="px-5 h-[40px] bg-transparent border-2 border-slate-900 hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center justify-between gap-3 transition-all duration-200 active:scale-95 shadow-xs shrink-0 group rounded-lg cursor-pointer"
        {...props}
      >
        <span>{children || "Explore Templates"}</span>
        <div className="relative overflow-hidden w-4 h-4 flex-shrink-0">
          <ArrowUpRight className="w-4 h-4 absolute transition-all duration-300 transform translate-x-0 translate-y-0 group-hover:translate-x-5 group-hover:-translate-y-5 text-slate-900" />
          <ArrowUpRight className="w-4 h-4 absolute transition-all duration-300 transform -translate-x-5 translate-y-5 group-hover:translate-x-0 group-hover:translate-y-0 text-slate-900" />
        </div>
      </button>
    );
  }
);
ExploreTemplatesButton.displayName = "ExploreTemplatesButton";

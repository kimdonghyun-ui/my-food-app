// import * as React from "react";
// import { cn } from "@/utils/utils";

// export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// const Input = React.forwardRef<HTMLInputElement, InputProps>(
//   ({ className, ...props }, ref) => {
//     return (
//       <input
//         type="search"
//         ref={ref}
//         className={cn(
//           "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white",
//           className
//         )}
//         {...props}
//       />
//     );
//   }
// );
// Input.displayName = "Input";

// export { Input };




import * as React from "react";
import { cn } from "@/utils/utils";
import { X } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showClearButton?: boolean;
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, showClearButton = false, onClear, value, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type="text"
          ref={ref}
          value={value}
          className={cn(
            "w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white",
            className
          )}
          {...props}
        />

        {showClearButton && value && typeof value === "string" && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

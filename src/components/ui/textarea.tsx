import * as React from "react";
import { cn } from "@/utils/utils";

// export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;


const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

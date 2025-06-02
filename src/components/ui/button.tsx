import * as React from "react";
import { cn } from "@/utils/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "default" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyle = "inline-flex items-center justify-center font-medium rounded-md transition-colors";

    const variantStyles = {
      default: "bg-purple-600 text-white hover:bg-purple-700",
      outline: "border border-gray-300 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800",
    };

    const sizeStyles = {
      default: "px-4 py-2 text-sm",
      icon: "w-10 h-10",
    };

/*
    className={cn(
        baseStyle,                // 기본 스타일
        variantStyles[variant],   // "default" 또는 "outline" 스타일
        sizeStyles[size],         // "default" 또는 "icon" 사이즈
        className                 // 외부에서 전달받은 사용자 정의 클래스
      )}
*/

    return (
      <button
        ref={ref}
        className={cn(baseStyle, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

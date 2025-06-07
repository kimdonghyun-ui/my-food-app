"use client";

import React from "react";

interface LoadingOverlayProps {
  show: boolean;
}

export default function LoadingOverlay({ show }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center rounded-lg">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}

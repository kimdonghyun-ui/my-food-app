import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-1 pt-4">
      <button
        disabled={page === 1}
        onClick={() => onChange(1)}
        className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${
          page === 1 ? "text-gray-300" : "text-gray-500 hover:text-purple-600"
        }`}
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${
          page === 1 ? "text-gray-300" : "text-gray-500 hover:text-purple-600"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition ${
            i + 1 === page
              ? "bg-purple-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${
          page === totalPages ? "text-gray-300" : "text-gray-500 hover:text-purple-600"
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        disabled={page === totalPages}
        onClick={() => onChange(totalPages)}
        className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${
          page === totalPages ? "text-gray-300" : "text-gray-500 hover:text-purple-600"
        }`}
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

// interface PaginationProps {
//   page: number;
//   totalPages: number;
//   onChange: (page: number) => void;
// }

// export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
//   if (totalPages <= 1) return null;

//   return (
//     <div className="w-full overflow-x-auto">
//       <div className="flex justify-center items-center gap-1 pt-4 min-w-fit">
//         <button
//           disabled={page === 1}
//           onClick={() => onChange(1)}
//           className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${
//             page === 1 ? "text-gray-300" : "text-gray-500 hover:text-purple-600"
//           }`}
//         >
//           <ChevronsLeft className="w-4 h-4" />
//         </button>
//         <button
//           disabled={page === 1}
//           onClick={() => onChange(page - 1)}
//           className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${
//             page === 1 ? "text-gray-300" : "text-gray-500 hover:text-purple-600"
//           }`}
//         >
//           <ChevronLeft className="w-4 h-4" />
//         </button>

//         {[...Array(totalPages)].map((_, i) => (
//           <button
//             key={i}
//             onClick={() => onChange(i + 1)}
//             className={`px-3 py-1 rounded-md text-sm font-medium transition ${
//               i + 1 === page
//                 ? "bg-purple-600 text-white"
//                 : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
//             }`}
//           >
//             {i + 1}
//           </button>
//         ))}

//         <button
//           disabled={page === totalPages}
//           onClick={() => onChange(page + 1)}
//           className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${
//             page === totalPages ? "text-gray-300" : "text-gray-500 hover:text-purple-600"
//           }`}
//         >
//           <ChevronRight className="w-4 h-4" />
//         </button>
//         <button
//           disabled={page === totalPages}
//           onClick={() => onChange(totalPages)}
//           className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${
//             page === totalPages ? "text-gray-300" : "text-gray-500 hover:text-purple-600"
//           }`}
//         >
//           <ChevronsRight className="w-4 h-4" />
//         </button>
//       </div>
//     </div>
//   );
// }










import { useEffect, useRef, useState } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(7);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const itemWidth = 42; // 평균 버튼 width + gap
      const available = Math.floor((width - 120) / itemWidth); // 화살표 4개 여유 고려
      setVisibleCount(Math.max(3, available));
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const getPaginationRange = () => {
    const range: number[] = [];

    if (totalPages <= visibleCount) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    range.push(1);

    const sideCount = Math.floor((visibleCount - 2) / 2); // 1, total 포함하고 중간 보여줄 개수 계산
    let start = Math.max(2, page - sideCount);
    let end = Math.min(totalPages - 1, page + sideCount);

    // Adjust when close to beginning or end
    if (page <= sideCount) {
      start = 2;
      end = visibleCount - 1;
    } else if (page >= totalPages - sideCount + 1) {
      start = totalPages - visibleCount + 2;
      end = totalPages - 1;
    }

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        range.push(i);
      }
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="w-full overflow-hidden" ref={containerRef}>
      <div className="flex justify-center items-center gap-1 pt-4 flex-nowrap overflow-hidden">
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

        {getPaginationRange().map((item, i) => (
          <button
            key={i}
            onClick={() => onChange(item)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition whitespace-nowrap ${
              item === page
                ? "bg-purple-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            {item}
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
    </div>
  );
}

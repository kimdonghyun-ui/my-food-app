"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useReviewStore } from "@/store/reviewStore";
import { Input } from "./input";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface Review {
  id: number;
  attributes: {
    content: string;
    rating: number;
    users_permissions_user:Users_permissions_user;
    createdAt: string;
  };
}

interface Users_permissions_user {
    data: {
        attributes: {
            username: string;
        }
        id: number;
    }
}

interface Props {
  placeId: string;
}



export default function Review({ placeId }: Props) {


    // 등록 부분
    const [content, setContent] = useState(""); // 리뷰 내용
    const [rating, setRating] = useState(5); // 리뷰 별점

    // 수정 부분
    const [editContent, setEditContent] = useState(""); // 리뷰 내용
    const [editRating, setEditRating] = useState(5); // 리뷰 별점





    
    const PAGE_SIZE = 2; // 페이지네이션 한페이지 몇개 보여줄지

  const [editingId, setEditingId] = useState<number | null>(null); // 수정할 리뷰 id
  const [page, setPage] = useState(1); // 페이지 번호


  const { user } = useAuthStore();
  const { fetchReviews, total, reviews, createReviews, deleteReview, updateReview } = useReviewStore();



  const handleSubmit = async () => {
    if ((!content.trim()) || (!rating) || (!user?.id) || (!placeId)) return;

      createReviews(placeId, content, rating, user?.id, PAGE_SIZE)
  };

  // 삭제 함수
  const handleDelete = async (id: number) => {
    deleteReview(id)
  };

  // 수정 함수
  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setEditContent(review.attributes.content);
    setEditRating(review.attributes.rating);
  };

  // page의존하여 리뷰 불러오기(페이지 네비게이션 클릭시 page 변경됨) + 최초에도 한번 실행
  useEffect(() => {
    // console.log("page", page);
    fetchReviews(placeId, page, PAGE_SIZE);
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 mt-8 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300">리뷰</h2>

      <div className="flex flex-col gap-3">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="한 줄 리뷰를 입력하세요"
          className="border rounded-md px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
        />

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => setRating(i)}
              className={`text-lg transition-colors duration-150 ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}
            >
              ★
            </button>
          ))}
          <button
            onClick={handleSubmit}
            className="ml-auto bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-1.5 rounded-md transition"
          >
            등록
          </button>
        </div>
      </div>

    {/* 리뷰 목록 */}
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
    {reviews.map((review) => {
        const isEditing = editingId === review.id;

        return (
        <li key={review.id} className="py-3">
            <div className="flex justify-between items-center mb-1">

            
            {isEditing ? (
                <>
                {/* 수정모드 */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <button
                                    key={i}
                                    onClick={() => setEditRating(i)}
                                    className={`text-lg ${i <= editRating ? "text-yellow-400" : "text-gray-300"}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <Input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="한 줄 리뷰를 입력하세요"
                            className="w-full border px-2 py-1 text-sm rounded-md dark:bg-gray-800 dark:text-white"
                        />

                        <div className="flex gap-2 text-xs self-end">
                            <button
                                className="text-green-600 hover:underline"
                                onClick={() => {
                                    updateReview(review.id, editContent, editRating);
                                    setEditingId(null);
                                }}
                            >
                            저장
                            </button>
                            <button
                                className="text-gray-500 hover:underline"
                                onClick={() => setEditingId(null)}
                            >
                            취소
                            </button>
                        </div>
                    </div>
                {/* 수정모드 끝 */}
                </>

            ) : (
                <>
                    {/* 일반모드 */}
                        <div>
                            <span className="font-semibold text-purple-700 dark:text-purple-300">
                            {review.attributes.users_permissions_user.data.attributes.username}
                            </span>
                            <span className="ml-2 text-yellow-400">
                            {"★".repeat(review.attributes.rating)}
                            </span>
                        </div>

                        {user?.id === review.attributes.users_permissions_user.data.id && (
                            <div className="flex gap-2 text-xs">
                            <button
                                className="text-blue-500 hover:underline"
                                onClick={() => handleEdit(review)}
                            >
                                수정
                            </button>
                            <button
                                className="text-red-500 hover:underline"
                                onClick={() => handleDelete(review.id)}
                            >
                                삭제
                            </button>
                            </div>
                        )}
                    {/* 일반모드 끝 */}
                </>
            )}
            </div>

            {!isEditing && (
            <p className="text-sm text-gray-700 dark:text-gray-200">
                {review.attributes.content}
            </p>
            )}
        </li>
        );
    })}
    </ul>



      {/* 페이지 네비게이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(1)}
            className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${
              page === 1
                ? "text-gray-300"
                : "text-gray-500 hover:text-purple-600"
            }`}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${
              page === 1
                ? "text-gray-300"
                : "text-gray-500 hover:text-purple-600"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
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
            onClick={() => setPage(page + 1)}
            className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${
              page === totalPages
                ? "text-gray-300"
                : "text-gray-500 hover:text-purple-600"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
            className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${
              page === totalPages
                ? "text-gray-300"
                : "text-gray-500 hover:text-purple-600"
            }`}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}

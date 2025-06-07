"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useReviewStore } from "@/store/reviewStore";
import { Input } from "./input";

import Pagination from "@/components/ui/pagination";

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
  placeId?: string ;
  title: string;
}

// placeId = 해당 맛집의 id
// props로 placeId 있으면 해당 맛집에 대한 리뷰 전부 보여줌(상세 페이지용 = 해당 맛집에 대해서만 노출되어야되기떄문)
// props로 placeId 없으면 하나의 맛집에 고정되지 않고 모든 맛집에 대한 내가 작성한 리뷰 보여줌(마이페이지용 = 모든 맛집에 대한 내가 작성한 리뷰 보여줌)
export default function Review({ placeId, title }: Props) {

  // 등록 부분
  const [content, setContent] = useState(""); // 리뷰 내용
  const [rating, setRating] = useState(5); // 리뷰 별점

  // 수정 부분
  const [editContent, setEditContent] = useState(""); // 리뷰 내용
  const [editRating, setEditRating] = useState(5); // 리뷰 별점


  const [editingId, setEditingId] = useState<number | null>(null); // 수정할 리뷰 id
  const [page, setPage] = useState(1); // 페이지 번호


  const { user } = useAuthStore();
  const { fetchReviews, reviewsTotal , reviews, createReviews, deleteReview, updateReview } = useReviewStore();

  const PAGE_SIZE = 2; // 페이지네이션 한페이지 몇개 보여줄지
  const reviewsPages = Math.ceil(reviewsTotal / PAGE_SIZE);

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
    if (!user) return;
    const queryString = placeId
    ? `/food-reviews?filters[place][id]=${placeId}&populate=*&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
    : `/food-reviews?filters[users_permissions_user][id]=${user.id}&populate=*&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`;

    fetchReviews(queryString);
  }, [page, user, fetchReviews, placeId]);


  return (
    <div className="space-y-6 mt-8 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300">{title}</h2>


      {/* 등록 하는 부분(상세페이지에서만 노출) */}
      {
        placeId && (
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
        )
      }

      {/* 리뷰 목록 */}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {reviews.map((review) => {
          const isEditing = editingId === review.id;

          return (
            <li key={review.id} className="py-3">
              <div className="flex justify-between items-center mb-1">
                
                {/* 수정모드 */}
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
                        {
                          placeId
                          ? review.attributes.users_permissions_user.data.attributes.username
                          : review.attributes.place.data.attributes.name
                        }
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

      {/* 페이지네이션 */}
      <Pagination
        page={page}
        totalPages={reviewsPages}
        onChange={(newPage) => setPage(newPage)}
      />

    </div>
  );
}

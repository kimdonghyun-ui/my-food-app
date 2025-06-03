"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { handleFileUpload } from "@/utils/fileUpload";
import ProfileImage from "@/components/ProfileImage";
import { useReviewStore } from '@/store/reviewStore';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

export default function ProfileContent() {
  const { user, handleProfileUpdate } = useAuthStore();
  const { getReviews, total, reviews, updateReview, deleteReview } = useReviewStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    profileImage: user?.profileImage || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myPlaces, setMyPlaces] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);

  const PAGE_SIZE = 2;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      try {
        const svgString: string = await handleFileUpload(event);
        setEditedUser(prev => ({ ...prev, profileImage: svgString }));
      } catch (error) {
        console.error("파일 변환 중 오류 발생:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      setIsEditing(false);
      await handleProfileUpdate(editedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setEditedUser({
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      profileImage: user?.profileImage || ''
    });
  }, [isEditing, user]);

  useEffect(() => {
    if (user?.id) {
      getReviews(`${user.id}`, page, PAGE_SIZE);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/places?filters[users_permissions_user][id]=${user.id}&populate=*`)
        .then(res => res.json())
        .then(data => setMyPlaces(data.data || []));
    }
  }, [user, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8 max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">마이페이지</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {editedUser.profileImage ? (
              <ProfileImage svgString={editedUser.profileImage} alt={editedUser.username} width={56} height={56} />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex-1 space-y-1">
              <input
                type="text"
                value={editedUser.username}
                onChange={(e) => setEditedUser(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-1 text-sm font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <input
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <input
                type="password"
                value={editedUser.password}
                onChange={(e) => setEditedUser(prev => ({ ...prev, password: e.target.value }))}
                placeholder="변경할 비밀번호 입력(변경하지 않으면 기존비번입력)"
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />

              <div className="flex justify-end pt-2 gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {isLoading ? '저장 중...' : '수정'}</button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-sm px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                >취소</button>
                <label className="cursor-pointer">
                  <span className="text-sm px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded">사진</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </form>
          ) : (
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-800 dark:text-white">{user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">{user?.email}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-1 text-xs text-blue-600 hover:underline"
              >프로필 수정</button>
            </div>
          )}
        </div>


        {/* 내가 등록한 맛집 */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h2 className="font-semibold text-base mb-2">🍽 내가 등록한 맛집</h2>
            {myPlaces.length > 0 ? (
              <ul className="space-y-3">
                {myPlaces.map((place) => (
                  <li key={place.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-semibold text-sm">{place.attributes.name}</p>
                      <p className="text-xs text-gray-500">{place.attributes.category} · {place.attributes.address}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">수정</button>
                      <button className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">삭제</button>
                    </div>
                  </li>
                ))}
              </ul>
          ) : (
            <p className="text-sm text-gray-500">등록한 맛집이 없습니다.</p>
          )}
        </section>





        {/* 내가 작성한 리뷰 */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h2 className="font-semibold text-base mb-2">📝 내가 작성한 리뷰</h2>
          {reviews.length > 0 ? (
            <ul className="space-y-3">
              {reviews.map((review) => (
                <li key={review.id} className="border rounded-lg p-3">
                  {editId === review.id ? (
                    <div className="space-y-2">
                      <input
                        className="w-full px-2 py-1 text-sm rounded border dark:bg-gray-700 dark:text-white"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <button
                            key={i}
                            onClick={() => setEditRating(i)}
                            className={`text-lg ${i <= editRating ? "text-yellow-400" : "text-gray-300"}`}
                          >★</button>
                        ))}
                      </div>
                      <div className="flex gap-2 text-xs">
                        <button
                          className="text-green-600 hover:underline"
                          onClick={() => {
                            updateReview(review.id, editContent, editRating);
                            setEditId(null);
                          }}
                        >저장</button>
                        <button className="text-gray-400 hover:underline" onClick={() => setEditId(null)}>취소</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold text-sm">{review.attributes.place?.data?.attributes?.name || '알 수 없음'}</p>
                        <p className="text-yellow-400 text-sm">{'★'.repeat(review.attributes.rating)}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{review.attributes.content}</p>
                      </div>
                      <div className="flex flex-col justify-between items-end gap-1">
                        <button
                          className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                          onClick={() => {
                            setEditId(review.id);
                            setEditContent(review.attributes.content);
                            setEditRating(review.attributes.rating);
                          }}
                        >수정</button>
                        <button
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                          onClick={() => deleteReview(review.id)}
                        >삭제</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">작성한 리뷰가 없습니다.</p>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${page === 1 ? "text-gray-300" : "text-gray-500 hover:text-purple-600"}`}
              ><ChevronsLeft className="w-4 h-4" /></button>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${page === 1 ? "text-gray-300" : "text-gray-500 hover:text-purple-600"}`}
              ><ChevronLeft className="w-4 h-4" /></button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition ${i + 1 === page ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
                >{i + 1}</button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${page === totalPages ? "text-gray-300" : "text-gray-500 hover:text-purple-600"}`}
              ><ChevronRight className="w-4 h-4" /></button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className={`px-2 py-1 text-sm rounded disabled:cursor-not-allowed transition ${page === totalPages ? "text-gray-300" : "text-gray-500 hover:text-purple-600"}`}
              ><ChevronsRight className="w-4 h-4" /></button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

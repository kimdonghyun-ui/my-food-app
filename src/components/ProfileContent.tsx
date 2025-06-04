"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { handleFileUpload } from "@/utils/fileUpload";
import ProfileImage from "@/components/ProfileImage";
import { useReviewStore } from '@/store/reviewStore';

import { usePlaceStore } from '@/store/placeStore';
import Pagination from "@/components/ui/Pagination";
import Review from "@/components/ui/review";

export default function ProfileContent() {
  const { user, handleProfileUpdate } = useAuthStore();
  const { getReviews, reviewsTotal, reviews, updateReview, deleteReview } = useReviewStore();
  const { fetchPlaces, places, placesTotal } = usePlaceStore();
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
  const [placesPage, setPlacesPage] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);


  const PAGE_SIZE = 2; // 한 페이지에 보여줄 페이지네이션 갯수
  const placesPages = Math.ceil(placesTotal / PAGE_SIZE); // 내가 등록한 맛집 페이지네이션 갯수
  const reviewsPages = Math.ceil(reviewsTotal / PAGE_SIZE); // 내가 작성한 리뷰 페이지네이션 갯수

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
      // getReviews(`${user.id}`, page, PAGE_SIZE);
    //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/places?filters[users_permissions_user][id]=${user.id}&populate=*`)
    //     .then(res => res.json())
    //     .then(data => setMyPlaces(data.data || []));
    }
  }, [user, page]);

  


  useEffect(() => {
    if (user?.id) {
      fetchPlaces(`/places?filters[users_permissions_user][id]=${user.id}&populate=*&sort=createdAt:desc&pagination[page]=${placesPage}&pagination[pageSize]=${PAGE_SIZE}`)
    }
  }, [user, placesPage]);



  

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
            {places.length > 0 ? (
              <ul className="space-y-3">
                {places.map((place) => (
                  <li key={place.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-semibold text-sm">{place.attributes.name}</p>
                      <p className="text-xs text-gray-600">{place.attributes.category}</p>
                      <p className="text-sm text-gray-400">{place.attributes.description}</p>
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

          <Pagination
            page={placesPage}
            totalPages={placesPages}
            onChange={(newPage) => setPlacesPage(newPage)}
          />

        </section>

        {/* 리뷰 댓글 (모든 맛집에 대한 내가 작성한 리뷰) */}
        <Review title="📝 내가 작성한 리뷰" />
      </main>
    </div>
  );
}

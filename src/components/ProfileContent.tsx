"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
// import { handleFileUpload } from "@/utils/fileUpload";
// import ProfileImage from "@/components/ProfileImage";
import Review from "@/components/ui/review";
import MyPlaces from "@/components/ui/myPlaces.tsx";
import { toast } from 'react-hot-toast';
import { useReviewStore } from '@/store/reviewStore';
import { usePlaceStore } from '@/store/placeStore';
import Image from "next/image";
import { uploadImage } from '@/utils/uploadImage';

export default function ProfileContent() {
  const { user, handleProfileUpdate } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    profileImage: user?.profileImage || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // console.log('error', error)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      try {
        //const svgString: string = await handleFileUpload(event);
        const imageUrl = await uploadImage(event.target.files[0]);

        setEditedUser(prev => ({ ...prev, profileImage: imageUrl }));
      } catch (error) {
        console.error("파일 변환 중 오류 발생:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError(null);
    setIsLoading(true);

    try {
      setIsEditing(false);
      await handleProfileUpdate(editedUser);
    } catch (err) {
      console.log('err', err)
      // setError(err instanceof Error ? err.message : '프로필 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    //수정모드 진입해서 값을 수정하고나서 저장 안누르고 취소한경우 초기화
    setEditedUser({
      username: user?.username || '',
      email: user?.email || '',
      password: user?.email === 'hello@naver.com' ? 'hello123' : '',
      profileImage: user?.profileImage || ''
    });

    if ((user?.email === 'hello@naver.com') && isEditing) {
      toast.success('hello@naver.com 계정은 테스트 계정이라 이메일 및 비밀번호 변경이 불가능합니다.');
    }

  }, [isEditing, user]);

  useEffect(() => {
    usePlaceStore.getState().reset();
    useReviewStore.getState().reset();
  }, [])

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8 max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">마이페이지</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {editedUser.profileImage ? (
              // <ProfileImage svgString={editedUser.profileImage} alt={editedUser.username} width={56} height={56} />
              <Image src={editedUser.profileImage} alt={editedUser.username} width={56} height={56} className="w-[56px] h-[56px] object-cover rounded-full" />
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
                disabled={editedUser.email === 'hello@naver.com'}
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 
                  dark:bg-gray-700 dark:text-white
                  disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed 
                  dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                required
              />
              <input
                disabled={editedUser.email === 'hello@naver.com'}
                type="password"
                value={editedUser.password}
                onChange={(e) => setEditedUser(prev => ({ ...prev, password: e.target.value }))}
                placeholder={editedUser.email === 'hello@naver.com' ? '테스트계정은 비밀번호 변경불가' : '변경하려면 입력하세요'}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 
                  dark:bg-gray-700 dark:text-white
                  disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed 
                  dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
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
        <MyPlaces title='🍽 내가 등록한 맛집' />

        {/* 리뷰 댓글 (모든 맛집에 대한 내가 작성한 리뷰) */}
        <Review title="📝 내가 작성한 리뷰" />
      </main>
    </div>
  );
}

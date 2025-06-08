// 예시: 클라이언트 전용 로직 처리
'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/themeStore';
import { useRedirectStore } from '@/store/redirectStore';

export default function ClientHandler() {
  const router = useRouter();
  const isDarkMode = useThemeStore((state) => state.isDarkMode); // 다크모드 상태 불러오기
  const linkName = useRedirectStore((state) => state.linkName); // 리다이렉트 할 링크 이름 불러오기



  // ### isDarkMode 상태 변경시 다크모드 설정 (isDarkMode = true,false) ###
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  // ### isDarkMode ###


  // ### linkName 상태 변경시 리다이렉트 처리 (router를 .ts에서 사용못하 므로 해결책으로 사용) (linkName = 리다이렉트 할 링크 이름) ###
  useEffect(() => {
    if (!linkName) { // linkName이 없으면 무시
      return
    }
    
    router.replace(linkName);    
    useRedirectStore.getState().setLinkName(''); //초기화
  }, [linkName, router]);
  // ### linkName ###

  // ### 터치 이벤트 방지 ###
  useEffect(() => {
    let lastTouchEnd = 0;

    const handleTouchEnd = (event: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', handleTouchEnd, false);
    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  



  return null;
}

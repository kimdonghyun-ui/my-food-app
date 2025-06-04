import { create } from "zustand";
import { toast } from "react-hot-toast";
import { fetchApi } from "@/lib/fetchApi";
import { Place } from "./placeStore";
import { persist } from 'zustand/middleware';

export interface Review {
  id: number;
  attributes: {
    content: string;
    rating: number;
    createdAt: string;
    users_permissions_user:Users_permissions_user;
    place: {
      data: Place;
    };
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


interface ReviewState {
  reviews: Review[];
  reviewsTotal: number;
  isLoading: boolean;
  error: string | null;
  fetchReviews: (query: string) => Promise<void>;
  createReviews: (placeId: string, content: string, rating: number, userId: number, pageSize: number) => Promise<void>;
  deleteReview: (id: number) => Promise<void>;
  updateReview: (id: number, content: string, rating: number) => Promise<void>;
  // 스토어 초기화
  reset: () => void;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: [],
      reviewsTotal: 0,
      isLoading: false,
      error: null,

      // 리뷰 목록 조회
      fetchReviews: async (query = '/food-reviews') => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetchApi<{ data: Review[]; meta: { pagination: { total: number } } }>(query, {
            method: 'GET',
          });
          set({ reviews: res.data, reviewsTotal: res.meta.pagination.total });
        } catch (err) {
          toast.error("리뷰를 불러오는 데 실패했어요.");
          set({ error: "리뷰 로드 실패" });
        } finally {
          set({ isLoading: false });
        }
      },

      // 리뷰 작성
      createReviews: async (placeId, content, rating, userId, pageSize) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetchApi<{ data: Review }>(`/food-reviews?populate=users_permissions_user`, {
            method: 'POST',
            body: JSON.stringify({
              data: { content, rating, place: placeId, users_permissions_user: userId },
            }),
          });

          const { reviews } = get();
          if (reviews.length < pageSize) {
            set((state) => ({
              reviews: [res.data, ...state.reviews],
            }));
          } else {
            set((state) => ({
              reviews: [res.data, ...state.reviews.slice(0, pageSize - 1)],
            }));
          }
        } catch (err) {
          toast.error("리뷰작성 실패했어요.");
          set({ error: "리뷰작성 실패했어요." });
        } finally {
          set({ isLoading: false });
        }
      },

      // 리뷰 삭제
      deleteReview: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await fetchApi(`/food-reviews/${id}`, {
            method: 'DELETE',
          });

          set((state) => ({
            reviews: state.reviews.filter((review) => review.id !== id),
          }));
        } catch (err) {
          toast.error("리뷰 삭제에 실패했어요.");
          set({ error: "리뷰 삭제에 실패했어요." });
        } finally {
          set({ isLoading: false });
        }
      },

      // 리뷰 수정
      updateReview: async (id, content, rating) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetchApi<{ data: Review }>(`/food-reviews/${id}?populate=*`, {
            method: 'PUT',
            body: JSON.stringify({ data: { content, rating } }),
          });

          set((state) => ({
            reviews: state.reviews.map((review) =>
              review.id === id ? res.data : review
            ),
          }));
        } catch (err) {
          toast.error("리뷰 수정에 실패했어요.");
          set({ error: "리뷰 수정에 실패했어요." });
        } finally {
          set({ isLoading: false });
        }
      },


      // reset = 스토어 초기화
      reset: () => {
        set({
          reviews: [],
          reviewsTotal: 0,
          isLoading: false,
          error: null,
        });
        useReviewStore.persist.clearStorage();
      },

    }),
    {
      name: 'review-store',
      // partialize: (state) => ({
      //   reviews: state.reviews,
      //   reviewsTotal: state.reviewsTotal,
      // }),
    }
  )
);
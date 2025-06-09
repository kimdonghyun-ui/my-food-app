import { create } from 'zustand';
import { fetchApi } from '@/lib/fetchApi';
import { toast } from 'react-hot-toast';
import { useRedirectStore } from './redirectStore';
import { persist } from 'zustand/middleware';

export interface PlacePostPayload {
    name: string;
    category: string;
    description: string;
    latitude: number;
    longitude: number;
    users_permissions_user?: number;
  }
  
  export interface Place {
    id: number;
    attributes: {
      name: string;
      category: string;
      description: string;
      latitude: number;
      longitude: number;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
    };
  }
  
  interface PlaceState {
    isLoading: boolean;
    error: string | null;
    places: Place[];
    placesTotal: number;
    place: Place | null;
    createPlace: (data: PlacePostPayload) => Promise<void>;
    fetchPlaces: (query?: string) => Promise<void>;
    fetchPlace: (id: string) => Promise<void>;
    deletePlace: (id: number) => Promise<void>;
    updatePlace: (id: number, data: PlacePostPayload) => Promise<void>;
    // 스토어 초기화
    reset: () => void;
  }
  

  export const usePlaceStore = create<PlaceState>()(
    persist(
      (set) => ({
        isLoading: false,
        error: null,
        places: [],
        placesTotal: 0,
        place: null,
  
        // 맛집 등록
        createPlace: async (data) => {
          set({ isLoading: true, error: null });
          try {
            await fetchApi('/places', {
              method: 'POST',
              body: JSON.stringify({ data }),
            });
            toast.success('맛집 등록 완료!');
            useRedirectStore.getState().setLinkName('/');
          } catch (error) {
            set({ error: '맛집 등록 실패' });
            toast.error('맛집 등록 실패!');
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },
  
        // 맛집 목록 불러오기
        fetchPlaces: async (query = '/places') => {
          set({ isLoading: true, error: null, places: [], placesTotal: 0 });
          try {
            const res = await fetchApi<{ data: Place[]; meta: { pagination: { total: number } } }>(query);
            set({ places: res.data, placesTotal: res.meta.pagination.total });
          } catch {
            set({ error: '맛집 목록 불러오기 실패' });
            toast.error('맛집 목록 불러오기 실패!');
          } finally {
            set({ isLoading: false });
          }
        },



        updatePlace: async (id: number, data) => {
          set({ isLoading: true, error: null });
          try {
            const res = await fetchApi<{ data: Place }>(`/places/${id}`, {
              method: 'PUT',
              body: JSON.stringify({ data }),
            });
  console.log('res', res)

            const updatedPlace = res.data;

            set((state) => ({
              places: state.places.map((place) =>
                place.id === id ? updatedPlace : place
              ),
            }));

          } catch {
            toast.error("맛집 수정에 실패했어요.");
            set({ error: "맛집 수정에 실패했어요." });
          } finally {
            set({ isLoading: false });
          }
        },
        




      // 맛집 삭제
      deletePlace: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await fetchApi(`/places/${id}`, {
            method: 'DELETE',
          });

          set((state) => ({
            places: state.places.filter((place) => place.id !== id),
          }));
        } catch {
          toast.error("맛집 삭제에 실패했어요.");
          set({ error: "맛집 삭제에 실패했어요." });
        } finally {
          set({ isLoading: false });
        }
      },





  
        // 맛집 상세 불러오기
        fetchPlace: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            const res = await fetchApi<{ data: Place }>(`/places/${id}`);
            set({ place: res.data });
          } catch {
            set({ error: '맛집 상세 불러오기 실패' });
            toast.error('맛집 상세 불러오기 실패!');
          } finally {
            set({ isLoading: false });
          }
        },


      // reset = 스토어 초기화
      reset: () => {
        set({
            isLoading: false,
            error: null,
            places: [],
            placesTotal: 0,
            place: null,
        });
        usePlaceStore.persist.clearStorage();
      },

      }),
      {
        name: 'place-store', // 저장될 localStorage 키 이름
        // partialize: (state) => ({
        //   places: state.places,
        //   placesTotal: state.placesTotal,
        //   place: state.place,
        // }),
      }
    )
  );
  

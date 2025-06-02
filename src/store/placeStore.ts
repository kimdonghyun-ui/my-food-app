import { create } from 'zustand';
import { fetchApi } from '@/lib/fetchApi';
import { toast } from 'react-hot-toast';
import { useRedirectStore } from './redirectStore';

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
    place: Place | null;
    createPlace: (data: PlacePostPayload) => Promise<void>;
    fetchPlaces: (query?: string) => Promise<void>;
    fetchPlace: (id: string) => Promise<void>;
  }
  

export const usePlaceStore = create<PlaceState>((set) => ({
  isLoading: false,
  error: null,
  places: [],
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
        set({ isLoading: true, error: null });
        try {
            const res = await fetchApi<{ data: Place[] }>(query);
            set({ places: res.data });
        } catch (error) {
            set({ error: '맛집 목록 불러오기 실패' });
            toast.error('맛집 목록 불러오기 실패!');
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
        } catch (error) {
            set({ error: '맛집 상세 불러오기 실패' });
            toast.error('맛집 상세 불러오기 실패!');
        } finally {
            set({ isLoading: false });
        }
    },

}));

export {};

declare global {

  namespace kakao.maps.event {
    interface MouseEvent {
      latLng: kakao.maps.LatLng;
    }
    
    function addListener(
      target: kakao.maps.Map | kakao.maps.Marker,
      type: string,
      listener: (event: kakao.maps.event.MouseEvent) => void
    ): void;
    
    function addListener(
      target: kakao.maps.Map | kakao.maps.Marker,
      type: string,
      listener: (...args: unknown[]) => void
    ): void;
    

    function removeListener(
      target: kakao.maps.Map | kakao.maps.Marker,
      type: string,
      listener: (mouseEvent: kakao.maps.event.MouseEvent) => void
    ): void;
    
    function removeListener(
      target: kakao.maps.Map | kakao.maps.Marker,
      type: string,
      listener: (...args: unknown[]) => void
    ): void;
  }

  namespace kakao.maps {
    interface MouseEvent {
      latLng: kakao.maps.LatLng;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class LatLngBounds {
      constructor(sw: LatLng, ne: LatLng);
      getSouthWest(): LatLng;
      getNorthEast(): LatLng;
    }

    class Map {
      constructor(container: HTMLElement, options: {
        center: LatLng;
        level: number;
      });
      setCenter(latlng: LatLng): void;
      getCenter(): LatLng;
      getBounds(): LatLngBounds;
    }

    class Marker {
      constructor(options: {
        position: LatLng;
        map: Map;
      });
      setMap(map: Map | null): void;
      setPosition(position: LatLng): void;
    }

    class InfoWindow {
      constructor(options: {
        content: string;
      });
      open(map: Map, marker: Marker): void;
      close(): void;
    }

    class CustomOverlay {
      constructor(options: {
        map?: Map | null;
        position: LatLng;
        content: string | HTMLElement;
        xAnchor?: number;
        yAnchor?: number;
        zIndex?: number;
      });
      setMap(map: Map | null): void;
      getMap(): Map | null;
      setPosition(position: LatLng): void;
      getPosition(): LatLng;
    }

    // const event: {
    //   // ✅ 수정 예시
    //   addListener(
    //     target: kakao.maps.Map | kakao.maps.Marker, // 정확한 대상들로 대체
    //     type: string,
    //     listener: () => void
    //   ): void;
    // };
    
    const event: {
      addListener(
        target: kakao.maps.Map | kakao.maps.Marker,
        type: string,
        listener: (event: { latLng: kakao.maps.LatLng }) => void
      ): void;
    };
    


  }

  interface Window {
    kakao: typeof kakao;
  }
  namespace kakao {
    namespace maps {
      function load(callback: () => void): void;
    }
  }
}

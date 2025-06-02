export {};

declare global {
  namespace kakao.maps {
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

    const event: {
      addListener(target: any, type: string, listener: () => void): void;
    };
  }

  interface Window {
    kakao: typeof kakao;
  }
}

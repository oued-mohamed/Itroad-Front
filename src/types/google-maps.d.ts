// Create a new file: src/types/google-maps.d.ts

declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      fitBounds(bounds: LatLngBounds): void;
      setCenter(latlng: LatLngLiteral): void;
      setZoom(zoom: number): void;
      panTo(latlng: LatLngLiteral): void; 
    }
    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: Function): void;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map: Map, anchor?: Marker): void;
      close(): void;
      setContent(content: string): void;
    }

    class LatLngBounds {
      constructor();
      extend(point: LatLngLiteral): void;
    }

    class Size {
      constructor(width: number, height: number);
    }

    interface MapOptions {
      center?: LatLngLiteral;
      zoom?: number;
      styles?: any[];
    }

    interface MarkerOptions {
      position?: LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: {
        url: string;
        scaledSize: Size;
      };
    }

    interface InfoWindowOptions {
      content?: string;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
  }
}
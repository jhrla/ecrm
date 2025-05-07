import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { Feature, Geometry, GeoJsonProperties } from 'geojson';
import { useNavigate } from 'react-router-dom';
import {
  AreaData,
  CircleData,
  CircleInstance,
  CustomerInfo,
  EventData,
} from '../interface/DashboardType';
import { useSelector } from 'react-redux';
import { RootState } from 'store/store';

// Naver Maps API 타입 정의 수정
declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (
          container: HTMLElement,
          options?: MapOptions
        ) => naver.maps.Map;
        LatLng: new (lat: number, lng: number) => naver.maps.LatLng;
        Polygon: new (options: PolygonOptions) => naver.maps.Polygon;
        LatLngBounds: new () => naver.maps.LatLngBounds;
        Circle: new (options: CircleOptions) => naver.maps.Circle;
        Marker: new (options: MarkerOptions) => naver.maps.Marker;
        Event: {
          addListener(instance: any, eventName: string, handler: Function): any;
          removeListener(listener: any): void;
          once(instance: any, eventName: string, handler: Function): void;
        };
      };
    };
  }
}

// naver.maps 네임스페이스 정의 업데이트
declare namespace naver.maps {
  class Map {
    constructor(container: HTMLElement, options?: MapOptions);
    setCenter(latlng: LatLng): void;
    getCenter(): LatLng;
    setZoom(level: number, options?: { animate: boolean }): void;
    getZoom(): number;
    panTo(latlng: LatLng, options?: { duration: number; easing: string }): void;
    fitBounds(bounds: LatLngBounds, margin?: number): void;
    destroy(): void;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void; // setMap 메서드 추가
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class Polygon {
    constructor(options: PolygonOptions);
    setMap(map: Map | null): void;
    getPath(): LatLng[];
    getPaths(): LatLng[][];
    setOptions(options: Partial<PolygonOptions>): void;
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(latlng: LatLng): this;
    getCenter(): LatLng;
  }

  class Circle {
    constructor(options: CircleOptions);
    setMap(map: Map | null): void;
    getCenter(): LatLng;
    setOptions(options: Partial<CircleOptions>): void;
  }
}
class CustomOverlay {
  private position: any;
  private content: HTMLElement;
  private map: any;
  private zIndex: number;
  private listener: any; // 이벤트 리스너를 추적하기 위한 필드 추가

  constructor(options: CustomOverlayOptions) {
    this.position = options.position;
    this.content =
      typeof options.content === 'string'
        ? document.createElement('div')
        : options.content;
    this.map = options.map;
    this.zIndex = options.zIndex || 0;

    // HTML 구조 설정
    if (typeof options.content === 'string') {
      this.content.innerHTML = options.content;
    }

    this.content.style.position = 'absolute';
    this.content.style.zIndex = this.zIndex.toString();

    this.setMap(this.map); // 지도에 오버레이 추가
  }

  // 지도에 오버레이 추가
  setMap(map: any) {
    this.map = map;
    if (map) {
      const overlayLayer = map.getPanes().overlayLayer;
      overlayLayer.appendChild(this.content);
      this.draw(); // 오버레이 위치 업데이트

      // 지도 경계가 변경될 때마다 오버레이 위치를 업데이트하는 리스너 추가
      this.listener = window.naver.maps.Event.addListener(
        map,
        'bounds_changed',
        () => {
          this.draw();
        }
      );
    } else {
      this.onRemove();
    }
  }

  // 오버레이 그리기
  draw() {
    if (!this.map) return;

    const projection = this.map.getProjection();
    const pixelPosition = projection.fromCoordToOffset(this.position);

    this.content.style.left = `${
      pixelPosition.x - this.content.offsetWidth / 2
    }px`;
    this.content.style.top = `${
      pixelPosition.y - this.content.offsetHeight / 2
    }px`;
  }

  // 오버레이 제거
  onRemove() {
    if (this.content.parentNode) {
      this.content.parentNode.removeChild(this.content);
    }
    // 오버레이가 제거될 때 이벤트 리스너도 제거
    if (this.listener) {
      window.naver.maps.Event.removeListener(this.listener);
    }
  }

  // 오버레이 위치 업데이트
  setPosition(position: naver.maps.LatLng) {
    this.position = position;
    this.draw(); // 새 위치로 오버레이 재배치
  }

  // 오버레이 내용 업데이트
  setContent(content: string | HTMLElement) {
    if (typeof content === 'string') {
      this.content.innerHTML = content;
    } else {
      this.content = content;
    }
  }
}

// 필요한 인터페이스 정의
interface CustomOverlayOptions {
  position: LatLng;
  content: string | HTMLElement;
  map?: any;
  zIndex?: number;
}

// MapOptions 인터페이스 수정
interface MapOptions {
  center: naver.maps.LatLng;
  zoom: number;
  scrollWheel?: boolean;
  pinchZoom?: boolean;
  disableDoubleClickZoom: boolean;
}

interface LatLng {
  lat(): number;
  lng(): number;
}

interface NaverMap {
  setCenter(latlng: LatLng): void;
  getCenter(): LatLng;
  setZoom(level: number, options?: { animate: boolean }): void;
  getZoom(): number;
  panTo(latlng: LatLng, options?: { duration: number; easing: string }): void;
  destroy(): void;
}

interface PolygonOptions {
  map: NaverMap;
  paths: LatLng[] | LatLng[][];
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  fillColor: string;
  fillOpacity: number;
  clickable: boolean;
  zIndex: number;
}

interface MarkerOptions {
  position: LatLng;
  map?: naver.maps.Map;
  title?: string;
  clickable?: boolean;
  zIndex?: number;
}

interface CircleOptions {
  map: NaverMap;
  center: LatLng;
  radius: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  fillColor: string;
  fillOpacity: number;
  clickable: boolean;
  zIndex: number;
}

interface GeoJSONFeature extends Feature<Geometry, GeoJsonProperties> {
  properties: {
    SIG_CD: string;
    SIG_ENG_NM: string;
    SIG_KOR_NM: string;
  };
}

interface Region {
  areaType: string;
  areaData?: AreaData | null;
  showMap: string;
}

interface MapAreaProps {
  selectedArea?: AreaData | null;
  currentLevel: string;
  cityData: CircleData[];
  customerList: CustomerInfo[];
  eventData: EventData[];
  onMapClick: (
    areaType: string,
    areaData: AreaData | null,
    customerInfo: CustomerInfo | null
  ) => void;
  prevMap: (areaType: string, areaData: AreaData | null) => void;
}

// 파일 상단에 타입 선언
type MarkerType = typeof window.naver.maps.Marker.prototype;

interface GpsPosition {
  lat: number;
  lng: number;
}

// 상수 정의
const ZOOM_LEVELS = {
  land: 7, // 전국
  city: 10, // 시/도
  district: 12, // 구/군
  customer: 14, // 고객 위치
} as const;

const MapArea: React.FC<MapAreaProps> = ({
  selectedArea,
  currentLevel,
  cityData,
  customerList,
  eventData,
  onMapClick,
  prevMap,
}) => {
  // 컴포넌트 최상단에 추가
  const [naverMapLoaded, setNaverMapLoaded] = useState(false);

  // 네이버 지도 API 로드 확인 - 가장 먼저 실행되어야 함
  useEffect(() => {
    const loadNaverMaps = () => {
      const script = document.createElement('script');
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=7n1h8r6qra`;
      script.async = true;

      script.onload = () => {
        console.log('Naver Maps loaded');
        setNaverMapLoaded(true);
      };

      script.onerror = () => {
        console.error('Failed to load Naver Maps');
        setError('Failed to load Naver Maps script');
      };

      document.head.appendChild(script);
    };

    if (!window.naver?.maps) {
      loadNaverMaps();
    } else {
      setNaverMapLoaded(true);
    }
  }, []);

  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCircles, setCurrentCircles] = useState<CircleInstance[]>([]);
  const circlesRef = useRef<CircleInstance[]>([]);
  const markersRef = useRef<any[]>([]);
  const polygonsRef = useRef<{ polygon: naver.maps.Polygon }[]>([]);
  const [geoJSONData, setGeoJSONData] = useState<{
    features: GeoJSONFeature[];
  } | null>(null);
  const [isGeoJSONLoaded, setIsGeoJSONLoaded] = useState(false);
  // 초기 지도의 위치와 줌 레벨을 저장
  const [initialCenter, setInitialCenter] = useState<any>(null); // 초기 중심 상태
  const initialZoom = 7;
  const history = useSelector((state: RootState) => state.history.history);
  console.log('Current History:', history);

  console.log('HISTORY : ' + history.length);

  // MAP_CONSTANTS를 일반 객체로 정의
  const MAP_CONSTANTS = {
    CENTER: { lat: 36.5, lng: 127.5 },
    ZOOM: 7,
  } as const;

  // 지도 초기화 useEffect 수정
  useEffect(() => {
    // 1. 필수 조건 확인
    if (!naverMapLoaded || !mapRef.current) {
      console.log('필수 조건이 충족되지 않음:', {
        naverMapLoaded,
        mapRef: !!mapRef.current,
      });
      return;
    }

    // 2. 이미 지도가 초기화되어 있는지 확인
    if (mapInstanceRef.current) {
      console.log('지도가 이미 초기화되어 있음');
      return;
    }

    try {
      // 3. window.naver 객체가 존재하는지 확인
      if (!window.naver?.maps) {
        throw new Error('네이버 지도 API가 로드되지 않았습니다');
      }

      // 4. 지도 옵션 설정
      const mapOptions = {
        center: new window.naver.maps.LatLng(
          MAP_CONSTANTS.CENTER.lat,
          MAP_CONSTANTS.CENTER.lng
        ),
        zoom: MAP_CONSTANTS.ZOOM,
        scrollWheel: true,
        pinchZoom: true,
        disableDoubleClickZoom: true,
      };

      // 5. 지도 인스스 생성
      console.log('지도 초기화 시작');
      mapInstanceRef.current = new window.naver.maps.Map(
        mapRef.current,
        mapOptions
      );
      console.log('지도 초기화 완료');

      // 6. 지도 로드 상태 업데이트
      setIsMapLoaded(true);
    } catch (error) {
      console.error('지도 초기화 중 오류 발생:', error);
      setError(
        error instanceof Error
          ? error.message
          : '지도를 초기화하는 중 오류가 발생했습니다'
      );
    }
  }, [naverMapLoaded]);

  // GeoJSON 데이터 로드를 위한 useEffect
  useEffect(() => {
    const loadGeoJSON = async () => {
      if (!isMapLoaded || isGeoJSONLoaded) return;

      try {
        const response = await fetch(
          `${process.env.PUBLIC_URL}/mapdata/testsido.json`
        );
        if (!response.ok) {
          throw new Error('GeoJSON 데이터를 불러오는데 실패했습니다');
        }

        const geoJSON = await response.json();
        setGeoJSONData(geoJSON);
        setIsGeoJSONLoaded(true);
        console.log('GeoJSON 데이터 로드 완료');
      } catch (error) {
        console.error('GeoJSON 데이터 로드 중 오류:', error);
        setError('지도 데이터를 불러오는데 실패했습니다. 다시 시도해 주세요.');
      }
    };

    loadGeoJSON();
  }, [isMapLoaded, isGeoJSONLoaded]);

  const removeDistrictBoundaries = useCallback(() => {
    console.log('Removing district boundaries' + polygonsRef.current.length);

    if (polygonsRef.current.length === 0) {
      console.log('No polygons to remove');
      return; // 폴리곤이 없으 삭제 시도를 하지 않음
    }

    polygonsRef.current.forEach(({ polygon }, index) => {
      // 리곤 삭제
      if (polygon && typeof polygon.setMap === 'function') {
        polygon.setMap(null);
      }

      // 마커 삭제
      markersRef.current.forEach((marker, index) => {
        if (marker && typeof marker.setMap === 'function') {
          marker.setMap(null); // 지도서 마커 제거
        }
      });
      markersRef.current = []; // 마커 배열 초기화
    });
    polygonsRef.current = [];
  }, []);

  const resetMap = () => {
    console.log('resetMap called');
    if (!mapInstanceRef.current) return;

    try {
      // 마커와 오버레이 제거
      removeAllCircles();
      removeDistrictBoundaries();

      // 모든 마커 제거
      if (markersRef.current.length > 0) {
        markersRef.current.forEach((marker) => {
          marker.setMap(null);
        });
        markersRef.current = [];
      }

      onMapClick('land', null, null);

      // 기본 중심점으로 이동
      const defaultCenter = new window.naver.maps.LatLng(
        MAP_CONSTANTS.CENTER.lat,
        MAP_CONSTANTS.CENTER.lng
      );
      mapInstanceRef.current.setZoom(MAP_CONSTANTS.ZOOM);
      mapInstanceRef.current.setCenter(defaultCenter);

      // 기 데이터를 다시 지도에 그리기
      createCircles(cityData);
    } catch (error) {
      console.error('지도 초기화 중 오류 발생:', error);
    }
  };

  // 2. 폴곤 스타일 상수화
  const POLYGON_STYLE = {
    strokeColor: '#468DF7',
    strokeOpacity: 0.6,
    strokeWeight: 2,
    fillColor: '#33CAFB',
    fillOpacity: 0.1,
    clickable: true,
    zIndex: 10,
  } as const;

  // 3. 최적화된 폴리곤 생성 함수
  const createPolygon = useCallback(
    (paths: naver.maps.LatLng[][], map: naver.maps.Map) => {
      return new window.naver.maps.Polygon({
        map,
        paths,
        ...POLYGON_STYLE,
      });
    },
    []
  );

  // 먼저 createDistrictBoundaries 함수 선언
  const createDistrictBoundaries = useCallback(
    (cityCode: string) => {
      console.log('Creating district boundaries for city:', cityCode);
      console.log('Current event data:', eventData);

      if (!mapInstanceRef.current || !geoJSONData) return;

      const features = geoJSONData.features;
      const districtFeatures = features.filter(
        (feature: GeoJSONFeature) =>
          feature.properties && feature.properties.SIG_CD.startsWith(cityCode)
      );

      removeDistrictBoundaries();
      const totalBounds = new window.naver.maps.LatLngBounds();

      districtFeatures.forEach((districtFeature) => {
        const paths = convertGeometryToPaths(districtFeature.geometry);
        if (!paths) return;

        paths.forEach((path) =>
          path.forEach((coord) => totalBounds.extend(coord))
        );

        // 해당 district의 이벤트 확인
        const districtEvents = eventData.filter(
          (event) => event.district_code === districtFeature.properties.SIG_CD
        );

        console.log(
          'District:',
          districtFeature.properties.SIG_CD,
          'Events:',
          districtEvents
        );

        // 이벤트 종류에 따른 색상 설정
        let strokeColor = '#468DF7';
        let fillColor = '#33CAFB';
        let strokeOpacity = 0.6;
        let fillOpacity = 0.1;

        if (districtEvents.length > 0) {
          // 가장 심각한 이벤트 찾기
          const mostSevereEvent = districtEvents.reduce((prev, curr) =>
            prev.event_kind < curr.event_kind ? prev : curr
          );

          console.log('Most severe event:', mostSevereEvent);

          if (mostSevereEvent.event_kind === 1) {
            strokeColor = '#d93e10';
            fillColor = '#d93e10';
            strokeOpacity = 0.8;
            fillOpacity = 0.8;
          } else if (mostSevereEvent.event_kind === 2) {
            strokeColor = '#f1a409';
            fillColor = '#f1a409';
            strokeOpacity = 0.8;
            fillOpacity = 0.8;
          }
        }

        const polygon = new window.naver.maps.Polygon({
          map: mapInstanceRef.current,
          paths: paths,
          strokeColor,
          strokeOpacity,
          strokeWeight: 2,
          fillColor,
          fillOpacity,
          clickable: true,
          zIndex: 10,
        });

        // 클릭 이벤트 추가
        window.naver.maps.Event.addListener(polygon, 'click', () => {
          const areaData: AreaData = {
            code: districtFeature.properties.SIG_CD,
            name: districtFeature.properties.SIG_KOR_NM,
          };
          onMapClick('district', areaData, null);
        });

        polygonsRef.current.push({ polygon });
      });

      if (totalBounds.getCenter()) {
        mapInstanceRef.current.fitBounds(totalBounds, {
          padding: 50,
          maxZoom: 13,
          duration: 500,
        });
      }
    },
    [geoJSONData, eventData, onMapClick]
  );

  // 4. 최적화된 경계 생성 함수
  const createDistrictBoundary = useCallback(
    (districtCode: string, customerInfo: CustomerInfo[]) => {
      console.log('Creating district boundary with code:', districtCode);

      if (!mapInstanceRef.current || !geoJSONData) {
        console.error('Map or GeoJSON data not initialized');
        return;
      }

      const districtFeatures = geoJSONData.features.filter((feature) => {
        const featureCode = feature.properties.SIG_CD;
        return featureCode.startsWith(districtCode);
      });

      if (districtFeatures.length === 0) {
        console.error(
          'No matching features found for district code:',
          districtCode
        );
        return;
      }

      removeDistrictBoundaries();

      districtFeatures.forEach((feature) => {
        const paths = convertGeometryToPaths(feature.geometry);
        if (!paths) return;

        // 해당 district의 이벤트 확인
        const districtEvents = eventData.filter(
          (event) => event.district_code === feature.properties.SIG_CD
        );

        // 이벤트 종류에 따른 색상 설정
        let strokeColor = '#468DF7';
        let fillColor = '#33CAFB';
        let strokeOpacity = 0.6;
        let fillOpacity = 0.1;

        if (districtEvents.length > 0) {
          // 가장 심각한 이벤트 찾기
          const mostSevereEvent = districtEvents.reduce((prev, curr) =>
            prev.event_kind < curr.event_kind ? prev : curr
          );

          if (mostSevereEvent.event_kind === 1) {
            strokeColor = '#d93e10';
            fillColor = '#d93e10';
            strokeOpacity = 0.8;
            fillOpacity = 0.8;
          } else if (mostSevereEvent.event_kind === 2) {
            strokeColor = '#f1a409';
            fillColor = '#f1a409';
            strokeOpacity = 0.8;
            fillOpacity = 0.8;
          }
        }

        const polygon = new window.naver.maps.Polygon({
          map: mapInstanceRef.current,
          paths: paths,
          strokeColor,
          strokeOpacity,
          strokeWeight: 2,
          fillColor,
          fillOpacity,
          clickable: true,
          zIndex: 10,
        });

        polygonsRef.current.push({ polygon });

        // 고객 마커 생성
        customerInfo.forEach((customer) => {
          if (customer.gps_position) {
            try {
              const position = JSON.parse(customer.gps_position);
              const markerPosition = new window.naver.maps.LatLng(
                position.lat,
                position.lng
              );
              const marker = new window.naver.maps.Marker({
                position: markerPosition,
                map: mapInstanceRef.current,
                title: customer.customer_name || '',
                clickable: true,
                zIndex: 100,
              });

              // 마커 클릭 이벤트 추가
              window.naver.maps.Event.addListener(marker, 'click', () => {
                mapInstanceRef.current.setCenter(markerPosition);
                mapInstanceRef.current.setZoom(15);
                onMapClick('customer', null, customer);
              });

              markersRef.current.push(marker);
            } catch (error) {
              console.error('Error creating marker:', error);
            }
          }
        });
      });
    },
    [geoJSONData, eventData, onMapClick]
  );

  // 그 다음 updateMap 함수 선언
  const updateMap = useCallback(
    (level: string, area: AreaData | null) => {
      console.log('Updating map for level:', level, 'and area:', area);

      if (!area) {
        resetMap();
        return;
      }

      if (level === 'city') {
        console.log('Rendering city boundaries for:', area.code);
        removeAllCircles();
        removeDistrictBoundaries();
        createDistrictBoundaries(area.code);
      } else if (level === 'district') {
        console.log('Rendering district boundaries for:', area.code);
        removeDistrictBoundaries();
        createDistrictBoundary(area.code, customerList);
      }

      // 선택된 지역의 중심점 찾기
      const selectedFeature = geoJSONData?.features.find(
        (feature) => feature.properties.SIG_CD === area.code
      );

      if (selectedFeature && mapInstanceRef.current) {
        const paths = convertGeometryToPaths(selectedFeature.geometry);
        if (paths && paths.length > 0) {
          const bounds = new window.naver.maps.LatLngBounds();
          paths.forEach((path) =>
            path.forEach((coord) => bounds.extend(coord))
          );

          // 중심점 계산 및 이동
          const center = bounds.getCenter();
          mapInstanceRef.current.setCenter(center);

          // 적절한 줌 레벨 설정
          setTimeout(() => {
            mapInstanceRef.current.setZoom(
              ZOOM_LEVELS[level as keyof typeof ZOOM_LEVELS]
            );
          }, 100);
        }
      }
    },
    [
      createDistrictBoundaries,
      createDistrictBoundary,
      customerList,
      resetMap,
      geoJSONData,
    ]
  );

  const getZoomLevel = (level: string, featureCount: number): number => {
    // featureCount에 따라 줌 레벨을 동적으로 조정
    if (featureCount > 100) {
      return 7; // 많은 데이터가 있을 경우 넓은 지역을 보여줌
    } else if (featureCount > 50) {
      return 10; // 중간 정도의 데이터
    } else if (featureCount > 20) {
      return 12; // 적은 데이터
    } else {
      return 15; // 매우 적은 데이터
    }
  };

  useEffect(() => {
    console.log('GeoJSON Data:', geoJSONData);
    if (!selectedArea) {
      console.log('selectedArea가 null입니다. 지도를 초기화합니다.');
      updateMap(currentLevel, null);
      return;
    }

    // 현재 레벨에 따른 줌 레벨 설정
    const featureCount = geoJSONData?.features.length || 0; // feature 개수
    const zoomLevel = getZoomLevel(currentLevel, featureCount);

    // 지도 이동 및 확대 적용
    if (mapInstanceRef.current) {
      const selectedFeature = geoJSONData?.features.find(
        (feature) => feature.properties.SIG_CD === selectedArea.code
      );

      if (selectedFeature) {
        const paths = convertGeometryToPaths(selectedFeature.geometry);
        if (paths && paths.length > 0) {
          const bounds = new window.naver.maps.LatLngBounds();
          paths.forEach((path) => {
            path.forEach((latlng) => bounds.extend(latlng));
          });
          const center = bounds.getCenter();

          // 중심점으로 이동 후 줌 레벨 변경
          mapInstanceRef.current.panTo(center);
          setTimeout(() => {
            mapInstanceRef.current.setZoom(zoomLevel);
          }, 100);
        }
      }
    }

    // 기존의 updateMap 호출
    updateMap(currentLevel, selectedArea);
  }, [selectedArea, currentLevel, geoJSONData]);

  const calculatePolygonCentroid = (
    paths: naver.maps.LatLng[][]
  ): naver.maps.LatLng => {
    let totalArea = 0;
    let centroidLat = 0;
    let centroidLng = 0;

    paths.forEach((path) => {
      let area = 0;
      let latSum = 0;
      let lngSum = 0;

      for (let i = 0; i < path.length - 1; i++) {
        const lat1 = path[i].lat();
        const lng1 = path[i].lng();
        const lat2 = path[i + 1].lat();
        const lng2 = path[i + 1].lng();

        const stepArea = lat1 * lng2 - lat2 * lng1;
        area += stepArea;
        latSum += (lat1 + lat2) * stepArea;
        lngSum += (lng1 + lng2) * stepArea;
      }

      totalArea += area;
      centroidLat += latSum;
      centroidLng += lngSum;
    });

    // 면적이 0이 아닐 경우 중심 좌표 계산
    if (totalArea !== 0) {
      centroidLat /= 3 * totalArea;
      centroidLng /= 3 * totalArea;
    }

    return new window.naver.maps.LatLng(centroidLat, centroidLng);
  };

  // 5. 좌표 변환 유틸리티 함수
  const convertGeometryToPaths = useCallback(
    (geometry: Geometry): naver.maps.LatLng[][] | null => {
      try {
        if (geometry.type === 'Polygon') {
          return (geometry.coordinates as number[][][]).map((ring) =>
            ring.map(
              (coord) => new window.naver.maps.LatLng(coord[1], coord[0])
            )
          );
        } else if (geometry.type === 'MultiPolygon') {
          return (geometry.coordinates as number[][][][]).flatMap((polygon) =>
            polygon.map((ring) =>
              ring.map(
                (coord) => new window.naver.maps.LatLng(coord[1], coord[0])
              )
            )
          );
        }
      } catch (error) {
        console.error('Error converting geometry:', error);
      }
      return null;
    },
    []
  );

  // 6. 폴리곤 이벤트 설정 함수
  const setupPolygonEvents = useCallback(
    (
      polygon: naver.maps.Polygon,
      feature: GeoJSONFeature,
      center: naver.maps.LatLng
    ) => {
      window.naver.maps.Event.addListener(polygon, 'click', () => {
        handlePolygonClick(feature, center);
      });
    },
    []
  );

  // 7. 폴리곤 클릭 핸들러
  const handlePolygonClick = useCallback(
    (feature: GeoJSONFeature, center: naver.maps.LatLng) => {
      if (!mapInstanceRef.current) return;

      removeDistrictBoundaries();
      createDistrictBoundary(feature.properties.SIG_CD, customerList);

      mapInstanceRef.current.panTo(center, {
        duration: 600,
        easing: 'easeOutCubic',
      });

      const areaData: AreaData = {
        code: feature.properties.SIG_CD,
        name: feature.properties.SIG_KOR_NM,
      };
      onMapClick('district', areaData, null);
    },
    [customerList, onMapClick, createDistrictBoundary]
  );

  const removeAllCircles = useCallback(() => {
    circlesRef.current.forEach((circle, index) => {
      if (circle.mapObject && typeof circle.mapObject.setMap === 'function') {
        circle.mapObject.setMap(null);
      }
      // 오버레이 삭제
      if (circle.overlay && typeof circle.overlay.setMap === 'function') {
        circle.overlay.setMap(null); // 지도에서 오버레이 제거
      }
      if (circle.listener) {
        window.naver.maps.Event.removeListener(circle.listener);
      }
    });
    circlesRef.current = [];
    setCurrentCircles([]);
  }, []);

  const createCircles = useCallback(
    (circles: CircleData[]) => {
      console.log('Creating circles for count:', circles.length);

      const newCircles = circles.slice(1).map((circleData) => {
        // 현재 circle의 city_code와 일치하는 모든 이벤트 찾기
        const matchingEvents = eventData.filter(
          (event) => event.city_code === circleData.code
        );

        // 이벤트가 있는지 확인하고 색상 설정
        let strokeColor = '#468DF7';
        let fillColor = '#33CAFB';
        let strokeOpacity = 0.6;
        let fillOpacity = 0.1;

        if (matchingEvents.length > 0) {
          // 가장 심각한 이벤트 찾기
          const mostSevereEvent = matchingEvents.reduce((prev, curr) =>
            prev.event_kind < curr.event_kind ? prev : curr
          );

          if (mostSevereEvent.event_kind === 1) {
            strokeColor = '#d93e10';
            fillColor = '#d93e10';
            strokeOpacity = 0.8;
            fillOpacity = 0.8;
          } else if (mostSevereEvent.event_kind === 2) {
            strokeColor = '#f1a409';
            fillColor = '#f1a409';
            strokeOpacity = 0.8;
            fillOpacity = 0.8;
          }
        }

        const circle = new window.naver.maps.Circle({
          map: mapInstanceRef.current,
          center: new window.naver.maps.LatLng(
            Number(circleData.center.lat),
            Number(circleData.center.lng)
          ),
          radius: circleData.radius,
          strokeColor,
          strokeOpacity,
          strokeWeight: 2,
          fillColor,
          fillOpacity,
          clickable: true,
          zIndex: 10,
        });

        // 클릭 이벤트 수정
        window.naver.maps.Event.addListener(circle, 'click', async () => {
          const center = new window.naver.maps.LatLng(
            Number(circleData.center.lat),
            Number(circleData.center.lng)
          );

          // 먼저 지도 이동
          mapInstanceRef.current.setZoom(11);
          mapInstanceRef.current.panTo(center, {
            duration: 300,
            easing: 'easeOutCubic',
          });

          // 기존 요소들 제거
          removeAllCircles();

          // 상태 업데이트
          const areaData = {
            code: circleData.code,
            name: circleData.name,
          };
          onMapClick('city', areaData, null);

          // 약간의 지연 후 경계 생성 (상태 업데이트 이후)
          setTimeout(() => {
            createDistrictBoundaries(circleData.code);
          }, 100);
        });

        return { ...circleData, mapObject: circle };
      });

      circlesRef.current = newCircles;
      setCurrentCircles(newCircles);
    },
    [eventData, removeAllCircles, createDistrictBoundaries, onMapClick]
  );

  useEffect(() => {
    if (
      isMapLoaded &&
      isGeoJSONLoaded &&
      mapInstanceRef.current &&
      geoJSONData &&
      circlesRef.current.length === 0
    ) {
      console.log('Creating initial circles');
      createCircles(cityData);
    }
  }, [
    isMapLoaded,
    isGeoJSONLoaded,
    mapInstanceRef,
    geoJSONData,
    createCircles,
    cityData,
  ]);

  // 상단에 새로운 상태 추가
  const [eventUpdateTrigger, setEventUpdateTrigger] = useState(0);

  // eventData가 변경될 때마다 강제 업데이트 트리거
  useEffect(() => {
    console.log('New event data received:', eventData);
    setEventUpdateTrigger((prev) => prev + 1);
  }, [eventData]);

  // 강제 업데이트 위한 useEffect
  useEffect(() => {
    if (!isMapLoaded) return;

    console.log('Forcing map update due to event data change');

    // 현재 표시된 모든 요소 제거
    removeAllCircles();
    removeDistrictBoundaries();

    // 현재 레벨에 따라 다시 그리기
    switch (currentLevel) {
      case 'land':
        createCircles(cityData);
        break;
      case 'city':
        if (selectedArea) {
          createDistrictBoundaries(selectedArea.code);
        }
        break;
      case 'district':
        if (selectedArea) {
          createDistrictBoundary(selectedArea.code, customerList);
        }
        break;
    }
  }, [
    eventUpdateTrigger,
    isMapLoaded,
    currentLevel,
    selectedArea,
    cityData,
    customerList,
    removeAllCircles,
    removeDistrictBoundaries,
    createCircles,
    createDistrictBoundaries,
    createDistrictBoundary,
  ]);

  // 컴포넌트 마운트/언마운트 로깅
  useEffect(() => {
    console.log('MapArea mounted/updated with eventData:', eventData);
    return () => {
      console.log('MapArea unmounting');
      // cleanup
      removeAllCircles();
      removeDistrictBoundaries();
    };
  }, []);

  // 상단에 이벤트 데이터 참조 추가
  const prevEventDataRef = useRef<typeof eventData>([]);

  // eventData 변경 감지를 위한 useEffect 수정
  useEffect(() => {
    console.log('Event data changed:', eventData);

    // 이벤트 데이터 변경 여부를 더 구체적으로 확인
    const hasEventDataChanged = eventData.some((newEvent, index) => {
      const prevEvent = prevEventDataRef.current[index];
      if (!prevEvent) return true;

      return (
        newEvent.city_code !== prevEvent.city_code ||
        newEvent.district_code !== prevEvent.district_code ||
        newEvent.event_kind !== prevEvent.event_kind
      );
    });

    if (!hasEventDataChanged) return;

    if (!isMapLoaded || !mapInstanceRef.current) return;

    console.log('Updating map with new event data');

    const updateMap = () => {
      // 현재 표시된 모든 요소들을 제거
      removeAllCircles();
      removeDistrictBoundaries();

      // 현재 레벨에 따라 다시 그리기
      switch (currentLevel) {
        case 'land':
          console.log('Redrawing circles for land level');
          createCircles(cityData);
          break;
        case 'city':
          if (selectedArea) {
            console.log('Redrawing boundaries for city level');
            createDistrictBoundaries(selectedArea.code);
          }
          break;
        case 'district':
          if (selectedArea) {
            console.log('Redrawing boundary for district level');
            createDistrictBoundary(selectedArea.code, customerList);
          }
          break;
      }
    };

    updateMap();

    // 현재 이벤트 데이터를 이전 데이터로 저장
    prevEventDataRef.current = JSON.parse(JSON.stringify(eventData));
  }, [
    eventData,
    isMapLoaded,
    currentLevel,
    selectedArea,
    cityData,
    customerList,
    createCircles,
    createDistrictBoundaries,
    createDistrictBoundary,
    removeAllCircles,
    removeDistrictBoundaries,
  ]);

  const updateMapBounds = useCallback(() => {
    if (!mapInstanceRef.current || !geoJSONData?.features || !selectedArea)
      return;

    try {
      console.log('Starting map bounds update for:', selectedArea.code);
      const bounds = new window.naver.maps.LatLngBounds();
      let pointsAdded = 0;

      // 선택된 지역의 모든 폴리곤 찾기
      const matchingFeatures = geoJSONData.features.filter((feature) =>
        feature.properties?.SIG_CD.startsWith(selectedArea.code)
      );

      console.log(`Found ${matchingFeatures.length} matching features`);

      matchingFeatures.forEach((feature) => {
        if (feature.geometry?.type === 'Polygon') {
          feature.geometry.coordinates.forEach((ring) => {
            ring.forEach(([lng, lat]) => {
              bounds.extend(new window.naver.maps.LatLng(lat, lng));
              pointsAdded++;
            });
          });
        }
      });

      console.log(`Added ${pointsAdded} points to bounds`);

      if (bounds.getCenter() && pointsAdded > 0) {
        console.log('Applying new bounds to map');
        mapInstanceRef.current.fitBounds(bounds, {
          top: 100,
          right: 100,
          bottom: 100,
          left: 100,
          duration: 1000,
          maxZoom: 11,
        });

        // fitBounds 호출 후 지도가 업데이트 되었는지 확인
        setTimeout(() => {
          const currentZoom = mapInstanceRef.current.getZoom();
          console.log('Current zoom level after fitBounds:', currentZoom);
        }, 1100); // fitBounds의 duration + 약간의 여유
      }
    } catch (error) {
      console.error('Error updating map bounds:', error);
    }
  }, [geoJSONData, selectedArea]);

  useEffect(() => {
    console.log('Map bounds update effect triggered');
    updateMapBounds();
  }, [updateMapBounds, currentLevel]);

  // 상단에 새로운 상태 추가
  const [lastEventUpdate, setLastEventUpdate] = useState<number>(0);

  // eventData 변경 감지를 위한 useEffect 수정
  useEffect(() => {
    console.log('Event data changed:', eventData);

    // 이벤트 데이터가 변경될 때마다 타임스탬프 업데이트
    setLastEventUpdate(Date.now());

    const updateMapElements = () => {
      // 폴리곤 업데이트
      if (polygonsRef.current.length > 0) {
        polygonsRef.current.forEach(({ polygon }) => {
          if (!polygon) return;

          const paths = polygon.getPath();
          if (!Array.isArray(paths)) {
            console.log(paths)
            return;
          } // paths가 배열인지 확인

          const matchingFeature = geoJSONData?.features.find((feature) => {
            const featurePaths = convertGeometryToPaths(feature.geometry);
            if (!Array.isArray(featurePaths)) return false; // featurePaths가 배열인지 확인

            return featurePaths.some((path) =>
                Array.isArray(path) && // path가 배열인지 확인
                path.some((coord) =>
                    paths.some(
                        (p) => coord.lat() === p.lat() && coord.lng() === p.lng()
                    )
                )
            );
          });

          if (!matchingFeature) return;

          const districtEvents = eventData.filter(
              (event) => event.district_code === matchingFeature.properties.SIG_CD
          );

          let strokeColor = '#468DF7';
          let fillColor = '#33CAFB';
          let strokeOpacity = 0.6;
          let fillOpacity = 0.1;

          if (districtEvents.length > 0) {
            const mostSevereEvent = districtEvents.reduce((prev, curr) =>
                prev.event_kind < curr.event_kind ? prev : curr
            );

            if (mostSevereEvent.event_kind === 1) {
              strokeColor = '#d93e10';
              fillColor = '#d93e10';
              strokeOpacity = 0.8;
              fillOpacity = 0.8;
            } else if (mostSevereEvent.event_kind === 2) {
              strokeColor = '#f1a409';
              fillColor = '#f1a409';
              strokeOpacity = 0.8;
              fillOpacity = 0.8;
            }
          }

          polygon.setOptions({
            strokeColor,
            strokeOpacity,
            strokeWeight: 2,
            fillColor,
            fillOpacity,
            clickable: true,
            zIndex: 10,
          });
        });
      }

      // 원(Circle) 업데이트
      if (circlesRef.current.length > 0) {
        circlesRef.current.forEach((circle) => {
          if (!circle.mapObject) return;

          const circleEvents = eventData.filter(
              (event) => event.city_code === circle.code
          );

          let strokeColor = '#468DF7';
          let fillColor = '#33CAFB';
          let strokeOpacity = 0.6;
          let fillOpacity = 0.1;

          if (circleEvents.length > 0) {
            const mostSevereEvent = circleEvents.reduce((prev, curr) =>
                prev.event_kind < curr.event_kind ? prev : curr
            );

            if (mostSevereEvent.event_kind === 1) {
              strokeColor = '#d93e10';
              fillColor = '#d93e10';
              strokeOpacity = 0.8;
              fillOpacity = 0.8;
            } else if (mostSevereEvent.event_kind === 2) {
              strokeColor = '#f1a409';
              fillColor = '#f1a409';
              strokeOpacity = 0.8;
              fillOpacity = 0.8;
            }
          }

          circle.mapObject.setOptions({
            strokeColor,
            strokeOpacity,
            strokeWeight: 2,
            fillColor,
            fillOpacity,
            clickable: true,
            zIndex: 10,
          });
        });
      }
    };

    // 즉시 업데이트 실행
    updateMapElements();

    // 약간의 지연 후 다시 한번 업데이트 (비동기 처리를 위해)
    const timeoutId = setTimeout(updateMapElements, 100);

    return () => clearTimeout(timeoutId);
  }, [eventData, geoJSONData, lastEventUpdate]);

  if (error) {
    return <div>Error loading map: {error}</div>;
  }

  return (
    <div className='map_area center_area'>
      <div
        id='map'
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      ></div>
      <div className='map_nav'>
        <ul>
          {history &&
            history.length > 0 &&
            history.map((region, index) => (
              <li
                key={index}
                onClick={() => {
                  console.log('Navigating to:', region);
                  prevMap(region.level, region.area);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  {region.level === 'land' || !region.area
                    ? '전국'
                    : region.area.name}
                </div>
              </li>
            ))}
        </ul>
      </div>
      {!isMapLoaded && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          Loading map...
        </div>
      )}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'red',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
export default MapArea;

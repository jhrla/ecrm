import axios from 'axios';
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  CustomerInfo,
  DeviceInfo,
  EventData,
  FloorInfo,
} from '../interface/DashboardType';
import BuildHeader from '../maparea/BuildHeader';
import Legend from 'ec_rm/components/common/Legend';
import ApiClient from 'ec_rm/utils/ApiClient';
import { useNavigate } from 'react-router-dom';

interface TooltipProps {
  visible: boolean;
  content: React.ReactNode;
  position: { x: number; y: number };
}

interface FloorCanvasProps {
  customerInfo: CustomerInfo | undefined;
  deviceList: DeviceInfo[];
  eventList: EventData[] | undefined;
  floorData: FloorInfo | undefined;
  handlePageChange: (pageName: string) => void;
}

const Tooltip = React.memo(({ visible, content, position }: TooltipProps) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        backgroundColor: '#2A2A2A',
        color: '#fff',
        padding: '10px',
        borderRadius: '8px',
        zIndex: 9999,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        fontSize: '14px',
        minWidth: '200px',
      }}
    >
      {content}
    </div>
  );
});

export const ExitStatus: React.FC<FloorCanvasProps> = ({
  customerInfo,
  deviceList,
  floorData,
  eventList,
  handlePageChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState<DeviceInfo | null>(null);
  const [iconImages, setIconImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [smokeDensity, setSmokeDensity] = useState('');
  const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  // 깜박일 device_ids 리스트 (여러 개 가능) 및 이벤트 타입
  const blinkingDeviceIds = useMemo(
    () =>
      eventList && eventList.length > 0
        ? eventList.map((data) => ({
            device_id: data.device_id,
            event_kind: data.event_kind,
          }))
        : [],
    [eventList]
  );

  const [isBlinkVisible, setIsBlinkVisible] = useState(true);
  const blinkSpeed = 500; // 깜박임 간격 (ms)

  const getIconForDevice = useCallback(
    () => ({
      CC: `${process.env.PUBLIC_URL}/images/icon_product_01.png`,
      AC: `${process.env.PUBLIC_URL}/images/icon_product_02.png`,
      GT: `${process.env.PUBLIC_URL}/images/icon_product_03.png`,
      RE: `${process.env.PUBLIC_URL}/images/icon_product_04.png`,
      '148': `${process.env.PUBLIC_URL}/images/icon_product_05.png`,
      '160': `${process.env.PUBLIC_URL}/images/icon_product_06.png`,
      MO: `${process.env.PUBLIC_URL}/images/icon_product_07.png`,
      '176': `${process.env.PUBLIC_URL}/images/icon_product_08.png`,
      '128': `${process.env.PUBLIC_URL}/images/icon_product_10.png`,
      '129': `${process.env.PUBLIC_URL}/images/icon_product_10.png`,
    }),
    []
  );
  // 특정 아이콘 깜박임 관리
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsBlinkVisible((prev) => !prev);
    }, blinkSpeed);

    return () => clearInterval(intervalId);
  }, [blinkSpeed]);

  // deviceList에서 좌표 데이터 파싱
  const memoizedDevicePositions = useMemo(() => {
    return deviceList.reduce(
      (acc, device) => {
        if (device.install_position) {
          const match = device.install_position.match(/x:(\d+);y:(\d+)/);
          if (match) {
            acc[device.device_id] = {
              x: parseInt(match[1], 10),
              y: parseInt(match[2], 10),
            };
          }
        }
        return acc;
      },
      {} as { [key: string]: { x: number; y: number } }
    );
  }, [deviceList]);

  const drawAllItems = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }

    deviceList.forEach((device) => {
      const position = memoizedDevicePositions[device.device_id];
      const iconImage = iconImages[device.device_type];

      if (position && iconImage) {
        const { x, y } = position;

        if (blinkingDeviceIds.length > 0) {
          // 현재 장비의 모든 이벤트 찾기
          const deviceEvents = blinkingDeviceIds.filter(
            (item) => item.device_id === device.device_id
          );

          if (deviceEvents.length > 0) {
            // 가장 중요한 이벤트 선택 (event_kind가 1이 가장 중요)
            const mostSevereEvent = deviceEvents.reduce((prev, curr) =>
              prev.event_kind < curr.event_kind ? prev : curr
            );

            if (isBlinkVisible) {
              // 깜박임 효과 (배경 + 아이콘)
              ctx.beginPath();
              ctx.arc(x, y, 20, 0, Math.PI * 2);
              const gradient = ctx.createRadialGradient(x, y, 15, x, y, 25);
              gradient.addColorStop(0, '#ffffff');
              gradient.addColorStop(
                1,
                mostSevereEvent.event_kind === 1 ? '#d93e10' : '#f1a409'
              );
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 10;
              ctx.stroke();

              // 깜박일 때만 아이콘 그리기
              ctx.drawImage(iconImage, x - 15, y - 15, 30, 30);
            }
          } else {
            // 이벤트가 없는 장비는 항상 표시
            ctx.drawImage(iconImage, x - 15, y - 15, 30, 30);
          }
        } else {
          // 이벤트가 없을 때는 모든 아이콘 표시
          ctx.drawImage(iconImage, x - 15, y - 15, 30, 30);
        }
      }
    });

    const drawArrow = (
      ctx: CanvasRenderingContext2D,
      fromX: number,
      fromY: number,
      toX: number,
      toY: number
    ) => {
      const headlen = 10;
      const angle = Math.atan2(toY - fromY, toX - fromX);

      // 점선 화살표
      ctx.beginPath();
      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // 화살표 머리
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headlen * Math.cos(angle - Math.PI / 6),
        toY - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - headlen * Math.cos(angle + Math.PI / 6),
        toY - headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = 'red';
      ctx.fill();
    };

    // 이벤트 순서대로 화살표 그리기
    if (eventList && eventList.length > 1) {
      // event_kind가 1인 이벤트만 필터링
      const filteredEvents = eventList.filter(
        (event) => event.event_kind === 1
      );

      // 시간순으로 정렬
      const sortedEvents = filteredEvents.sort(
        (a, b) =>
          new Date(a.event_time || '').getTime() -
          new Date(b.event_time || '').getTime()
      );

      // 연속된 이벤트 사이에 화살표 그리기
      for (let i = 0; i < sortedEvents.length - 1; i++) {
        const currentDevice = deviceList.find(
          (d) => d.device_id === sortedEvents[i].device_id
        );
        const nextDevice = deviceList.find(
          (d) => d.device_id === sortedEvents[i + 1].device_id
        );

        if (currentDevice && nextDevice) {
          const currentPos = memoizedDevicePositions[currentDevice.device_id];
          const nextPos = memoizedDevicePositions[nextDevice.device_id];

          if (currentPos && nextPos) {
            drawArrow(ctx, currentPos.x, currentPos.y, nextPos.x, nextPos.y);
          }
        }
      }
    }
  }, [
    memoizedDevicePositions,
    iconImages,
    isBlinkVisible,
    blinkingDeviceIds,
    eventList,
    deviceList,
  ]);

  useEffect(() => {
    drawAllItems();
  }, [drawAllItems]);

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    setCanvasSize({ width, height });
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      drawAllItems();
    }
  }, [canvasSize, drawAllItems]);

  useEffect(() => {
    const fetchImage = async () => {
      if (!floorData?.file_path) return;

      if (imageCache[floorData.file_path]) {
        const cachedImageUrl = imageCache[floorData.file_path];
        const image = new Image();
        image.src = cachedImageUrl;
        image.onload = () => {
          imageRef.current = image;
          drawAllItems();
        };
        return;
      }

      try {
        const response = await ApiClient.get(
          `/api/getFloorImage?imagePath=${floorData.file_path}`,
          {
            responseType: 'blob',
          }
        );

        const imageUrl = URL.createObjectURL(response.data);
        const image = new Image();
        image.src = imageUrl;
        image.onload = () => {
          imageRef.current = image;
          drawAllItems();

          setImageCache((prevCache) => ({
            ...prevCache,
            [floorData.file_path as string]: imageUrl,
          }));
        };
      } catch (error) {
        console.error('이미지 불러오기 오류:', error);
      }
    };

    fetchImage();
  }, [floorData?.floor_no, drawAllItems, imageCache]);

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = Object.entries(getIconForDevice()).map(
        ([device, src]) => {
          return new Promise<[string, HTMLImageElement]>((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              resolve([device, img]);
            };
            img.onerror = (error) => {
              console.error(`이미지 로드 실패: ${src}`, error);
              reject(error);
            };
          });
        }
      );

      try {
        const loadedImages = await Promise.all(imagePromises);
        setIconImages(Object.fromEntries(loadedImages));
      } catch (error) {
        console.error('Error loading icon images:', error);
      }
    };

    loadImages();
  }, [getIconForDevice]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundHoveredItem: DeviceInfo | null = null;
    let tooltipX = 0;
    let tooltipY = 0;

    deviceList.forEach((device) => {
      const { x: eqX, y: eqY } = memoizedDevicePositions[device.device_id] || {
        x: 50,
        y: 50,
      };
      const distance = Math.sqrt((x - eqX) ** 2 + (y - eqY) ** 2);

      if (distance <= 20) {
        foundHoveredItem = device;
        tooltipX = eqX + 30;
        tooltipY = eqY - 15;
      }
    });

    if (foundHoveredItem) {
      setHoveredItem(foundHoveredItem);
      setTooltipPosition({ x: tooltipX, y: tooltipY });
      setTooltipVisible(true);
    } else {
      setHoveredItem(null);
      setTooltipVisible(false);
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    setTooltipVisible(false);
  };
  const handleToBuilding = () => {
    handlePageChange('building');
  };

  const renderTooltipContent = (
    item: DeviceInfo,
    event: EventData | undefined
  ) => {
    // 현재 장비의 이벤트 찾기
    const deviceEvent = eventList?.find((e) => e.device_id === item.device_id);

    console.log('Device Data:', item); // 디버깅용
    console.log('Event Data:', deviceEvent); // 디버깅용

    return (
      <div>
        <h5
          style={{
            marginTop: 0,
            marginBottom: 0,
            fontSize: '1rem',
            borderBottom: '1px solid #ebebeb',
            position: 'relative',
          }}
        >
          {item.device_name}
          {deviceEvent ? ` - ${deviceEvent.event_name}` : ''}
        </h5>
        <ul style={{ marginTop: '5px', listStyleType: 'none', padding: 0 }}>
          <li>
            <strong>장비명:</strong> {item.device_name}
          </li>
          <li>
            <strong>설치위치:</strong> {item.install_address}
          </li>
          <li>
            <strong>온도(℃):</strong>{' '}
            {deviceEvent ? deviceEvent.temp : item.temp || 0}
          </li>
          <li>
            <strong>연기(%):</strong>{' '}
            {deviceEvent ? deviceEvent.smoke_density : item.smoke_density || 0}
          </li>
          <li>
            <strong>습도(%):</strong>{' '}
            {deviceEvent ? deviceEvent.humidity : item.humidity || 0}
          </li>
        </ul>
      </div>
    );
  };

  const imageLoader = useCallback(
    async (imagePath: string) => {
      try {
        const cachedImage = imageCache[imagePath];
        if (cachedImage) return cachedImage;

        const response = await ApiClient.post(`/api/getFloorImage`, imagePath, {
          headers: { 'Content-Type': 'text/plain' },
          responseType: 'blob',
        });

        const imageUrl = URL.createObjectURL(response.data);
        setImageCache((prev) => ({ ...prev, [imagePath]: imageUrl }));
        return imageUrl;
      } catch (error) {
        console.error('이미지 로딩 오류:', error);
        return null;
      }
    },
    [imageCache]
  );

  const handleRecorverSend = async () => {
    try {
      console.log('전송할 이벤트 데이터:', eventList); // 데이터 확인

      const response = await ApiClient.post('/api/sendRecoverRequest', {
        eventList: eventList,
      });

      console.log('API 응답:', response); // 응답 확인
      alert('복구 명령이 전송되었습니다.');
    } catch (error) {
      console.error('상세 에러:', error);
      alert('복구 요청 중 오류가 발생했습니다.');
    }
  };

  const handleConfirmSend = async () => {
    try {
      if (!eventList?.[0]?.com_id) {
        throw new Error('조치할 이벤트 정보가 없습니다.');
      }

      await ApiClient.post('/api/sendConfirmRequest', {
        eventList: eventList,
      });
      alert('조치 및 확인시간이 기록되었습니다.');
    } catch (error) {
      console.error('조치 요청 오류:', error);
      alert('조치 및 확인시간 기록중 오류가 발생했습니다.');
    }
  };

  return (
    <div className='floor_area center_area'>
      <BuildHeader customerInfo={customerInfo} />
      <div className='mt20 ml20 mr20'>
        <div
          className='floor_title'
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflow: 'visible',
          }}
        >
          <div className='btn_area_left'>
            <button
              type='submit'
              className='btn btn-gray btn-sm'
              onClick={handleToBuilding}
            >
              뒤로가기
            </button>
          </div>
          <h3
            className='color_white'
            style={{
              textAlign: 'center',
              flex: 1,
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            화재상황
          </h3>
          <div className='btn_area_right'>
            <button
              type='submit'
              className='btn btn-info btn-sm'
              style={{
                marginLeft: '10px',
                marginRight: '10px',
                backgroundColor: '#468DF7', // 파란색 배경
                borderColor: '#468DF7', // 테두리 색상도 동일하게
                color: '#ffffff', // 텍스트 색상은 흰색
              }}
              onClick={handleConfirmSend}
            >
              조치&확인
            </button>
            <button
              type='submit'
              className='btn btn-info btn-sm'
              onClick={handleRecorverSend}
            >
              화재복구
            </button>
          </div>
        </div>
        <div className='floor_overflow' style={{ position: 'relative' }}>
          <div
            className='floor_plan'
            ref={containerRef}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              id='canvasContainer'
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <canvas
                id='triangleCanvas'
                ref={canvasRef}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
              {hoveredItem && tooltipVisible && (
                <Tooltip
                  visible={true}
                  content={renderTooltipContent(hoveredItem, eventList?.[0])}
                  position={tooltipPosition}
                />
              )}
            </div>
          </div>
        </div>
        <Legend />
      </div>
    </div>
  );
};
export default ExitStatus;

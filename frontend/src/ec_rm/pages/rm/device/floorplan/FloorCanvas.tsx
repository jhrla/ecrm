import axios from 'axios';
import ApiClient from 'ec_rm/utils/ApiClient';
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface TooltipProps {
  visible: boolean;
  content: React.ReactNode;
  position: { x: number; y: number };
  onClose: () => void;
}

interface FloorDevice {
  client_code: string;
  contract_code: string;
  floor_no: number;
  device_id: string;
  com_id: string;
  device_type: string;
  device_name: string;
  install_address: string;
  install_date: string;
  install_position: string | null;
}

interface FloorDeviceWithSelection extends FloorDevice {
  isSelected: boolean;
}

interface FloorList {
  floor_no: number;
  floor_name: string;
  file_path: string;
}

interface FloorCanvasProps {
  selectedFloor: FloorList | null;
  floorList: FloorList[];
  selectedDevice: FloorDevice[];
  onSelectedFloor: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSelectedDeviceUpdate: (selectedDevicde: FloorDevice[]) => void;
  onSaveDevicePosition: () => void;
}

const Tooltip: React.FC<TooltipProps> = ({
  visible,
  content,
  position,
  onClose,
}) => {
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
};

export const FloorCanvas: React.FC<FloorCanvasProps> = ({
  selectedFloor,
  floorList,
  selectedDevice,
  onSelectedFloor,
  onSelectedDeviceUpdate,
  onSaveDevicePosition,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] =
    useState<FloorDeviceWithSelection | null>(null);
  const [devicePositions, setDevicePositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});
  const [iconImages, setIconImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});

  const [isEditMode, setIsEditMode] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [imageCache, setImageCache] = useState<{ [key: string]: string }>({}); // 이미지 캐시

  const getIconForDevice = useCallback(
    () => ({
      // 수정 후 - 컨텍스트 패스를 고려한 경로
      CC: `${process.env.PUBLIC_URL || ''}/images/icon_product_01.png`,
      AC: `${process.env.PUBLIC_URL || ''}/images/icon_product_02.png`,
      GT: `${process.env.PUBLIC_URL || ''}/images/icon_product_03.png`,
      RE: `${process.env.PUBLIC_URL || ''}/images/icon_product_04.png`,
      '148': `${process.env.PUBLIC_URL || ''}/images/icon_product_05.png`,
      '160': `${process.env.PUBLIC_URL || ''}/images/icon_product_06.png`,
      MO: `${process.env.PUBLIC_URL || ''}/images/icon_product_07.png`,
      '176': `${process.env.PUBLIC_URL || ''}/images/icon_product_08.png`,
      '128': `${process.env.PUBLIC_URL || ''}/images/icon_product_10.png`,
      '129': `${process.env.PUBLIC_URL || ''}/images/icon_product_10.png`,
    }),
    []
  );

  const parsePosition = (position: string): { x: number; y: number } => {
    const match = position.match(/x:(\d+);y:(\d+)/);
    if (match) {
      const x = parseInt(match[1], 10);
      const y = parseInt(match[2], 10);
      return { x, y };
    }
    return { x: 50, y: 50 };
  };

  const drawAllItems = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }

    selectedDevice.forEach((eq) => {
      const { x, y } = devicePositions[eq.device_id] || { x: 50, y: 50 };
      const iconImage = iconImages[eq.device_type];
      if (iconImage) {
        ctx.drawImage(iconImage, x - 15, y - 15, 30, 30);
      } else {
        ctx.fillText('?', x, y);
      }
    });
  }, [selectedDevice, devicePositions, iconImages]);

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const parentElement = container.parentElement;
    if (!parentElement) return;

    const { clientWidth, clientHeight } = parentElement;

    const minWidth = 600;
    const minHeight = 400;

    const width = Math.max(clientWidth, minWidth);
    const height = Math.max(clientHeight, minHeight);

    setCanvasSize({ width, height });

    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
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
      try {
        if (!selectedFloor?.file_path) return; // selectedFloor가 없으면 요청하지 않음

        // 이미 해당 이미지가 캐시에 있다면 캐시된 URL 사용
        if (imageCache[selectedFloor.file_path]) {
          const cachedImageUrl = imageCache[selectedFloor.file_path];
          const image = new Image();
          image.src = cachedImageUrl;
          image.onload = () => {
            imageRef.current = image;
            drawAllItems(); // 이미지가 로드된 후 캔버스에 그리기
          };
          return;
        }

        // 서버에 이미지 경로를 문자열로 전송
        const imagePath = selectedFloor.file_path;
        const response = await ApiClient.get(
          `/api/getFloorImage?imagePath=${imagePath}`,
          {
            headers: {
              'Content-Type': 'text/plain', // 문자열로 전송하기 위해 Content-Type을 text/plain으로 설정
            },
            responseType: 'blob', // responseType을 blob으로 설정
          }
        );

        // Blob 데이터를 URL로 변환
        const imageUrl = URL.createObjectURL(response.data);

        const image = new Image();
        image.src = imageUrl;

        image.onload = () => {
          imageRef.current = image;
          drawAllItems(); // 이미지가 로드된 후 캔버스에 그리기

          // 캐시에 이미지 저장
          setImageCache((prevCache) => ({
            ...prevCache,
            [selectedFloor.file_path]: imageUrl, // 경로를 키로 하여 캐싱
          }));
        };
      } catch (error) {
        console.error('이미지 불러오기 오류:', error);
      }
    };

    fetchImage();
  }, [selectedFloor, drawAllItems, imageCache]); // 캐시와 selectedFloor 변경 시만 실행

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = Object.entries(getIconForDevice()).map(
        ([device, src]) => {
          return new Promise<[string, HTMLImageElement]>((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve([device, img]);
            img.onerror = reject;
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

  useEffect(() => {
    drawAllItems();
  }, [drawAllItems]);

  useEffect(() => {
    if (selectedDevice.length > 0) {
      const initialPositions = selectedDevice.reduce(
        (acc, device, index) => {
          const position = device.install_position
            ? parsePosition(device.install_position)
            : { x: 50 * (index + 1), y: 50 };
          acc[device.device_id] = position;
          return acc;
        },
        {} as { [key: string]: { x: number; y: number } }
      );

      setDevicePositions(initialPositions);
    }
  }, [selectedDevice]);

  const updateDevicePosition = useCallback(() => {
    const updatedDevices = selectedDevice.map((device) => {
      const position = devicePositions[device.device_id];
      if (position) {
        // 좌표가 존재하는 경우 install_position 업데이트
        const newPosition = `{x:${Math.round(position.x)};y:${Math.round(position.y)}}`;
        return { ...device, install_position: newPosition };
      }
      return device; // 좌표가 없으면 기존 장치 유지
    });

    onSelectedDeviceUpdate(updatedDevices);
    console.log('All device positions updated:', updatedDevices);
  }, [devicePositions, selectedDevice, onSelectedDeviceUpdate]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isEditMode) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let foundItemId: string | null = null;

      for (const eq of selectedDevice) {
        const eqX = devicePositions[eq.device_id]?.x || 50;
        const eqY = devicePositions[eq.device_id]?.y || 50;

        if (Math.sqrt((x - eqX) ** 2 + (y - eqY) ** 2) <= 20) {
          foundItemId = eq.device_id;
          break;
        }
      }

      if (foundItemId !== null) {
        setIsDragging(true);
        setDragStart({
          x: x - devicePositions[foundItemId].x,
          y: y - devicePositions[foundItemId].y,
        });
        setDraggedItemId(foundItemId);
      }
    },
    [isEditMode, selectedDevice, devicePositions]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let foundHoveredItem: FloorDevice | null = null;
      let tooltipX = 0;
      let tooltipY = 0;

      selectedDevice.forEach((eq) => {
        const eqX = devicePositions[eq.device_id]?.x || 50;
        const eqY = devicePositions[eq.device_id]?.y || 50;

        if (Math.sqrt((x - eqX) ** 2 + (y - eqY) ** 2) <= 20) {
          foundHoveredItem = eq;
          tooltipX = eqX + 30; // 아이콘 오른쪽에 툴팁 위치
          tooltipY = eqY - 15; // 아이콘 중앙에 맞추기
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

      // 드래그 로직 (편집 모드에서만 동작)
      if (isEditMode && isDragging && draggedItemId !== null) {
        const newX = x - dragStart.x;
        const newY = y - dragStart.y;
        setDevicePositions((prevPositions) => ({
          ...prevPositions,
          [draggedItemId]: { x: newX, y: newY },
        }));
        drawAllItems();
      }
    },
    [
      isEditMode,
      isDragging,
      draggedItemId,
      selectedDevice,
      devicePositions,
      dragStart,
      drawAllItems,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging && draggedItemId) {
      setIsDragging(false);
      updateDevicePosition();
      setDraggedItemId(null);
    }
  }, [isDragging, draggedItemId, updateDevicePosition]);

  const handleMouseLeave = useCallback(() => {
    setHoveredItem(null);
    setTooltipVisible(false);
  }, []);

  const onEditModeToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const renderTooltipContent = useCallback((item: FloorDevice) => {
    return (
      <div>
        <h5
          style={{
            padding: '0 0 5px 15px',
            marginTop: 0,
            marginBottom: 0,
            fontSize: '1rem',
            borderBottom: '1px solid #ebebeb',
            position: 'relative',
          }}
        >
          {item.device_name}
          <span
            style={{
              position: 'absolute',
              top: '5px',
              left: '3px',
              width: '8px',
              height: '8px',
              borderRadius: '100%',
              content: '""',
              backgroundColor: '#23CD6F',
            }}
          ></span>
        </h5>
        <ul style={{ marginTop: '5px', listStyleType: 'none', padding: 0 }}>
          <li>
            <span
              style={{
                display: 'inline-block',
                width: '70px',
                fontSize: '.9rem',
                marginBottom: '2px',
                color: '#fff',
              }}
            >
              장비ID
            </span>
            {item.device_id}
          </li>
          <li>
            <span
              style={{
                display: 'inline-block',
                width: '70px',
                fontSize: '.9rem',
                marginBottom: '2px',
                color: '#fff',
              }}
            >
              장비명
            </span>
            {item.device_name}
          </li>
          <li>
            <span
              style={{
                display: 'inline-block',
                width: '70px',
                fontSize: '.9rem',
                marginBottom: '2px',
                color: '#fff',
              }}
            >
              설치주소
            </span>
            {item.install_address}
          </li>
          <li>
            <span
              style={{
                display: 'inline-block',
                width: '70px',
                fontSize: '.9rem',
                marginBottom: '2px',
                color: '#fff',
              }}
            >
              설치일자
            </span>
            {item.install_date}
          </li>
        </ul>
      </div>
    );
  }, []);

  return (
    <div className='col-lg-7 col-md-12'>
      <div className='mt30'>
        <div
          className='floor_title'
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            className='left-container'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <h3 className='color_white'>평면도 층수</h3>
            {floorList.length > 0 && (
              <select
                className='form-control'
                value={
                  selectedFloor
                    ? selectedFloor.floor_no
                    : floorList[0]?.floor_no || ''
                }
                onChange={onSelectedFloor}
              >
                {floorList.map((floor) => (
                  <option key={floor.floor_no} value={floor.floor_no}>
                    {floor.floor_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
            }}
          >
            <button
              type='button'
              className='btn btn-red'
              onClick={onEditModeToggle}
            >
              {isEditMode ? '취소' : '수정'}
            </button>
            {isEditMode && (
              <button
                type='button'
                className='btn btn-primary'
                onClick={onSaveDevicePosition}
              >
                저장
              </button>
            )}
          </div>
        </div>
        <div className='floor_overflow' style={{ position: 'relative' }}>
          <div className='floor_plan' ref={containerRef}>
            <div
              id='canvasContainer'
              style={{ width: '100%', height: '100%', position: 'relative' }}
            >
              <canvas
                id='triangleCanvas'
                ref={canvasRef}
                style={{
                  width: '100%',
                  height: '100%',
                  cursor: isEditMode ? 'move' : 'default', // 편집 모드에서 커서 스타일 변경
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
              />
              {hoveredItem && tooltipVisible && (
                <Tooltip
                  visible={true}
                  content={renderTooltipContent(hoveredItem)}
                  position={tooltipPosition}
                  onClose={() => setTooltipVisible(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorCanvas;

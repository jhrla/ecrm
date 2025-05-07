import React, { useEffect, useRef, useState } from 'react';
import BuildHeader from '../maparea/BuildHeader';

interface TooltipProps {
  visible: boolean;
  content: React.ReactNode;
  position: { x: number; y: number };
  onClose: () => void;
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
        top: position.y,
        left: position.x,
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
      <button onClick={onClose} style={{ marginTop: '10px' }}>
        Close
      </button>
    </div>
  );
};

const CctvView = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    layerId: '',
  });
  const arrowRef = useRef<HTMLDivElement>(null);
  const infoLayerRefs = {
    infoLayer1: useRef<HTMLDivElement>(null),
    infoLayer2: useRef<HTMLDivElement>(null),
    infoLayer3: useRef<HTMLDivElement>(null),
  };

  const imgSize = 30;
  const [imagesLoaded, setImagesLoaded] = useState(false); // 이미지 로딩 상태 추가
  const images = [
    { xPercent: 12.5, yPercent: 25, layerId: 'infoLayer1', img: new Image() },
    {
      xPercent: 37.5,
      yPercent: 37.5,
      layerId: 'infoLayer2',
      img: new Image(),
    },
    {
      xPercent: 83.75,
      yPercent: 12.5,
      layerId: 'infoLayer3',
      img: new Image(),
    },
  ];

  const imgSources = [
    '/images/icon_product_01.png',
    '/images/icon_product_01.png',
    '/images/icon_product_01.png',
  ];

  // Load images on mount
  useEffect(() => {
    let loadedImages = 0;
    imgSources.forEach((src, index) => {
      images[index].img.src = src;
      images[index].img.onload = () => {
        loadedImages += 1;
        if (loadedImages === imgSources.length) {
          setImagesLoaded(true); // 모든 이미지가 로드되면 상태를 업데이트
        }
      };
    });

    const resizeCanvas = () => {
      const canvas = canvasRef.current!;
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = canvas.parentElement?.clientHeight || 300;
      setCanvasSize({ width: canvas.width, height: canvas.height });
      drawCanvas();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const drawCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imagesLoaded) {
      // 이미지가 로드되었을 때만 캔버스에 그리기
      images.forEach((image) => {
        const x = (image.xPercent / 100) * canvas.width;
        const y = (image.yPercent / 100) * canvas.height;
        ctx.drawImage(image.img, x, y, imgSize, imgSize);
      });
    }
  };

  const updateImagePosition = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging !== null) {
      images[isDragging].xPercent = (mouseX / canvasSize.width) * 100;
      images[isDragging].yPercent = (mouseY / canvasSize.height) * 100;
      drawCanvas();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    images.forEach((image, index) => {
      const x = (image.xPercent / 100) * canvasSize.width;
      const y = (image.yPercent / 100) * canvasSize.height;

      if (
        mouseX >= x &&
        mouseX <= x + imgSize &&
        mouseY >= y &&
        mouseY <= y + imgSize
      ) {
        setIsDragging(index);
      }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    images.forEach((image) => {
      const x = (image.xPercent / 100) * canvasSize.width;
      const y = (image.yPercent / 100) * canvasSize.height;
      const layer =
        infoLayerRefs[image.layerId as keyof typeof infoLayerRefs].current!;
      const arrow = arrowRef.current!;

      if (
        mouseX >= x &&
        mouseX <= x + imgSize &&
        mouseY >= y &&
        mouseY <= y + imgSize
      ) {
        const layerWidth = layer.offsetWidth;
        const layerHeight = layer.offsetHeight;

        let posX = x + imgSize + 25;
        let posY = y - 10;

        if (x > canvasSize.width * 0.75) {
          posX = x - 400;
        }

        if (posX + layerWidth > canvasSize.width) {
          posX = canvasSize.width - layerWidth - 10;
        }
        if (posY + layerHeight > canvasSize.height) {
          posY = canvasSize.height - layerHeight - 10;
        }
        if (posX < 0) posX = 10;
        if (posY < 0) posY = 10;

        layer.style.left = `${posX}px`;
        layer.style.top = `${posY}px`;
        layer.style.display = 'block';

        arrow.style.left = `${x + imgSize / 2}px`;
        arrow.style.top = `${y + imgSize / 2}px`;
        arrow.style.display = 'block';

        setTooltip({
          visible: true,
          x: posX,
          y: posY,
          layerId: image.layerId,
        });
      } else {
        layer.style.display = 'none';
        arrow.style.display = 'none';
      }
    });
  };

  const closeTooltip = (layerId: string) => {
    const layer = infoLayerRefs[layerId as keyof typeof infoLayerRefs].current!;
    layer.style.display = 'none';
    arrowRef.current!.style.display = 'none';
  };

  return (
    <div className='floor_area center_area' style={{ position: 'relative' }}>
      {/* <BuildHeader /> */}
      <div className='mt20 ml20 mr20'>
        <div className='floor_title'>
          <h3 className='color_white'>CCTV영상조회</h3>
          <button type='submit' className='btn btn-info btn-sm'>
            복구
          </button>
        </div>
        <div className='floor_plan'>
          <div id='canvasContainer_ec'>
            <canvas
              id='triangleCanvas'
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={updateImagePosition}
              onMouseUp={handleMouseUp}
              onClick={handleClick}
            ></canvas>

            {/* Info Layers */}
            <div
              id='infoLayer1'
              className='infoLayer lg-layer'
              ref={infoLayerRefs.infoLayer1}
            >
              <button
                className='closeBtn'
                onClick={() => closeTooltip('infoLayer1')}
              >
                Close
              </button>
              <h5 className='infoLayer-header'>123455E8 - 4층</h5>
              <video controls width='378'>
                <source src='./lib/flower.webm' type='video/webm' />
                <source src='./lib/flower.mp4' type='video/mp4' />
              </video>
            </div>

            <div
              id='infoLayer2'
              className='infoLayer lg-layer'
              ref={infoLayerRefs.infoLayer2}
            >
              <button
                className='closeBtn'
                onClick={() => closeTooltip('infoLayer2')}
              >
                Close
              </button>
              <h5 className='infoLayer-header'>123455E5 - 4층</h5>
              <video controls width='378'>
                <source src='./lib/flower.webm' type='video/webm' />
                <source src='./lib/flower.mp4' type='video/mp4' />
              </video>
            </div>

            <div
              id='infoLayer3'
              className='infoLayer lg-layer'
              ref={infoLayerRefs.infoLayer3}
            >
              <button
                className='closeBtn'
                onClick={() => closeTooltip('infoLayer3')}
              >
                Close
              </button>
              <h5 className='infoLayer-header'>123455E2 - 4층</h5>
              <video controls width='378'>
                <source src='./lib/flower.webm' type='video/webm' />
                <source src='./lib/flower.mp4' type='video/mp4' />
              </video>
            </div>

            {/* Arrow */}
            <div id='arrow' className='arrow' ref={arrowRef}></div>
          </div>
        </div>
      </div>
      <div className='mt10 ml20 mr20'>
        <div className='legend'>
          <ul>
            <li>
              <img src='/images/icon_product_01.png' alt='CCTV' /> CCTV
            </li>
            <li>
              <img src='/images/icon_product_02.png' alt='감지기' /> 감지기
            </li>
            <li>
              <img src='/images/icon_product_03.png' alt='게이트웨이' />{' '}
              게이트웨이
            </li>
            <li>
              <img src='/images/icon_product_04.png' alt='리더기' /> 리더기
            </li>
            <li>
              <img src='/images/icon_product_05.png' alt='발신기' /> 발신기
            </li>
            <li>
              <img src='/images/icon_product_06.png' alt='수신기' /> 수신기
            </li>
            <li>
              <img src='/images/icon_product_07.png' alt='움직임감지기' />{' '}
              움직임감지기
            </li>
            <li>
              <img src='/images/icon_product_08.png' alt='중계기' /> 중계기
            </li>
            <li>
              <img src='/images/icon_product_09.png' alt='피난유도등' />{' '}
              피난유도등
            </li>
            <li>
              <img src='/images/icon_product_10.png' alt='화재감지기' />{' '}
              화재감지기
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CctvView;

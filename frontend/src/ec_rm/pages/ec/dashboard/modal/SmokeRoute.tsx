import React, { useEffect, useRef, useState } from 'react';
import BuildHeader from '../maparea/BuildHeader';

const SmokeRoute = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [equipmentPositions, setEquipmentPositions] = useState<
    { x: number; y: number }[]
  >([
    { x: 0.25, y: 0.25 },
    { x: 0.375, y: 0.5 },
    { x: 0.625, y: 0.5 },
  ]); // 아이콘의 초기 위치

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    const fireIcon = new Image();
    fireIcon.src = '/images/icon_product_10.png'; // 화재감지기 아이콘 경로
    const imgSize = 30;

    const backgroundImg = new Image();
    backgroundImg.src = '/images/floor.png'; // 배경 이미지 경로

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 0;
      canvas.height = canvas.parentElement?.clientHeight || 0;
      drawScene();
    };

    const drawFireDetector = (x: number, y: number) => {
      ctx.drawImage(
        fireIcon,
        x - imgSize / 2,
        y - imgSize / 2,
        imgSize,
        imgSize
      );
    };

    const drawArrow = (
      fromX: number,
      fromY: number,
      toX: number,
      toY: number
    ) => {
      const headlen = 10;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const endX = fromX + 0.9 * (toX - fromX);
      const endY = fromY + 0.9 * (toY - fromY);

      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headlen * Math.cos(angle - Math.PI / 6),
        endY - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - headlen * Math.cos(angle + Math.PI / 6),
        endY - headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.lineTo(endX, endY);
      ctx.lineTo(
        endX - headlen * Math.cos(angle - Math.PI / 6),
        endY - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.stroke();
      ctx.fillStyle = 'red';
      ctx.fill();
    };

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 배경 이미지 그리기
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

      // 각 아이콘 위치에 화재감지기 아이콘을 그립니다.
      equipmentPositions.forEach((pos) => {
        drawFireDetector(pos.x * canvas.width, pos.y * canvas.height);
      });

      // 아이콘들 간의 화살표를 그립니다.
      for (let i = 0; i < equipmentPositions.length - 1; i++) {
        drawArrow(
          equipmentPositions[i].x * canvas.width,
          equipmentPositions[i].y * canvas.height,
          equipmentPositions[i + 1].x * canvas.width,
          equipmentPositions[i + 1].y * canvas.height
        );
      }
    };

    const updateImagePosition = (e: MouseEvent) => {
      if (draggedItemIndex !== null && isDragging) {
        const canvasRect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;

        const newPositions = [...equipmentPositions];
        newPositions[draggedItemIndex] = {
          x: mouseX / canvas.width,
          y: mouseY / canvas.height,
        };
        setEquipmentPositions(newPositions);
        drawScene();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const canvasRect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      equipmentPositions.forEach((pos, index) => {
        const x = pos.x * canvas.width;
        const y = pos.y * canvas.height;

        if (
          mouseX >= x - 20 &&
          mouseX <= x + 20 &&
          mouseY >= y - 20 &&
          mouseY <= y + 20
        ) {
          setIsDragging(true);
          setDraggedItemIndex(index);
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedItemIndex(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateImagePosition(e);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    backgroundImg.onload = () => {
      resizeCanvas();
      drawScene(); // 배경 이미지 로드 후 drawScene 호출
    };

    fireIcon.onload = () => {
      drawScene(); // 화재감지기 아이콘 로드 후 drawScene 호출
    };

    window.addEventListener('resize', resizeCanvas);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDragging, draggedItemIndex, equipmentPositions]);

  return (
    <div className='floor_area center_area'>
      {/* <BuildHeader /> */}
      <div className='mt20 ml20 mr20'>
        <div className='floor_title'>
          <h3 className='color_white'>연소경로조회</h3>
          <button type='submit' className='btn btn-info btn-sm'>
            복구
          </button>
        </div>

        <div className='floor_plan'>
          <div id='canvasContainer_ec'>
            <canvas id='triangleCanvas' ref={canvasRef}></canvas>
          </div>
        </div>
      </div>
      <Legend />
    </div>
  );
};

const Legend = () => {
  return (
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
  );
};

export default SmokeRoute;

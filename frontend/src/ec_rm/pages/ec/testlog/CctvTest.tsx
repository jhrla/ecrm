import React, { useEffect, useRef, useState } from 'react';
import WebSocketManager from 'ec_rm/utils/WebSocketManager';
import axios from 'axios';

interface CctvInfo {
  id: number;
  name: string;
  ip: string;
  port: string;
  channel: number;
  username: string;
  password: string;
  location?: string;
  status?: boolean;
  streamType?: 'main' | 'sub';
}

const CctvTest = () => {
  const videoRef = useRef<HTMLCanvasElement>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [streamType, setStreamType] = useState<'main' | 'sub'>('sub');

  const connectToCctv = async () => {
    try {
      setError('');
      setIsConnected(false);

      const webSocketManager = WebSocketManager.getInstance();
      if (videoRef.current) {
        videoRef.current.width = 1280;
        videoRef.current.height = 720;

        await webSocketManager.subscribeCCTVStream(
          {
            ip: '192.168.50.100',
            port: '37777',
            username: 'admin',
            password: 'ktss2402',
            channel: 1,
            stream: streamType,
          },
          videoRef.current,
          'dahua'
        );

        setIsConnected(true);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류';
      setError(`CCTV 연결 실패: ${errorMessage}`);
      console.error('CCTV 연결 에러:', err);
    }
  };

  useEffect(() => {
    const initCctv = async () => {
      try {
        await connectToCctv();
      } catch (error) {
        console.error('CCTV initialization error:', error);
      }
    };

    initCctv();

    return () => {
      const webSocketManager = WebSocketManager.getInstance();
      webSocketManager.unsubscribeCCTVStream();
    };
  }, [streamType]);

  return (
    <div className='cctv-monitor'>
      <h2>Dahua CCTV Monitoring</h2>

      <div className='cctv-controls'>
        <select
          value={streamType}
          onChange={(e) => setStreamType(e.target.value as 'main' | 'sub')}
          className='form-select'
        >
          <option value='main'>메인 스트림</option>
          <option value='sub'>서브 스트림</option>
        </select>
      </div>

      {error && (
        <div
          className='error-message'
          style={{ color: 'red', margin: '10px 0' }}
        >
          {error}
        </div>
      )}

      <div className='cctv-view' style={{ marginTop: '20px' }}>
        <canvas
          ref={videoRef}
          style={{
            width: '100%',
            maxWidth: '1280px',
            height: 'auto',
            backgroundColor: '#000',
          }}
        />
      </div>

      <div className='cctv-info' style={{ marginTop: '20px' }}>
        <p>IP: 192.168.50.100</p>
        <p>채널: 1</p>
        <p>상태: {isConnected ? '연결됨' : '연결 중...'}</p>
      </div>
    </div>
  );
};

export default CctvTest;

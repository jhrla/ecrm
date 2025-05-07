import React, { useState, useRef } from 'react';

interface VoiceModalProps {
  isOpen: boolean; // isOpen은 boolean 타입
  onClose: () => void; // onClose는 리턴 값이 없는 함수 타입
}

const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null); // 현재 재생 중인 오디오 파일 경로
  const audioRef = useRef<HTMLAudioElement | null>(null); // 오디오 태그를 참조할 Ref

  // 오디오 재생 함수
  const handlePlayAudio = (audioSrc: string) => {
    setCurrentAudio(audioSrc); // 현재 오디오 파일 경로 설정
    if (audioRef.current) {
      audioRef.current.src = audioSrc; // 오디오 소스 변경
      audioRef.current.play(); // 오디오 재생
    }
  };

  const handleRowToggle = (rowId: string) => {
    setExpandedRow((prev) => (prev === rowId ? null : rowId));
  };

  return (
    <div
      className='modal'
      style={{
        display: isOpen ? 'block' : 'none',
        position: 'fixed',
        zIndex: 9999,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        maxWidth: '800px',
        width: '90%',
      }}
    >
      <div
        className='modal-header'
        style={{ backgroundColor: '#007bff', color: '#fff' }}
      >
        <h5 className='modal-title'>음성안내방송</h5>
        <button
          type='button'
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '40px',
            lineHeight: 1,
            marginTop: '-5px',
          }}
        >
          &times;
        </button>
      </div>
      <div className='modal-body'>
        <div className='table_type3'>
          <table className='table table-hover'>
            <caption></caption>
            <colgroup>
              <col style={{ width: '150px' }} />
              <col />
              <col style={{ width: '150px' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope='col'>미리듣기</th>
                <th scope='col'>안내방송</th>
                <th scope='col'>방송하기</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: '1',
                  text: '비상구를 따라 신속히 대비하시기 바랍니다.',
                  audio: '/voice/exitvoice.wav', // 오디오 파일 경로
                },
                {
                  id: '2',
                  text: '화재경보가 발령되었으니 신속히 대피 하시기 바랍니다.',
                  audio: '/voice/firevoice.wav',
                },
                {
                  id: '3',
                  text: '신속히 대피 하시기 바랍니다.',
                  audio: '/voice/hurryupvoice.wav',
                },
              ].map((row) => (
                <>
                  <tr key={row.id}>
                    <td>
                      <button
                        onClick={() => handlePlayAudio(row.audio)}
                        style={{
                          backgroundColor: '#007bff',
                          color: '#fff',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          border: 'none',
                          cursor: 'pointer',
                          lineHeight: 1.2,
                        }}
                      >
                        <img
                          src='/images/icon_speak.png'
                          style={{
                            paddingRight: '5px',
                            width: '25px',
                          }}
                          alt='미리듣기'
                        />
                        미리듣기
                      </button>
                    </td>
                    <td className='left'>{row.text}</td>
                    <td>
                      <img
                        src='/images/icon_onair.png'
                        alt='방송듣기'
                        onClick={() => handleRowToggle(row.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                  </tr>
                  {expandedRow === row.id && (
                    <tr className='datetable-view' key={`${row.id}-expanded`}>
                      <td colSpan={3} className='nobor tb-body'>
                        <div className='tb-inner'>
                          <audio controls ref={audioRef}>
                            <source
                              src={currentAudio || row.audio}
                              type='audio/wav'
                            />
                            이 문장은 여러분의 브라우저가 audio 태그를 지원하지
                            않을 때 표시됩니다!
                          </audio>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VoiceModal;

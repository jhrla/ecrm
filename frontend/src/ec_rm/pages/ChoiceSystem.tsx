import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ChoiceSystem = () => {
  const navigate = useNavigate();

  return (
    <div id='wrap' className='main_bg'>
      <div id='container' className='intro_wrap'>
        <div className='inner pd00'>
          <div className='logo'> KTSS</div>
          <div className='row mg00' style={{ width: '100%' }}>
            <div className='col-xl-5 col-lg-12 col-md-12 company'>
              <div className='inner_box'>
                <div className='txt'>
                  언제 어디서든
                  <br />
                  스마트한 건물 안전관리
                </div>
                <div className='eng'>
                  Korea Total
                  <br />
                  Safety Solutions
                </div>
                <div className='footer'>
                  copyright @ 2024 KTSS Corporation. All Rights reserved.
                </div>
              </div>
            </div>
            <div className='col-xl-7 col-lg-12 col-md-12 pd00'>
              <div className='main_box'>
                <h1>
                  <img
                    src={`${process.env.PUBLIC_URL}/images/logo_2.png`}
                    alt='KTSS 로고'
                  />
                </h1>
                <ul>
                  {[
                    {
                      img: 'service_04.png',
                      title: 'CRM',
                      url: '/',
                      subtitle: '고객관계관리',
                    },
                    {
                      img: 'service_02.png',
                      title: 'RM',
                      url: '/ecrm/rm',
                      subtitle: '원격관리',
                    },
                    {
                      img: 'service_03.png',
                      title: 'EC',
                      url: '/ecrm/ec',
                      subtitle: '상황제어',
                    },
                    {
                      img: 'service_01.png',
                      title: 'CIM',
                      url: '/',
                      subtitle: '카드발급관리',
                    },
                    {
                      img: 'service_06.png',
                      title: 'VM',
                      url: '/',
                      subtitle: '방문자관리',
                    },
                  ].map((service, index) => (
                    <li key={index}>
                      {/* a 태그를 div로 변경 */}
                      <div
                        onClick={() => navigate(service.url)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className='img_box'>
                          <img
                            src={`${process.env.PUBLIC_URL}/images/${service.img}`}
                            alt={`${service.title} 이미지`}
                          />
                        </div>
                        <div className='txt_box'>
                          <h2>
                            <strong>{service.title}</strong> {service.subtitle}
                          </h2>
                          <button className='btn btn-sm btn-info'>
                            바로가기 <i className='ti-angle-right'></i>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoiceSystem;

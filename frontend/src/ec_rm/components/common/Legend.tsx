import React, { memo } from 'react';

export const Legend = (): JSX.Element => {
  const equipmentIcons = [
    {
      src: `${process.env.PUBLIC_URL || ''}/images/icon_product_01.png`,
      alt: 'CCTV',
    },
    {
      src: `${process.env.PUBLIC_URL || ''}/images/icon_product_05.png`,
      alt: '발신기',
    },
    {
      src: `${process.env.PUBLIC_URL || ''}/images/icon_product_06.png`,
      alt: '수신기',
    },
    {
      src: `${process.env.PUBLIC_URL || ''}/images/icon_product_08.png`,
      alt: '중계기',
    },
    {
      src: `${process.env.PUBLIC_URL || ''}/images/icon_product_10.png`,
      alt: '화재감지기',
    },
    // 필요한 다른 아이콘들도 여기에 추가 가능
  ];

  return (
    <div className='legend'>
      <ul>
        {equipmentIcons.map((icon, index) => (
          <li key={index}>
            <img src={icon.src} alt={icon.alt} />
            {icon.alt}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default memo(Legend);

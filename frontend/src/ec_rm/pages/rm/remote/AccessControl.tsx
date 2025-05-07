import React, { useState, useEffect } from 'react';
import {
  FireSafetySearchArea,
  FireSafetySearchParams,
} from './searchbar/FireSafetySearchArea';
import Pagination from '../../../components/Pagination';
import FireSafetyTable from './table/FireSafetyTable';

interface AccessControlInfo {
  number: number;
  contractNumber: string;
  region: string;
  subRegion: string;
  customer: string;
  representative: string;
  buildingType: string;
  equipmentName: string;
  modelCode: string;
  equipmentId: string;
  collectionTime: string;
  installationLocation: string;
  fwVersion: string;
  status: string;
}

// 테스트 데이터
const fireSafetyTestData: AccessControlInfo[] = [
  {
    number: 10,
    contractNumber: '240001',
    region: '서울시',
    subRegion: '강남구',
    customer: '(주)강남테크놀러지',
    representative: '홍이동',
    buildingType: 'B2',
    equipmentName: '무선화재감지기',
    modelCode: 'KRC-00',
    equipmentId: '870001E',
    collectionTime: '2024-06-10 11:55:55',
    installationLocation: '9층',
    fwVersion: '2.0',
    status: '동기',
  },
  {
    number: 9,
    contractNumber: '240001',
    region: '서울시',
    subRegion: '강남구',
    customer: '(주)강남테크놀러지',
    representative: '홍이동',
    buildingType: 'B2',
    equipmentName: '무선화재감지기',
    modelCode: 'KRC-00',
    equipmentId: '870001E',
    collectionTime: '2024-06-10 11:55:55',
    installationLocation: '9층',
    fwVersion: '2.0',
    status: '장애',
  },
  {
    number: 8,
    contractNumber: '240001',
    region: '서울시',
    subRegion: '강남구',
    customer: '(주)강남테크놀러지',
    representative: '홍이동',
    buildingType: 'B2',
    equipmentName: '무선화재감지기',
    modelCode: 'KRC-00',
    equipmentId: '870001E',
    collectionTime: '2024-06-10 11:55:55',
    installationLocation: '9층',
    fwVersion: '2.0',
    status: '동기',
  },
  {
    number: 7,
    contractNumber: '240001',
    region: '서울시',
    subRegion: '강남구',
    customer: '(주)강남테크놀러지',
    representative: '홍이동',
    buildingType: 'B2',
    equipmentName: '무선화재감지기',
    modelCode: 'KRC-00',
    equipmentId: '870001E',
    collectionTime: '2024-06-10 11:55:55',
    installationLocation: '9층',
    fwVersion: '2.0',
    status: '장애',
  },
  {
    number: 6,
    contractNumber: '240001',
    region: '서울시',
    subRegion: '강남구',
    customer: '(주)강남테크놀러지',
    representative: '홍이동',
    buildingType: 'B2',
    equipmentName: '무선화재감지기',
    modelCode: 'KRC-00',
    equipmentId: '870001E',
    collectionTime: '2024-06-10 11:55:55',
    installationLocation: '9층',
    fwVersion: '2.0',
    status: '동기',
  },
];

export const AccessControl = (): JSX.Element => {
  const [fireSafetyInfos, setFireSafetyInfos] =
    useState<AccessControlInfo[]>(fireSafetyTestData);
  const [selectedFireSafety, setSelectedFireSafety] =
    useState<AccessControlInfo>();
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useState<FireSafetySearchParams>({
    contract_code: '',
    region: '',
    subRegion: '',
    customer: '',
    contractFromDate: '',
    contractToDate: '',
    service_type: '',
  });

  useEffect(() => {}, []);

  const fetchFireSafety = async (
    searchParams?: any,
    page: number = currentPage
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/FireSafety?page=${page}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });
      if (!response.ok) {
        throw new Error('서버 응답이 올바르지 않습니다.');
      }
      const data = await response.json();
      setFireSafetyInfos(data.Devices || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching Devices:', error);
      setError('장비 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (newSearchParams: FireSafetySearchParams) => {
    setSearchParams(newSearchParams);
    setCurrentPage(1); // 검색 시 첫 페이지로 리셋
  };

  // const handleRowClick = (fireSafetyInfo: FireSafetyInfo) => {
  //   setSelectedFireSafety(fireSafetyInfo);
  // };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // if (isLoading) {
  //   return <div>데이터를 불러오는 중...</div>;
  // }

  if (error) {
    return <div>오류: {error}</div>;
  }

  return (
    <div className='inner'>
      <FireSafetySearchArea onSearch={handleSearch} />
      <div className='white_box'>
        <div className='form_option'>
          <div className='form_option_left form_option_total'>
            총 {totalCount}건
          </div>
          <div className='form_option_right btn_area'>
            <button className='btn btn_excel btn-sm'>엑셀저장</button>
          </div>
        </div>
        {fireSafetyInfos.length > 0 ? (
          <FireSafetyTable fireSafetyInfos={fireSafetyInfos} />
        ) : (
          <div>데이터가 없습니다.</div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AccessControl;

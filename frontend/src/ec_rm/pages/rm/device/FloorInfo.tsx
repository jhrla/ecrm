// src/pages/DeviceSetting.tsx
import React, { useState, useEffect, useRef } from 'react';
import FloorInfoSearchArea, {
  SearchParams,
} from './searchbar/FloorInfoSearchArea';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../components/Pagination';
import FloorInfoTable from './table/FloorInfoTable';
import ApiClient from 'ec_rm/utils/ApiClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { downloadExcel } from 'ec_rm/utils/ExcelDown';
import { useSearchInitialize } from 'ec_rm/hooks/useSearchInitialize';

interface FloorInfoData {
  contract_code: string;
  client_code: string;
  customer_name: string;
  city_code: string;
  city_name: string;
  district_code: string;
  district_name: string;
  building_type: string;
  address: string;
  service_type: string;
  contract_date: string;
  contract_qty: string;
}

export const FloorInfo = (): JSX.Element => {
  const [floorInfo, setFloorInfo] = useState<FloorInfoData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10); // 페이지당 데이터
  const { startDate } = useSelector((state: RootState) => state.search);
  const { endDate } = useSelector((state: RootState) => state.search);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    contract_code: '',
    region: '',
    region_nm: '',
    sub_region: '',
    sub_region_nm: '',
    customer_name: '',
    contract_from_date: startDate || '',
    contract_to_date: endDate || '',
    service_type: '',
  });

  const navigate = useNavigate(); // navigate 함수 사용 준비
  const initialized = useRef(false);

  // 페이지 변경 시에만 데이터 조회
  useEffect(() => {
    fetchFloorInfo(searchParams, currentPage, pageSize);
  }, [currentPage, pageSize]);

  const createInitialParams = (): SearchParams => ({
    contract_code: '',
    customer_name: '',
    region: '',
    region_nm: '',
    sub_region: '',
    sub_region_nm: '',
    contract_from_date: '',
    contract_to_date: '',
    service_type: '',
  });

  const fetchFloorInfo = async (
    params: SearchParams,
    page: number,
    pageSize: number
  ) => {
    try {
      console.log('Fetching floor info with params:', params);
      const response = await ApiClient.post('/api/floorInfoList', {
        ...params,
        page,
        pageSize,
      });
      console.log('API Response:', response.data);
      setFloorInfo(response.data.floorInfoList || []);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching FloorInfo:', error);
    }
  };

  useSearchInitialize(setSearchParams, fetchFloorInfo, createInitialParams, {
    fromDateField: 'contract_from_date',
    toDateField: 'contract_to_date',
  });

  const handleSearch = (newSearchParams: SearchParams) => {
    initialized.current = true;
    setCurrentPage(1);
    setSearchParams(newSearchParams);
    fetchFloorInfo(newSearchParams, 1, pageSize);
  };

  const handleRowClick = (floorInfo: FloorInfoData) => {
    navigate(`/ecrm/rm/device-info/floor-plan?leftMenu=floor-device`, {
      state: floorInfo,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // const handleExcelDownload = () => {
  //   downloadExcel('/api/downloadFloorInfoExcel', searchParams, '층별장비등록');
  // };

  return (
    <div className='inner'>
      <FloorInfoSearchArea onSearch={handleSearch} />
      {/* 검색 결과 테이블 영역 */}
      <div className='white_box'>
        <div className='form_option'>
          <div className='form_option_left form_option_total'>
            총 {totalCount}건
          </div>
          {/* <div className='form_option_right btn_area'>
            <a
              href='#엑셀다운'
              className='btn btn_excel btn-sm'
              onClick={handleExcelDownload}
            >
              엑셀저장
            </a>
          </div> */}
        </div>
        <FloorInfoTable floorInfo={floorInfo} onRowClick={handleRowClick} />

        {/* 페이징 영역 */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default FloorInfo;

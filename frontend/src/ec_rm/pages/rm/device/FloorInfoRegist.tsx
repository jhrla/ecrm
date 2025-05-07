// src/pages/DeviceSetting.tsx
import { useState, useEffect, useRef } from 'react';
import FloorInfoSearchArea, {
  SearchParams,
} from './searchbar/FloorInfoSearchArea';
import FloorInfoRegistTable from './table/FloorInfoRegistTable';

import Pagination from '../../../components/Pagination';
import FloorFileModal from './modal/FloorFileModal';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'store/store';
import { FloorDeviceModal } from './modal/FloorDeviceModal';

import { useLocation } from 'react-router-dom';
import { useSearchInitialize } from 'ec_rm/hooks/useSearchInitialize';
import ApiClient from 'ec_rm/utils/ApiClient';

interface FloorInfo {
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

interface DeviceInfo {
  contract_code: string | null;
  client_code: string;
  device_cnt: string;
  com_id: string;
  parent_id: string;
  terminal_cnt: string;
  device_id: string;
  device_type: string;
  device_name: string;
  install_date: string;
  install_address: string;
  floor_no: string;
}

interface FileItem {
  contract_code: string;
  client_code: string;
  floor_no: string | null;
  floor_name: string;
  file: File | null;
  file_path: string | null;
  fromDB: boolean;
}

export const FloorInfoRegist = (): JSX.Element => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [floorInfo, setFloorInfo] = useState<FloorInfo[]>([]);
  const [viewDeviceInfo, setViewDeviceInfo] = useState(false);
  const [deviceList, setDeviceList] = useState<DeviceInfo[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10); // 페이지당 데이터
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가
  const [selectedFloorInfo, setSelectedFloorInfo] = useState<FloorInfo | null>(
    null
  ); // 선택된 장비 상태 추가
  const [fileList, setFileList] = useState<FileItem[]>([]); // 선택된 장비 상태 추가
  const { startDate } = useSelector((state: RootState) => state.search);
  const { endDate } = useSelector((state: RootState) => state.search);
  const initialized = useRef(false);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    contract_code: '',
    customer_name: '',
    region: '',
    region_nm: '',
    sub_region: '',
    sub_region_nm: '',
    service_type: '',
    contract_from_date: startDate || '',
    contract_to_date: endDate || '',
  });

  const createInitialParams = (): SearchParams => ({
    contract_code: '',
    customer_name: '',
    region: '',
    region_nm: '',
    sub_region: '',
    sub_region_nm: '',
    service_type: '',
    contract_from_date: '',
    contract_to_date: '',
  });

  const fetchFloorInfo = async (
    params: SearchParams,
    page: number,
    pageSize: number
  ) => {
    try {
      const response = await ApiClient.post('/api/floorInfoList', {
        ...params,
        page,
        pageSize,
      });
      if (response.data) {
        setFloorInfo(response.data.floorInfoList || []);
        setTotalCount(response.data.totalCount || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching floor info:', error);
    }
  };

  useSearchInitialize(setSearchParams, fetchFloorInfo, createInitialParams, {
    fromDateField: 'contract_from_date',
    toDateField: 'contract_to_date',
  });

  useEffect(() => {
    fetchFloorInfo(searchParams, currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchFiles = async (params: FloorInfo) => {
    try {
      // 페이지 번호를 params에 포함하여 서버로 전달
      const response = await ApiClient.post(
        '/api/floorFileList',
        { ...params } // 기존 검색 파라미터에 페이지 번호 추가
      );
      setFileList(response.data || []);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching FloorInfo:', error);
    }
  };

  const fetchDeviceInfo = async (
    floorInfo: FloorInfo,
    page: number,
    pageSize: number
  ) => {
    try {
      setDeviceList([]);
      // 페이지 번호를 params에 포함하여 서버로 전달
      const response = await ApiClient.post('/api/fromDevcieList', floorInfo, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data);
      setDeviceList(response.data || []);
    } catch (error) {
      console.error('Error fetching Devices:', error);
    }
  };

  const handleSearch = (newSearchParams: SearchParams) => {
    console.log('Search triggered with:', newSearchParams);
    initialized.current = true; // 추가
    setCurrentPage(1); // 페이지 초기화
    setSearchParams((prevParams) => {
      return { ...newSearchParams };
    });
    fetchFloorInfo(newSearchParams, 1, pageSize);
  };

  const handleFloorInfo = async (floorInfo: FloorInfo) => {
    await fetchFiles(floorInfo);
    setSelectedFloorInfo(floorInfo);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeviceInfo = async (floorInfo: FloorInfo) => {
    await fetchDeviceInfo(floorInfo, currentPage, pageSize);
    setViewDeviceInfo(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setViewDeviceInfo(false);
    setSelectedFloorInfo(null);
    fetchFloorInfo(searchParams, currentPage, pageSize);
  };

  // const handleExcelDownload = () => {
  //   downloadExcel(
  //     '/api/downloadFloorInfoExcel',
  //     searchParams,
  //     '층별장비등록'
  //   );
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
              href='#등록'
              className='btn btn_excel btn-sm'
              onClick={handleExcelDownload}
            >
              엑셀저장
            </a>
          </div> */}
        </div>
        <FloorInfoRegistTable
          floorInfo={floorInfo}
          onFloorClick={handleFloorInfo}
          onDeviceClick={handleDeviceInfo}
        />

        {/* 페이징 영역 */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* 모달 렌더링 */}
      {isModalOpen && selectedFloorInfo && (
        <FloorFileModal
          floorInfo={selectedFloorInfo}
          existingFiles={fileList}
          onClose={closeModal}
        />
      )}

      {/* 모달 렌더링 */}
      {viewDeviceInfo && (
        <FloorDeviceModal deviceList={deviceList} onClose={closeModal} />
      )}
    </div>
  );
};

export default FloorInfoRegist;

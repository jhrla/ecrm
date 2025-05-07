// src/pages/DeviceSetting.tsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store/store';
import Pagination from '../../../components/Pagination';
import FaultListTable from './table/FaultListTable';
import FaultListSearchArea, {
  SearchParams,
} from './searchbar/FaultListSearchArea';
import ApiClient from 'ec_rm/utils/ApiClient';
import FaultActionModal from './modal/FaultActionModal';
import { downloadExcel } from 'ec_rm/utils/ExcelDown';

interface FaultInfo {
  service_type: string;
  event_kind: number;
  contract_code: string;
  customer_name: string;
  address: string;
  event_msg: string;
  device_name: string;
  device_id: string;
  event_time: string;
  event_id: number;
  device_type: string;
  event_name: string;
  sms_send_time: string;
  recover_action_time: string;
  recover_time: string;
}

interface FaultData {
  event_id: number;
  recover_person: string;
  recover_date: string;
  fault_reason: string;
  fault_result: string;
  fault_recover_yn: string;
  non_recover_reason: string;
}

export const FaultList: React.FC = () => {
  const [faultDataList, setFaultDataList] = useState<FaultInfo[]>([]);
  const [faultData, setFaultData] = useState<FaultData | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10); // 페이지당 데이터
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가

  const [searchParams, setSearchParams] = useState<SearchParams>({
    service_type: '',
    event_kind: '',
    contract_code: '',
    customer_name: '',
    region: '',
    region_nm: '',
    sub_region: '',
    sub_region_nm: '',
    device_type: '',
    fault_from_date: '',
    fault_to_date: '',
  });

  useEffect(() => {
    fetchDevices(searchParams, currentPage, pageSize);
  }, [currentPage, searchParams, pageSize]);

  const fetchDevices = async (
    params: SearchParams,
    page: number,
    pageSize: number
  ) => {
    try {
      // 페이지 번호를 params에 포함하여 서버로 전달
      const response = await ApiClient.post(
        '/api/getFaultList',
        { ...params, page, pageSize }, // 기존 검색 파라미터에 페이지 번호 추가
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setFaultDataList(response.data.faultList || []);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching Devices:', error);
    }
  };

  const fetchFaultActionInfo = async (event_id: number) => {
    try {
      const response = await ApiClient.post(
        '/api/getFaultRecoveryInfo',
        {
          event_id: event_id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.data) {
        setFaultData({ event_id: event_id } as FaultData);
      } else {
        setFaultData(response.data);
      }
    } catch (error) {
      console.error('Error fetching Devices:', error);
    }
  };

  const handleSearch = (newSearchParams: SearchParams) => {
    setSearchParams(newSearchParams);
    setCurrentPage(1); // 검색 시 첫 페이지로 리셋
  };

  const handleExcelDownload = () => {
    downloadExcel(
      '/api/downloadFaultList',
      searchParams,
      '장애 이력_' + new Date().toISOString().split('T')[0]
    );
  };

  const handleFaultInfo = async (event_id: number) => {
    await fetchFaultActionInfo(event_id);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    console.log('handlePageChange', page);
    setCurrentPage(page);
  };
  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setFaultData(null);
    fetchDevices(searchParams, currentPage, pageSize);
  };

  return (
    <div className='inner'>
      <FaultListSearchArea onSearch={handleSearch} />
      {/* 검색 결과 테이블 영역 */}
      <div className='white_box'>
        <div className='form_option'>
          <div className='form_option_left form_option_total'>
            총 {totalCount}건
          </div>
          <div className='form_option_right btn_area'>
            <a
              href='#등록'
              className='btn btn_excel btn-sm'
              onClick={handleExcelDownload}
            >
              엑셀저장
            </a>
          </div>
        </div>
        <FaultListTable
          faultInfo={faultDataList}
          onFaultClick={handleFaultInfo}
        />

        {/* 페이징 영역 */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* 모달 렌더링 */}
      {isModalOpen && (
        <FaultActionModal
          show={isModalOpen}
          faultData={faultData}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default FaultList;

// src/pages/DeviceSetting.tsx
import ApiClient from 'ec_rm/utils/ApiClient';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store/store';
import Pagination from '../../../components/Pagination';
import EventEtcListSearchArea from './searchbar/EventEtcListSearchArea';
import { SearchParams } from './searchbar/EventEtcListSearchArea';
import EventEtcListTable from './table/EventEtcListTable';
import { downloadExcel } from 'ec_rm/utils/ExcelDown';

interface EventInfo {
  service_type: string;
  event_kind: string;
  contract_code: string;
  customer_name: string;
  event_msg: string;
  address: string;
  device_name: string;
  device_id: string;
  event_id: string;
  event_time: string;
  device_type: string;
  event_name: string;
  sms_time: string;
  recover_action_time: string;
  recovery_time: string;
}

export const EventEtcList = (): JSX.Element => {
  const [viewDeviceInfo, setViewDeviceInfo] = useState(false);
  const [eventEtcList, setEventEtcList] = useState<EventInfo[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10); // 페이지당 데이터
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가

  const { startDate } = useSelector((state: RootState) => state.search);
  const { endDate } = useSelector((state: RootState) => state.search);

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
    event_from_date: '',
    event_to_date: '',
  });

  useEffect(() => {
    fetchEventEtcList(searchParams, currentPage, pageSize);
  }, [currentPage, searchParams, pageSize]);

  const fetchEventEtcList = async (
    params: SearchParams,
    page: number,
    pageSize: number
  ) => {
    try {
      // 페이지 번호를 params에 포함하여 서버로 전달
      const response = await ApiClient.post(
        '/api/getEventEtcList',
        { ...params, page, pageSize }, // 기존 검색 파라미터에 페이지 번호 추가
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setEventEtcList(response.data.eventEtcList || []);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching Devices:', error);
    }
  };

  const handleSearch = (newSearchParams: SearchParams) => {
    setSearchParams(newSearchParams);
    setCurrentPage(1); // 검색 시 첫 페이지로 리셋
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExcelDownload = () => {
    try {
      downloadExcel(
        '/api/downloadEventEtcList',
        searchParams,
        '기타 이벤트 이력_' + new Date().toISOString().split('T')[0]
      ).catch((error) => {
        console.error('Excel download failed:', error);
        alert('엑셀 다운로드에 실패했습니다.');
      });
    } catch (error) {
      console.error('Excel download error:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className='inner'>
      <EventEtcListSearchArea onSearch={handleSearch} />
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
        <EventEtcListTable eventEtcList={eventEtcList} />

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

export default EventEtcList;

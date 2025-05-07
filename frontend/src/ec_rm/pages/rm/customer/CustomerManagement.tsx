import React, { useState, useEffect, useRef } from 'react';
import CustomerTable from './table/CustomerTable';
import { SearchArea, SearchParams } from './searchbar/SearchArea';
import Pagination from '../../../components/Pagination';
import { RootState } from '../../../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import ApiClient from 'ec_rm/utils/ApiClient';
import { useLocation } from 'react-router-dom';
import { downloadExcel } from 'ec_rm/utils/ExcelDown';
import { setStartDate, setEndDate } from '../../../../store/state/searchSlice';
import { setRegion, setSubRegion } from '../../../../store/state/regionSlice';

interface Customer {
  contract_code: string;
  client_code: string;
  client_name: string;
  ceo_name: string;
  region_code: string;
  region: string;
  sub_region_code: string;
  sub_region: string;
  contract_date: string;
  service_address: string;
  manager_name: string;
  manager_tel: string;
  fire_tel: string;
  police_tel: string;
  building_type_nm: string;
  remark: string;
  gps_position: string;
}

export const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const reSearch = useRef(false);
  const [pageSize, setPageSize] = useState<number>(10); // 페이지당 데이터 수 설정
  const [shouldReset, setShouldReset] = useState(false);
  const { startDate } = useSelector((state: RootState) => state.search);
  const { endDate } = useSelector((state: RootState) => state.search);
  const { region, region_nm, sub_region, sub_region_nm } = useSelector(
    (state: RootState) => state.regions
  );

  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useState<SearchParams>({
    contract_code: '',
    region: region || '',
    region_nm: region_nm || '',
    sub_region: sub_region || '',
    sub_region_nm: sub_region_nm || '',
    customer_name: '',
    contract_from_date: startDate || '',
    contract_to_date: endDate || '',
  });

  const location = useLocation();

  useEffect(() => {
    if (location.state?.refresh) {
      // 날짜 초기화
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const formattedToday = formatDateWithSlash(today);
      const formattedOneMonthAgo = formatDateWithSlash(oneMonthAgo);

      dispatch(setStartDate(formattedOneMonthAgo));
      dispatch(setEndDate(formattedToday));

      // 지역 초기화
      dispatch(setRegion({ region: '', region_nm: '' }));
      dispatch(setSubRegion({ sub_region: '', sub_region_nm: '' }));

      // 검색 파라미터 초기화
      setSearchParams({
        contract_code: '',
        region: '',
        region_nm: '',
        sub_region: '',
        sub_region_nm: '',
        customer_name: '',
        contract_from_date: formattedOneMonthAgo,
        contract_to_date: formattedToday,
      });
      // 페이지 초기화
      setCurrentPage(1);
    }
  }, [location.state, dispatch]);

  // 상태 변화가 완료된 후 fetchCustomers 호출
  useEffect(() => {
    fetchCustomers(searchParams, currentPage, pageSize);
  }, [currentPage, searchParams, pageSize]);

  const fetchCustomers = async (
    params: SearchParams,
    page: number,
    pageSize: number
  ) => {
    console.log('fetchCustomers', params, page, pageSize);
    try {
      const response = await ApiClient.post('/api/customerList', {
        ...params,
        page,
        pageSize,
      });
      setCustomers(response.data.customerList || []);
      setTotalCount(response.data.totalCount || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSearch = (newSearchParams: SearchParams) => {
    setSearchParams(newSearchParams);
    setCurrentPage(1); // 검색 시 첫 페이지로 리셋
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCustomer = async (customer: Customer) => {
    try {
      const response = await ApiClient.post(
        '/api/setTransferCustomer',
        customer
      );

      alert(response.data);

      fetchCustomers(searchParams, currentPage, pageSize);
      //onClose();
    } catch (error) {
      console.error('요청 처리 중 오류 발생:', error);
      alert('네트워크 오류가 발생하였습니다.');
    }
  };

  const handleExcelDownload = () => {
    downloadExcel(
      '/api/downloadCustomerExcel',
      searchParams,
      '고객목록_' + new Date().toISOString().split('T')[0]
    );
  };

  const handleDeleteTransferCustomer = async (customer: Customer) => {
    if (
      window.confirm(
        '정말로 이 고객을 삭제하시겠습니까? 삭제 후 복구 불가합니다.'
      )
    ) {
      try {
        const response = await ApiClient.post(
          '/api/deleteTransferCustomer',
          customer
        );
        alert(response.data);
        fetchCustomers(searchParams, currentPage, pageSize);
      } catch (error) {
        console.error('Error deleting transfer customer:', error);
        alert('네트워크 오류가 발생하였습니다.');
      }
    }
  };

  const formatDateWithSlash = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className='inner'>
      <SearchArea onSearch={handleSearch} reset={shouldReset} />
      <div className='white_box'>
        <div className='form_option'>
          <div className='form_option_left form_option_total'>
            총 {totalCount}건
          </div>
          <div className='form_option_right btn_area'>
            <button
              className='btn btn_excel btn-sm'
              onClick={handleExcelDownload}
            >
              엑셀저장
            </button>
          </div>
        </div>
        <CustomerTable
          customer={customers}
          transferCustomer={handleCustomer}
          deleteTransferCustomer={handleDeleteTransferCustomer}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default CustomerManagement;
function dispatch(arg0: { type: string }) {
  throw new Error('Function not implemented.');
}

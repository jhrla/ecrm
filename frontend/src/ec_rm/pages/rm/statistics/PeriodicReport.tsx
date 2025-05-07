import React, { useState, useEffect, useRef } from 'react';
import PeriodicReportSearchArea from './searchbar/PeriodicReportSearchArea';
import Pagination from '../../../components/Pagination';
import PeriodicReportTable from './table/PeriodicReportTable';
import ApiClient from 'ec_rm/utils/ApiClient';
import { downloadExcel } from 'ec_rm/utils/ExcelDown';
import { useSearchInitialize } from 'ec_rm/hooks/useSearchInitialize';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';

export interface SearchParams {
  contract_code: string;
  customer_name: string;
  region: string;
  region_nm: string;
  sub_region: string;
  sub_region_nm: string;
  device_type: string;
  statistics_from_date: string;
  statistics_to_date: string;
}

// 주기보고 데이터 행 인터페이스
interface PeriodicReportData {
  building_type: string;
  city_name: string;
  co: string;
  contract_code: string;
  customer_name: string;
  device_id: string;
  device_name: string;
  event_time: string;
  fire_event: string;
  humidity: string;
  install_address: string;
  log_seq: number;
  smoke_density: string;
  temp: string;
}

export const PeriodicReport: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const initialized = useRef(false);

  const [periodicReportInfos, setPeriodicReportInfos] = useState<
    PeriodicReportData[]
  >([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    contract_code: '',
    customer_name: '',
    region: '',
    region_nm: '',
    sub_region: '',
    sub_region_nm: '',
    device_type: '',
    statistics_from_date: '',
    statistics_to_date: '',
  });

  const fetchPeriodicReport = async (
    params: SearchParams,
    page: number = 1,
    size: number = 10
  ) => {
    try {
      console.log('params', params);
      const response = await ApiClient.post('/api/getPeriodicReport', {
        ...params,
        page,
        pageSize: size,
      });
      setPeriodicReportInfos(response.data.periodicReportList || []);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching Periodic Report:', error);
    }
  };

  useEffect(() => {
    fetchPeriodicReport(searchParams, currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleSearch = (newSearchParams: SearchParams) => {
    initialized.current = true;
    setCurrentPage(1);
    setSearchParams(newSearchParams);
    fetchPeriodicReport(newSearchParams, 1, pageSize);
  };

  const createInitialParams = (): SearchParams => ({
    contract_code: '',
    customer_name: '',
    region: '',
    region_nm: '',
    sub_region: '',
    sub_region_nm: '',
    device_type: '',
    statistics_from_date: '',
    statistics_to_date: '',
  });

  useSearchInitialize(
    setSearchParams,
    fetchPeriodicReport,
    createInitialParams,
    {
      fromDateField: 'statistics_from_date',
      toDateField: 'statistics_to_date',
    }
  );

  const handleExcelDownload = () => {
    downloadExcel(
      '/api/downloadPeriodicReportExcel',
      searchParams,
      '주기보고_' + new Date().toISOString().split('T')[0]
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className='inner'>
      <PeriodicReportSearchArea onSearch={handleSearch} />
      <div className='white_box'>
        <div className='form_option'>
          <div className='form_option_left form_option_total'>
            총 {totalCount}건
          </div>
          <div className='form_option_right btn_area'>
            <a
              href='#엑셀저장'
              className='btn btn_excel btn-sm'
              onClick={handleExcelDownload}
            >
              엑셀저장
            </a>
          </div>
        </div>

        <PeriodicReportTable periodicReportInfos={periodicReportInfos} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default PeriodicReport;

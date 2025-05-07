import React, { useState, useEffect, useRef } from 'react';
import SetupSearchArea from './searchbar/SetupSearchArea';
import DeviceSetupTable from './table/DeviceSetupTable';
import Pagination from '../../../components/Pagination';
import ApiClient from 'ec_rm/utils/ApiClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { useSearchInitialize } from 'ec_rm/hooks/useSearchInitialize';

export interface SearchParams {
  contract_code: string;
  region: string;
  region_nm: string;
  sub_region: string;
  sub_region_nm: string;
  customer_name: string;
  installation_from_date: string;
  installation_to_date: string;
}

interface DeviceSetupInfo {
  com_id: string;
  contract_code: string;
  customer_name: string;
  ceo_name: string;
  building_type: string;
  device_name: string;
  device_id: string;
  device_type: string;
  install_date: string;
  install_address: string;
  use_status: string;
}

export const DeviceSetup = (): JSX.Element => {
  const [deviceSetup, setDeviceSetup] = useState<DeviceSetupInfo[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const initialized = useRef(false);

  const { startDate } = useSelector((state: RootState) => state.search);
  const { endDate } = useSelector((state: RootState) => state.search);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    contract_code: '',
    customer_name: '',
    region: '',
    region_nm: '',
    sub_region: '',
    sub_region_nm: '',
    installation_from_date: startDate || '',
    installation_to_date: endDate || '',
  });

  const createInitialParams = (): SearchParams => ({
    contract_code: '',
    customer_name: '',
    region: '',
    region_nm: '',
    sub_region: '',
    sub_region_nm: '',
    installation_from_date: '',
    installation_to_date: '',
  });

  const fetchDevices = async (
    params: SearchParams,
    page: number,
    pageSize: number
  ) => {
    try {
      const response = await ApiClient.post('/api/getDevicesList', {
        ...params,
        page,
        pageSize,
      });

      if (response.data) {
        setDeviceSetup(response.data.devicesList || []);
        setTotalCount(response.data.totalCount || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  useSearchInitialize(setSearchParams, fetchDevices, createInitialParams, {
    fromDateField: 'installation_from_date',
    toDateField: 'installation_to_date',
  });

  useEffect(() => {
    fetchDevices(searchParams, currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleSearch = (newSearchParams: SearchParams) => {
    initialized.current = true;
    setCurrentPage(1);
    setSearchParams((prevParams) => {
      return { ...newSearchParams };
    });
    fetchDevices(newSearchParams, 1, pageSize);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className='inner'>
      <SetupSearchArea onSearch={handleSearch} />
      <div className='white_box'>
        <div className='form_option'>
          <div className='form_option_left form_option_total'>
            총 {totalCount}건
          </div>
        </div>
        <DeviceSetupTable devicesSetup={deviceSetup} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default DeviceSetup;

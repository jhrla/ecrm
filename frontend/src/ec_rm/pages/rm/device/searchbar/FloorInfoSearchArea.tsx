import React, { useEffect, useState, useRef } from 'react';
import FromToDatePicker from '../../../../components/searchutil/FromToDatePicker';
import { useSearchBar } from '../../../../contexts/SearchProvider';
import Region from '../../../../components/searchutil/Region';
import { RootState } from '../../../../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  setServiceType,
  resetDates,
  setStartDate,
  setEndDate,
  setRegion,
  setSubRegion,
} from '../../../../../store/state/searchSlice';

import SelectBox from 'ec_rm/components/searchutil/SelectBox';
import ApiClient from 'ec_rm/utils/ApiClient';
import { useLocation } from 'react-router-dom';

interface SearchAreaProps {
  onSearch: (searchParams: SearchParams) => void;
}

interface SselectBoxOptions {
  code: string;
  name: string;
}

export interface SearchParams {
  contract_code: string;
  region: string;
  region_nm: string;
  sub_region: string;
  sub_region_nm: string;
  customer_name: string;
  contract_from_date: string;
  contract_to_date: string;
  service_type: string;
}

export const FloorInfoSearchArea = ({
  onSearch,
}: SearchAreaProps): JSX.Element => {
  const dispatch = useDispatch();
  const location = useLocation();
  const datePickerRef = useRef<any>(null);
  const regionRef = useRef<any>(null);

  const {
    contract_code,
    startDate,
    endDate,
    region,
    region_nm,
    sub_region,
    sub_region_nm,
    service_type,
  } = useSelector((state: RootState) => state.search);

  const [serviceTypeList, setServiceTypeList] = useState<SselectBoxOptions[]>(
    []
  );

  const [searchParams, setSearchParams] = useState<SearchParams>({
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

  const fetchServiceType = async () => {
    try {
      const response = await ApiClient.post('/api/serviceType', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setServiceTypeList(response.data || []);
    } catch (error) {
      console.error('Error fetching Devices:', error);
    }
  };

  useEffect(() => {
    fetchServiceType();
  }, []);

  // 값이 변경될 때마다 searchParams 업데이트
  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      contract_code: contract_code || '',
      region: region || '',
      region_nm: region_nm || '',
      sub_region: sub_region || '',
      sub_region_nm: sub_region_nm || '',
      customer_name: '',
      contract_from_date: startDate || '',
      contract_to_date: endDate || '',
      service_type: service_type || '',
    }));
  }, [
    contract_code,
    startDate,
    endDate,
    region,
    region_nm,
    sub_region,
    sub_region_nm,
    service_type,
  ]);

  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setServiceType(e.target.value));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => {
      // 값이 변경되었을 때만 상태 업데이트
      if (prev[name as keyof SearchParams] !== value) {
        return { ...prev, [name]: value };
      }
      return prev;
    });
  };

  const handleSearch = () => {
    // 현재 Redux store의 값을 직접 사용
    onSearch({
      contract_code: searchParams.contract_code,
      region: region || '',
      region_nm: region_nm || '',
      sub_region: sub_region || '',
      sub_region_nm: sub_region_nm || '',
      customer_name: searchParams.customer_name,
      contract_from_date: startDate || '',
      contract_to_date: endDate || '',
      service_type: service_type || '',
    });
  };

  const { isSearchVisible } = useSearchBar();

  return (
    <>
      {isSearchVisible && (
        <div className='search_area white_box pl15'>
          <form className='search_form'>
            <div className='form_input'>
              <div className='row'>
                <div className='col-12 pr-0'>
                  <div className='row'>
                    <div className='form-group col-lg-4 col-sm-12'>
                      <label className='col-form-label'>계약번호</label>
                      <div>
                        <input
                          type='text'
                          className='form-control'
                          id='contract_code'
                          name='contract_code'
                          value={searchParams.contract_code}
                          placeholder='계약번호를 입력하세요'
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <Region ref={regionRef} />
                    <div className='form-group col-lg-4 col-sm-12'>
                      <label className='col-form-label'>고객</label>
                      <div>
                        <input
                          type='text'
                          className='form-control'
                          name='customer_name'
                          value={searchParams.customer_name}
                          placeholder='고객명을 입력하세요'
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className='row'>
                    <FromToDatePicker
                      className='form-group col-lg-4 col-sm-12'
                      title='계약일자'
                      ref={datePickerRef}
                    />
                    <SelectBox
                      label='서비스유형'
                      name='service_type'
                      value={searchParams.service_type || ''}
                      options={serviceTypeList}
                      onChange={handleServiceTypeChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='form_btn'>
              <button
                type='button'
                className='btn btn-search'
                onClick={handleSearch}
              >
                조회
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default FloorInfoSearchArea;

import React, { useState, useEffect } from 'react';
import FromToDatePicker from '../../../../components/searchutil/FromToDatePicker';
import Region from 'ec_rm/components/searchutil/Region';
import SelectBox from 'ec_rm/components/searchutil/SelectBox';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';

interface PeriodicReportSearchAreaProps {
  onSearch: (searchParams: SearchParams) => void;
}

interface SelectBoxOptions {
  code: string;
  name: string;
}

export interface SearchParams {
  contract_code: string;
  customer_name: string;
  device_id: string;
  region: string;
  region_nm: string;
  sub_region: string;
  sub_region_nm: string;
  device_type: string;
  statistics_from_date: string;
  statistics_to_date: string;
}

export const PeriodicReportSearchArea = ({
  onSearch,
}: PeriodicReportSearchAreaProps): JSX.Element => {
  const {
    startDate,
    endDate,
    region,
    region_nm,
    sub_region,
    sub_region_nm,
    device_type,
  } = useSelector((state: RootState) => state.search);

  const [deviceTypeList] = useState<SelectBoxOptions[]>([
    { code: '148', name: '발신기' },
    { code: '128', name: '화재감지기_신형' },
    { code: '129', name: '화재감지기_구형' },
  ]);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    contract_code: '',
    customer_name: '',
    device_id: '',
    region: region || '',
    region_nm: region_nm || '',
    sub_region: sub_region || '',
    sub_region_nm: sub_region_nm || '',
    device_type: device_type || '',
    statistics_from_date: startDate || '',
    statistics_to_date: endDate || '',
  });

  useEffect(() => {
    if (startDate || endDate || region || sub_region || device_type) {
      setSearchParams((prev) => ({
        ...prev,
        region: region || prev.region,
        region_nm: region_nm || prev.region_nm,
        sub_region: sub_region || prev.sub_region,
        sub_region_nm: sub_region_nm || prev.sub_region_nm,
        device_type: device_type || prev.device_type,
        statistics_from_date: startDate || prev.statistics_from_date,
        statistics_to_date: endDate || prev.statistics_to_date,
      }));
    }
  }, [
    startDate,
    endDate,
    region,
    region_nm,
    sub_region,
    sub_region_nm,
    device_type,
  ]);

  const handleDeviceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      device_type: value,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    onSearch(searchParams);
  };

  return (
    <div className='search_area white_box pl15'>
      <div className='search_form'>
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
                      name='contract_code'
                      value={searchParams.contract_code}
                      onChange={handleInputChange}
                      placeholder='계약번호를 입력하세요'
                    />
                  </div>
                </div>
                <Region />
                <div className='form-group col-lg-4 col-sm-12'>
                  <label className='col-form-label'>고객명</label>
                  <div>
                    <input
                      type='text'
                      className='form-control'
                      name='customer_name'
                      value={searchParams.customer_name}
                      onChange={handleInputChange}
                      placeholder='고객명을 입력하세요'
                    />
                  </div>
                </div>
              </div>
              <div className='row'>
                <SelectBox
                  label='장치'
                  name='device_type'
                  value={searchParams.device_type}
                  options={deviceTypeList}
                  onChange={handleDeviceTypeChange}
                />
                <div className='form-group col-lg-4 col-sm-12'>
                  <label className='col-form-label'>장치ID</label>
                  <div>
                    <input
                      type='text'
                      className='form-control'
                      name='device_id'
                      value={searchParams.device_id}
                      onChange={handleInputChange}
                      placeholder='장치ID를 입력하세요'
                    />
                  </div>
                </div>
                <FromToDatePicker className='form-group col-lg-4 col-sm-12' />
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
      </div>
    </div>
  );
};

export default PeriodicReportSearchArea;

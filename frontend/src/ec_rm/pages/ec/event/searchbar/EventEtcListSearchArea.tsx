import Region from 'ec_rm/components/searchutil/Region';
import ApiClient from 'ec_rm/utils/ApiClient';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setServiceType } from '../../../../../store/state/searchSlice';
import { RootState } from '../../../../../store/store';
import FromToDatePicker from '../../../../components/searchutil/FromToDatePicker';
import { useSearchBar } from '../../../../contexts/SearchProvider';
import SelectBox from '../../../../components/searchutil/SelectBox';

interface SearchAreaProps {
  onSearch: (searchParams: SearchParams) => void;
}

interface SelectBoxOptions {
  code: string;
  name: string;
}

export interface SearchParams {
  service_type: string;
  event_kind: string;
  contract_code: string;
  customer_name: string;
  region: string;
  region_nm: string;
  sub_region: string;
  sub_region_nm: string;
  device_type: string;
  event_from_date: string;
  event_to_date: string;
}

export const EventListSearchArea = ({
  onSearch,
}: SearchAreaProps): JSX.Element => {
  const {
    startDate,
    endDate,
    region,
    region_nm,
    sub_region,
    sub_region_nm,
    service_type,
  } = useSelector((state: RootState) => state.search);

  const [serviceTypeList, setServiceTypeList] = useState<SelectBoxOptions[]>(
    []
  );

  const [eventKindList, setEventKindList] = useState<SelectBoxOptions[]>([
    { code: '1', name: '경보' },
    { code: '2', name: '주의보' },
  ]);

  const [deviceTypeList, setDeviceTypeList] = useState<SelectBoxOptions[]>([
    { code: '148', name: '발신기' },
    { code: '160', name: '수신기' },
    { code: '176', name: '중계기' },
    { code: '128', name: '화재감지기_신형' },
    { code: '129', name: '화재감지기_구형' },
  ]);

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
    if (serviceTypeList.length > 0) {
      setSearchParams((prev) => ({
        ...prev,
        service_type: serviceTypeList[0].code,
      }));
    }
  }, [serviceTypeList]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSearchParams: SearchParams = {
      ...searchParams,
      region: region || '',
      region_nm: region_nm || '',
      sub_region: sub_region || '',
      sub_region_nm: sub_region_nm || '',
      event_from_date: startDate || '',
      event_to_date: endDate || '',
    };
    console.log(updatedSearchParams);
    onSearch(updatedSearchParams);
  };

  const { isSearchVisible } = useSearchBar();

  return (
    <>
      {isSearchVisible && (
        <div className='search_area white_box pl15'>
          <form className='search_form' name='srchForm' onSubmit={handleSubmit}>
            <div className='form_input'>
              <div className='row'>
                <div className='col-12 pr-0'>
                  <div className='row'>
                    <SelectBox
                      label='서비스유형'
                      name='service_type'
                      value={searchParams.service_type}
                      options={serviceTypeList}
                      onChange={(e) =>
                        setSearchParams((prev) => ({
                          ...prev,
                          service_type: e.target.value,
                        }))
                      }
                      showPlaceholder={false}
                    />
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
                    <Region />
                    <SelectBox
                      label='장비'
                      name='device_type'
                      value={searchParams.device_type}
                      options={deviceTypeList}
                      onChange={handleInputChange}
                    />
                    <FromToDatePicker
                      className='form-group col-lg-4 col-sm-12'
                      title='발생시간'
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='form_btn'>
              <button type='submit' className='btn btn-search'>
                조회
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default EventListSearchArea;

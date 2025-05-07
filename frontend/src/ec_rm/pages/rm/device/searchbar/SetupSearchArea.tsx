import React, { useEffect, useState, useRef } from 'react';
import FromToDatePicker from '../../../../components/searchutil/FromToDatePicker';
import { useSearchBar } from '../../../../contexts/SearchProvider';
import Region from '../../../../components/searchutil/Region';
import { RootState } from '../../../../../store/store';
import { useDispatch, useSelector } from 'react-redux';

interface SearchAreaProps {
  onSearch: (searchParams: SearchParams) => void;
}

interface SearchParams {
  contract_code: string;
  region: string;
  region_nm: string;
  sub_region: string;
  sub_region_nm: string;
  customer_name: string;
  installation_from_date: string;
  installation_to_date: string;
}

export const SetupSearchArea = ({ onSearch }: SearchAreaProps): JSX.Element => {
  const dispatch = useDispatch();
  const datePickerRef = useRef<any>(null);
  const regionRef = useRef<any>(null);

  const { startDate, endDate, region, region_nm, sub_region, sub_region_nm } =
    useSelector((state: RootState) => state.search);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    contract_code: '',
    region: '',
    region_nm: '',
    sub_region: '',
    sub_region_nm: '',
    customer_name: '',
    installation_from_date: '',
    installation_to_date: '',
  });

  // 값이 변경될 때마다 searchParams 업데이트
  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      region: region || '',
      region_nm: region_nm || '',
      sub_region: sub_region || '',
      sub_region_nm: sub_region_nm || '',
      installation_from_date: startDate || '',
      installation_to_date: endDate || '',
    }));
  }, [startDate, endDate, region, region_nm, sub_region, sub_region_nm]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => {
      if (prev[name as keyof SearchParams] !== value) {
        return { ...prev, [name]: value };
      }
      return prev;
    });
  };

  const handleSearch = () => {
    onSearch({
      contract_code: searchParams.contract_code,
      region: region || '',
      region_nm: region_nm || '',
      sub_region: sub_region || '',
      sub_region_nm: sub_region_nm || '',
      customer_name: searchParams.customer_name,
      installation_from_date: startDate || '',
      installation_to_date: endDate || '',
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
                          name='contract_code'
                          value={searchParams.contract_code}
                          onChange={handleInputChange}
                          placeholder='계약번호를 입력하세요'
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
                          onChange={handleInputChange}
                          placeholder='고객명을 입력하세요'
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

export default SetupSearchArea;

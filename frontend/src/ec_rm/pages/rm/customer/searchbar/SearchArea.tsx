import React, { useState, useEffect, useRef } from 'react';
import FromToDatePicker from '../../../../components/searchutil/FromToDatePicker';
import { useSearchBar } from '../../../../contexts/SearchProvider';
import Region from '../../../../components/searchutil/Region';
import { RootState } from '../../../../../store/store';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';

export interface SearchParams {
  contract_code: string;
  region: string | '';
  region_nm: string | '';
  sub_region: string | '';
  sub_region_nm: string | '';
  customer_name: string;
  contract_from_date: string;
  contract_to_date: string;
}

export interface SearchAreaProps {
  onSearch: (searchParams: SearchParams) => void;
  reset?: boolean;
}

export const SearchArea: React.FC<SearchAreaProps> = ({ onSearch, reset }) => {
  const location = useLocation();
  const dispatch = useDispatch();
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
    contract_from_date: startDate || '',
    contract_to_date: endDate || '',
  });

  // 값이 변경될 때만 상태 업데이트
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
    // 검색 파라미터에 날짜 값을 포함
    const updatedSearchParams = {
      ...searchParams,
      contract_from_date: startDate || '',
      contract_to_date: endDate || '',
      region: region || '',
      region_nm: region_nm || '',
      sub_region: sub_region || '',
      sub_region_nm: sub_region_nm || '',
    };

    // 검색 실행
    onSearch(updatedSearchParams);
  };

  const { isSearchVisible } = useSearchBar();

  // 값이 변경될 때마다 searchParams 업데이트
  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      contract_from_date: startDate || '',
      contract_to_date: endDate || '',
      region: region || '',
      region_nm: region_nm || '',
      sub_region: sub_region || '',
      sub_region_nm: sub_region_nm || '',
    }));
  }, [startDate, endDate, region, region_nm, sub_region, sub_region_nm]);

  // reset prop이 true로 변경될 때 검색 조건 초기화
  useEffect(() => {
    if (reset) {
      setSearchParams({
        contract_code: '',
        region: '',
        region_nm: '',
        sub_region: '',
        sub_region_nm: '',
        customer_name: '',
        contract_from_date: startDate || '',
        contract_to_date: endDate || '',
      });
    }
  }, [reset, startDate, endDate]);

  // location state 변경 감지하여 초기화
  useEffect(() => {
    if (location.state?.refresh) {
      // 지역 데이터 초기화
      dispatch({ type: 'regions/resetRegions' });

      // 검색 파라미터 초기화
      setSearchParams({
        contract_code: '',
        region: '',
        region_nm: '',
        sub_region: '',
        sub_region_nm: '',
        customer_name: '',
        contract_from_date: '',
        contract_to_date: '',
      });

      // Region 컴포넌트 초기화
      if (regionRef.current) {
        regionRef.current.resetRegion();
      }
    }
  }, [location.state]);

  return (
    <>
      {isSearchVisible && (
        <div className='search_area white_box pl15'>
          <form className='search_form' name='srchForm'>
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

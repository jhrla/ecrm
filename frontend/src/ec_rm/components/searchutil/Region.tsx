import axios from 'axios';
import React, {
  useState,
  useEffect,
  memo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setRegion, setSubRegion } from '../../../store/state/searchSlice';
import ApiClient from 'ec_rm/utils/ApiClient';

interface RegionOption {
  id: string;
  name: string;
}

export const Region = forwardRef((props, ref) => {
  const [districts, setDistricts] = useState<RegionOption[]>([]); // 구 목록
  const [dongList, setDongList] = useState<RegionOption[]>([]); // 동 목록
  const isFetchingDistrictsRef = useRef(false); // 구 목록 호출 여부 플래그

  const dispatch = useDispatch();
  const { region, sub_region } = useSelector(
    (state: RootState) => state.search
  );

  // 구 목록을 DB에서 가져오는 함수
  const fetchDistricts = async () => {
    // 호출 중이면 함수 종료
    if (isFetchingDistrictsRef.current) return;

    isFetchingDistrictsRef.current = true; // 호출 중 상태로 설정
    try {
      const response = await ApiClient.post('/api/regions', { level: 1 }); // 구 목록을 가져오는 API 호출
      setDistricts(response.data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      isFetchingDistrictsRef.current = false; // 호출 완료 후 상태 변경
    }
  };

  // 특정 구에 해당하는 동 목록을 DB에서 가져오는 함수
  const fetchDongsByDistrict = async (selectedRegion: string) => {
    try {
      const response = await ApiClient.post(`/api/regions`, {
        parent_id: selectedRegion,
      });
      setDongList(response.data);
    } catch (error) {
      console.error('Error fetching dong list:', error);
    }
  };

  // 구 목록을 최초 한 번만 불러오기 (이미 불러왔으면 다시 호출하지 않음)
  useEffect(() => {
    if (districts.length === 0) {
      fetchDistricts();
    }
  }, [districts.length]); // 구 목록 로드 여부에 따라 호출

  // 구(region) 변경 시 동 목록 업데이트
  useEffect(() => {
    if (region) {
      fetchDongsByDistrict(region);
    } else {
      setDongList([]);
    }
  }, [region]); // region만 의존성으로 사용

  // 페이지가 처음 렌더링될 때 구 목록 불러오기
  useEffect(() => {
    fetchDistricts();
  }, []); // 의존성 없이 최초 1회 실행

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedText =
      e.target.options[e.target.selectedIndex].text === '전체'
        ? ''
        : e.target.options[e.target.selectedIndex].text;

    // 구 선택이 '전체'일 경우 동도 초기화
    if (e.target.value === '') {
      dispatch(
        setRegion({
          region: '',
          region_nm: '',
        })
      );
      dispatch(
        setSubRegion({
          sub_region: '',
          sub_region_nm: '',
        })
      );
      setDongList([]); // 동 목록도 초기화
    } else {
      dispatch(
        setRegion({
          region: e.target.value,
          region_nm: selectedText || '',
        })
      );
    }
  };

  const handleDongChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sub_region_nm =
      e.target.options[e.target.selectedIndex].text === '전체'
        ? ''
        : e.target.options[e.target.selectedIndex].text; // 선택된 옵션의 텍스트 가져오기
    dispatch(
      setSubRegion({ sub_region: e.target.value, sub_region_nm: sub_region_nm })
    );
  };

  useImperativeHandle(ref, () => ({
    resetRegion: () => {
      dispatch(setRegion({ region: '', region_nm: '' }));
      dispatch(setSubRegion({ sub_region: '', sub_region_nm: '' }));
      setDongList([]);
    },
  }));

  return (
    <div className='form-group col-lg-4 col-sm-12'>
      <label className='col-form-label'>지역</label>
      <div className='row two'>
        <div className='col-lg-6'>
          <select
            className='form-control'
            name='region'
            value={region || ''}
            onChange={handleDistrictChange}
          >
            <option value=''>전체</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div className='col-lg-6'>
          <select
            className='form-control'
            name='sub_region'
            value={sub_region || ''}
            onChange={handleDongChange}
            disabled={!region}
          >
            <option value=''>전체</option>
            {dongList.map((dong) => (
              <option key={dong.id} value={dong.id}>
                {dong.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
});

export default memo(Region);

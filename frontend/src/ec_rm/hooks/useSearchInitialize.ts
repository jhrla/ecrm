import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  setStartDate,
  setEndDate,
  setRegion,
  setSubRegion,
  setServiceType,
} from 'store/state/searchSlice';

interface SearchInitializeOptions {
  fromDateField?: string;
  toDateField?: string;
}

export const useSearchInitialize = <T extends { [key: string]: any }>(
  setSearchParams: (params: T) => void,
  fetchData: (...args: any[]) => void,
  createInitialParams: () => T,
  options: SearchInitializeOptions = {
    fromDateField: 'contract_from_date',
    toDateField: 'contract_to_date',
  }
) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current || location.state?.refresh) {
      initialized.current = true;

      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const formattedToday = today.toISOString().split('T')[0];
      const formattedOneMonthAgo = oneMonthAgo.toISOString().split('T')[0];

      dispatch(setStartDate(formattedOneMonthAgo));
      dispatch(setEndDate(formattedToday));
      dispatch(setRegion({ region: '', region_nm: '' }));
      dispatch(setSubRegion({ sub_region: '', sub_region_nm: '' }));
      dispatch(setServiceType(''));

      const initialParams = {
        ...createInitialParams(),
        [options.fromDateField!]: formattedOneMonthAgo,
        [options.toDateField!]: formattedToday,
      } as T;

      console.log('Setting initial params:', initialParams);
      setSearchParams(initialParams);
      fetchData(initialParams, 1, 10);

      // state 제거하되 현재 경로 유지
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [location.pathname, location.state?.refresh]);
};

// store/dateSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';

const getStartDate = (): string => {
  const today = new Date();
  const prevMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    today.getDate()
  );
  return format(prevMonth, 'yyyy-MM-dd');
};

const getTodayDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

interface SearchState {
  contract_code?: string;
  customer_name?: string;
  startDate?: string;
  endDate?: string;
  region?: string;
  region_nm?: string;
  sub_region?: string;
  sub_region_nm?: string;
  service_type?: string;
  device_type?: string;
}

const initialState: SearchState = {
  contract_code: '',
  customer_name: '',
  startDate: getStartDate(), // 한 달 전 날짜로 초기화
  endDate: getTodayDate(), // 오늘 날짜로 초기화
  region: '',
  region_nm: '',
  sub_region: '',
  sub_region_nm: '',
  service_type: '',
  device_type: '',
};

const searchSlice = createSlice({
  name: 'searchParam',
  initialState,
  reducers: {
    setContractCode: (state, action: PayloadAction<string>) => {
      state.contract_code = action.payload;
    },
    setCustomerName: (state, action: PayloadAction<string>) => {
      state.customer_name = action.payload;
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload;
    },
    setRegion: (
      state,
      action: PayloadAction<{ region: string; region_nm: string }>
    ) => {
      state.region = action.payload.region;
      state.region_nm = action.payload.region_nm;
    },
    setSubRegion: (
      state,
      action: PayloadAction<{ sub_region: string; sub_region_nm: string }>
    ) => {
      state.sub_region = action.payload.sub_region;
      state.sub_region_nm = action.payload.sub_region_nm;
    },
    setServiceType: (state, action: PayloadAction<string>) => {
      state.service_type = action.payload;
    },
    setDeviceType: (state, action: PayloadAction<string>) => {
      state.device_type = action.payload;
    },
    resetDates: (state) => {
      state.startDate = getStartDate();
      state.endDate = getTodayDate();
    },
  },
});

export const {
  setContractCode,
  setCustomerName,
  setStartDate,
  setEndDate,
  setRegion,
  setSubRegion,
  setServiceType,
  setDeviceType,
  resetDates,
} = searchSlice.actions;
export default searchSlice.reducer;

// store/dateSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RegionState {
  region: string | null;
  region_nm: string | null;
  sub_region: string | null;
  sub_region_nm: string | null;
}

const initialState: RegionState = {
  region: "",
  region_nm: "",
  sub_region: "",
  sub_region_nm: "",
};

const resionsSlice = createSlice({
  name: "region",
  initialState,
  reducers: {
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
  },
});

export const { setRegion, setSubRegion } = resionsSlice.actions;
export default resionsSlice.reducer;

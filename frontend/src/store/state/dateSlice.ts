// store/dateSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";

interface DateState {
  startDate: string;
  endDate: string;
}

const getTodayDate = () => format(new Date(), "yyyy-MM-dd");

const initialState: DateState = {
  startDate: getTodayDate(),
  endDate: getTodayDate(),
};

const dateSlice = createSlice({
  name: "date",
  initialState,
  reducers: {
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload;
    },
    setDateRange: (
      state,
      action: PayloadAction<{ startDate: string; endDate: string }>
    ) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
  },
});

export const { setStartDate, setEndDate, setDateRange } = dateSlice.actions;
export default dateSlice.reducer;

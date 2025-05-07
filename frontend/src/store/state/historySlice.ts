import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AreaData {
  code: string;
  name: string;
}

interface HistoryState {
  history: { level: string; area: AreaData | null }[];
  currentLevel: string;
  selectedArea: AreaData | null;
}

const initialState: HistoryState = {
  history: [{ level: 'land', area: null }],
  currentLevel: 'land',
  selectedArea: null,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addToHistory: (
      state,
      action: PayloadAction<{ level: string; area: AreaData | null }>
    ) => {
      const lastState = state.history[state.history.length - 1];
      if (
        !action.payload.area ||
        action.payload.area.name === '' ||
        action.payload.area.code === ''
      ) {
        //console.warn("빈 지역 데이터가 히스토리에 추가되지 않도록 필터링");
        return; // 유효하지 않은 값은 히스토리에 추가하지 않음
      }
      if (
        lastState.level !== action.payload.level ||
        JSON.stringify(lastState.area) !== JSON.stringify(action.payload.area)
      ) {
        state.history.push(action.payload);
      }
    },
    updateCurrentLevel: (state, action: PayloadAction<string>) => {
      state.currentLevel = action.payload;
    },
    updateSelectedArea: (state, action: PayloadAction<AreaData | null>) => {
      state.selectedArea = action.payload;
    },
    resetToPreviousState: (state) => {
      // history에 최소 2개 이상의 상태가 있어야만 되돌림 가능
      if (state.history.length > 1) {
        state.history.pop(); // 마지막 상태 제거
        const previousState = state.history[state.history.length - 1]; // 이전 상태
        state.currentLevel = previousState.level;
        state.selectedArea = previousState.area;
      } else {
        // 만약 history가 하나만 남았을 경우 초기 상태로 되돌리기
        state.currentLevel = 'land';
        state.selectedArea = null;
      }
    },
    resetToAll: (state) => {
      // 상태를 완전히 초기 상태로 리셋
      state.history = [{ level: 'land', area: null }];
      state.currentLevel = 'land';
      state.selectedArea = null;
    },
    clearHistory: (state) => {
      // 히스토리를 완전히 비우고 초기 상태만 남김
      return initialState;
    },
    hardReset: () => {
      // 상태를 완전히 초기화
      return initialState;
    },
  },
});

export const {
  addToHistory,
  updateCurrentLevel,
  updateSelectedArea,
  resetToPreviousState,
  resetToAll,
  clearHistory,
  hardReset,
} = historySlice.actions;

export default historySlice.reducer;

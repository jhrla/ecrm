// store/dateSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EventData {
  event_id: number;
  event_time: string | null;
  client_code: string | null;
  contract_code: string | null;
  customer_name: string | null;
  event_type: number;
  event_code: number;
  event_name: string | null;
  sub_code: number;
  sub_name: string | null;
  event_kind: number;
  re_cancel: number;
  other_event: number;
  sms_flag: number;
  device_type: number;
  device_name: string | null;
  event_reason: string | null;
  floor_no: number;
  com_id: string | null;
  device_id: string | null;
  install_address: string | null;
  event_msg: string | null;
  city_code: string | null;
  district_code: string | null;
  smoke_density: number;
  temp: number;
  humidity: number;
  co: number;
  temp_rise: number;
}

interface EventState {
  eventData: EventData[];
  warningCount: number;
  alertCount: number;
}

const initialState: EventState = {
  eventData: (() => {
    try {
      const savedData = localStorage.getItem('eventData');
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error('로컬 스토리지 데이터 파싱 실패:', error);
      return [];
    }
  })(),
  warningCount: 0,
  alertCount: 0,
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setEventData(state, action: PayloadAction<EventData>) {
      const newEvent = action.payload;
      console.log('추가할 이벤트:', newEvent);
      console.log(
        'event_kind:',
        newEvent.event_kind,
        typeof newEvent.event_kind
      );

      // device_id가 없는 경우 무시
      if (!newEvent.device_id) {
        console.error('device_id가 없는 이벤트:', newEvent);
        return;
      }

      const existingIndex = state.eventData.findIndex(
        (item) =>
          item.device_id === newEvent.device_id &&
          item.event_code === newEvent.event_code
      );

      if (existingIndex !== -1) {
        state.eventData[existingIndex] = newEvent;
        console.log('이벤트 업데이트:', state.eventData);
      } else {
        state.eventData.push(newEvent);
        console.log('새 이벤트 추가:', state.eventData);
      }

      // 경고와 주의보 카운트 업데이트 수정
      let warningCount = 0;
      let alertCount = 0;

      state.eventData.forEach((event) => {
        console.log(
          '이벤트 카운트 계산중:',
          event.event_kind,
          typeof event.event_kind
        );
        // 문자열로 된 숫자일 수도 있으므로 Number로 변환하여 비교
        const eventKind = Number(event.event_kind);

        if (eventKind === 2) {
          warningCount++;
          console.log('경고 증가:', warningCount);
        }
        if (eventKind === 1) {
          alertCount++;
          console.log('주의보 증가:', alertCount);
        }
      });

      state.warningCount = warningCount;
      state.alertCount = alertCount;

      console.log('최종 카운트:', {
        warningCount,
        alertCount,
        eventData: state.eventData.map((e) => ({
          event_kind: e.event_kind,
          type: typeof e.event_kind,
        })),
      });

      // 로컬 스토리지에 저장
      localStorage.setItem('eventData', JSON.stringify(state.eventData));
    },

    removeEventData(state, action: PayloadAction<number>) {
      const eventIdToRemove = action.payload;
      console.log('삭제할 event_id:', eventIdToRemove);

      state.eventData = state.eventData.filter(
        (item) => item.event_id !== eventIdToRemove
      );

      // 카운트 업데이트
      let warningCount = 0;
      let alertCount = 0;

      state.eventData.forEach((event) => {
        if (event.event_kind === 2) warningCount++;
        if (event.event_kind === 1) alertCount++;
      });

      state.warningCount = warningCount;
      state.alertCount = alertCount;

      localStorage.setItem('eventData', JSON.stringify(state.eventData));
    },

    // 새로운 액션 추가: 로컬 스토리지에서 데이터 복원
    initializeFromStorage(state) {
      const savedData = localStorage.getItem('eventData');
      if (savedData) {
        state.eventData = JSON.parse(savedData);
      }
    },

    clearAllEventData(state) {
      state.eventData = [];
      state.warningCount = 0;
      state.alertCount = 0;
      localStorage.removeItem('eventData');
    },
  },
});

export const {
  setEventData,
  removeEventData,
  initializeFromStorage,
  clearAllEventData,
} = eventSlice.actions;
export default eventSlice.reducer;

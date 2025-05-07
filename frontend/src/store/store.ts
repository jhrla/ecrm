import { configureStore } from '@reduxjs/toolkit';
import historyReducer from './state/historySlice';
import dateReducer from './state/dateSlice';
import regionReducer from './state/regionSlice';
import eventReducer from './state/eventSlice';
import searchReducer from './state/searchSlice';

const store = configureStore({
  reducer: {
    history: historyReducer,
    event: eventReducer,
    date: dateReducer,
    regions: regionReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

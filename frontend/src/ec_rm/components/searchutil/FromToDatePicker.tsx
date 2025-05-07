import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import $ from 'jquery';
import 'bootstrap-datepicker/dist/js/bootstrap-datepicker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setStartDate, setEndDate } from '../../../store/state/searchSlice';

interface FromToDatePickerProps {
  title?: string;
  className?: string;
}

declare global {
  interface JQuery {
    datepicker(options?: any): JQuery;
  }
}

const FromToDatePicker = forwardRef<any, FromToDatePickerProps>(
  (
    { title = '계약일시', className = 'form-group col-lg-6 col-sm-12' },
    ref
  ) => {
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();

    const { startDate, endDate } = useSelector(
      (state: RootState) => state.search
    );

    const formatDateWithSlash = (date: Date | null): string => {
      if (!date) return '';

      try {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error('Date formatting error:', error);
        return '';
      }
    };

    useEffect(() => {
      if (!startDateRef.current || !endDateRef.current) return;

      const $startDate = $(startDateRef.current);
      const $endDate = $(endDateRef.current);

      const formattedStartDate = startDate || ''; // 한 달 전 날짜로 초기화
      const formattedEndDate = endDate || ''; // 오늘 날짜로 초기화

      $startDate
        .datepicker({
          format: 'yyyy-mm-dd',
          autoclose: true,
          todayHighlight: true,
          orientation: 'bottom auto',
        })
        .on('changeDate', function (e: any) {
          const newDate = formatDateWithSlash(e.date);
          dispatch(setStartDate(newDate)); // Redux 상태 업데이트
          $endDate.datepicker('setStartDate', e.date);
        });

      $endDate
        .datepicker({
          format: 'yyyy-mm-dd',
          autoclose: true,
          todayHighlight: true,
          orientation: 'bottom auto',
        })
        .on('changeDate', function (e: any) {
          const newDate = formatDateWithSlash(e.date);
          dispatch(setEndDate(newDate)); // Redux 상태 업데이트
          $startDate.datepicker('setEndDate', e.date);
        });

      // Datepicker 초기화
      $startDate.datepicker('setDate', formattedStartDate);
      $endDate.datepicker('setDate', formattedEndDate);

      return () => {
        $startDate.datepicker('destroy');
        $endDate.datepicker('destroy');
      };
    }, [dispatch]); // 의존성 배열에 startDate, endDate 제외, 초기 렌더링 시 한 번만 실행

    useImperativeHandle(ref, () => ({
      resetDates: () => {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        dispatch(setStartDate(''));
        dispatch(setEndDate(''));

        if (startDateRef.current) {
          $(startDateRef.current).datepicker('setDate', null);
        }
        if (endDateRef.current) {
          $(endDateRef.current).datepicker('setDate', null);
        }
      },
    }));

    return (
      <div className={className}>
        <label className='col-form-label'>{title}</label>
        <div className='row date'>
          <div className='col-lg-6 daterow pr-0 pl-0'>
            <input
              type='text'
              className='form-control form-datepicker'
              ref={startDateRef}
              value={startDate}
              readOnly
              placeholder='시작 날짜'
              aria-label='시작 날짜'
            />
          </div>
          <div className='col-lg-6 daterow pr-0'>
            <input
              type='text'
              className='form-control form-datepicker'
              ref={endDateRef}
              value={endDate}
              readOnly
              placeholder='종료 날짜'
              aria-label='종료 날짜'
            />
          </div>
        </div>
      </div>
    );
  }
);

export default FromToDatePicker;

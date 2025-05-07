import React, { useEffect, useRef } from "react";
import $ from "jquery";

const BootstrapDatePicker = () => {
  const datepickerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    $(datepickerRef.current!).datepicker({
      format: "yyyy/mm/dd",
      autoclose: true,
      todayHighlight: true,
      orientation: "bottom auto",
    });
  }, []);

  return (
    <div className="form-group">
      <label>날짜 선택:</label>
      <input type="text" className="form-control" ref={datepickerRef} />
    </div>
  );
};

export default BootstrapDatePicker;

import React from 'react';

interface SelectBoxProps {
  label: string;
  name: string;
  value: string;
  options: { code: string; name: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  showPlaceholder?: boolean;
}

const SelectBox: React.FC<SelectBoxProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  showPlaceholder = true,
}) => {
  return (
    <div className='form-group col-lg-4 col-sm-12'>
      <label className='col-form-label'>{label}</label>
      <div>
        <select
          className='form-control'
          name={name}
          value={value}
          onChange={onChange}
        >
          {showPlaceholder && <option value=''>선택하세요</option>}
          {options.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectBox;

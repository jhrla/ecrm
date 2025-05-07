// src/components/SearchArea.tsx
import React, { useState } from "react";

interface SearchAreaProps {
  onSearch: (searchParams: SearchParams) => void;
}

interface SearchParams {
  contractNumber: string;
  region: string;
  customer: string;
  buildingType: string;
  serviceType: string;
  equipmentType: string;
}

const SearchArea = ({ onSearch }: SearchAreaProps): JSX.Element => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    contractNumber: "",
    region: "",
    customer: "",
    buildingType: "",
    serviceType: "",
    equipmentType: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  return (
    <div className="search_area white_box pl15">
      <form onSubmit={handleSubmit}>
        <div className="form_input">
          <div className="row">
            <div className="col-lg-4 col-sm-12">
              <label>계약번호</label>
              <select name="contractNumber" onChange={handleInputChange}>
                <option value="">전체</option>
                {/* Add more options as needed */}
              </select>
            </div>
            {/* Add more form fields for region, customer, etc. */}
          </div>
        </div>
        <div className="form_btn">
          <button type="submit" className="btn btn-primary">
            조회
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchArea;

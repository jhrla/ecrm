import React, { useState } from "react";
import FromToDatePicker from "../../../../components/searchutil/FromToDatePicker";
import { SearchParams } from "../../customer/searchbar/SearchArea";

interface FireSafetySearchAreaProps {
  onSearch: (searchParams: FireSafetySearchParams) => void;
}

export interface FireSafetySearchParams {
  contract_code: string;
  region: string;
  subRegion: string;
  customer: string;
  contractFromDate: string;
  contractToDate: string;
  service_type: string;
}

export const FireSafetySearchArea = ({
  onSearch,
}: FireSafetySearchAreaProps): JSX.Element => {
  const [contractNumber, setContractNumber] = useState("전체");
  const [searchParams, setSearchParams] = useState<FireSafetySearchParams>({
    contract_code: "",
    region: "",
    subRegion: "",
    customer: "",
    contractFromDate: "",
    contractToDate: "",
    service_type: "",
  });

  const [region, setRegion] = useState("서울시");
  const [subRegion, setSubRegion] = useState("시군구");
  const [customer, setCustomer] = useState("(주)강남");
  const [buildingType, setBuildingType] = useState("빌딩(6~20층)");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 폼 제출 로직 구현
    console.log("Form submitted", {
      contractNumber,
      region,
      subRegion,
      customer,
      buildingType,
    });
  };

  const handleDateChange = (fromDate: string, toDate: string) => {
    setSearchParams((prev) => ({
      ...prev,
      contractFromDate: fromDate || prev.contractFromDate,
      contractToDate: toDate || prev.contractToDate,
    }));
  };

  return (
    <div className="search_area white_box pl15">
      <form className="search_form" name="srchForm" onSubmit={handleSubmit}>
        <div className="form_input">
          <div className="row">
            <div className="col-12 pr-0">
              <div className="row">
                <div className="form-group col-lg-4 col-sm-12">
                  <label htmlFor="hdqr_cd" className="col-form-label">
                    계약번호
                  </label>
                  <div>
                    <select
                      className="form-control"
                      id="hdqr_cd"
                      name="hdqr_cd"
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                    >
                      <option value="전체">전체</option>
                    </select>
                  </div>
                </div>
                <div className="form-group col-lg-4 col-sm-12">
                  <label className="col-form-label">지역</label>
                  <div className="row two">
                    <div className="col-lg-6 ">
                      <select
                        className="form-control"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                      >
                        <option value="서울시">서울시</option>
                      </select>
                    </div>
                    <div className="col-lg-6 ">
                      <select
                        className="form-control"
                        value={subRegion}
                        onChange={(e) => setSubRegion(e.target.value)}
                      >
                        <option value="시군구">시군구</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group col-lg-4 col-sm-12">
                  <label className="col-form-label">고객</label>
                  <div>
                    <select
                      className="form-control"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                    >
                      <option value="(주)강남">(주)강남</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="row ">
                <div className="form-group col-lg-4 col-sm-12">
                  <label className="col-form-label">건물유형</label>
                  <div>
                    <select
                      className="form-control"
                      value={buildingType}
                      onChange={(e) => setBuildingType(e.target.value)}
                    >
                      <option value="빌딩(6~20층)">빌딩(6~20층)</option>
                    </select>
                  </div>
                </div>
                <FromToDatePicker />
              </div>
            </div>
          </div>
        </div>
        <div className="form_btn">
          <button type="submit" className="btn btn-search">
            조회
          </button>
        </div>
      </form>
    </div>
  );
};

export default FireSafetySearchArea;

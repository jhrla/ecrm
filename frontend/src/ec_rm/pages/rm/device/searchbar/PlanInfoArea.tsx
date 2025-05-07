import React, { memo, useState } from 'react';

interface CustomerInfo {
  contract_code: string;
  client_code: string;
  customer_name: string;
  city_code: string;
  city_name: string;
  district_code: string;
  district_name: string;
  building_type: string;
}

interface PlanInfoAreaProps {
  customerInfo: CustomerInfo;
  onBackPage: () => void;
}

const PlanInfoArea: React.FC<PlanInfoAreaProps> = memo(
  ({ customerInfo, onBackPage }) => {
    const formFields = [
      { id: 'hdqr_cd', label: '계약번호', value: customerInfo.contract_code },
      {
        id: 'location',
        label: '지역',
        isDouble: true,
        values: [
          { id: 'city', value: customerInfo.city_name },
          { id: 'district', value: customerInfo.district_name },
        ],
      },
      { id: 'customer_name', label: '고객', value: customerInfo.customer_name },
      {
        id: 'building_type',
        label: '건물유형',
        value: customerInfo.building_type,
      },
    ];

    return (
      <div className='search_area black_box pl15'>
        <form className='search_form' name='srchForm'>
          <div className='form_input'>
            <div className='row'>
              <div className='col-12 pr-0'>
                <div className='row'>
                  {formFields.map((field) => (
                    <div
                      key={field.id}
                      className='form-group col-lg-4 col-sm-12'
                    >
                      <label htmlFor={field.id} className='col-form-label'>
                        {field.label}
                      </label>
                      <div>
                        {field.isDouble ? (
                          <div className='row two'>
                            {field.values?.map((subField) => (
                              <div key={subField.id} className='col-lg-6'>
                                <input
                                  className='form-control'
                                  id={subField.id}
                                  name={subField.id}
                                  value={subField.value}
                                  readOnly
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <input
                            className='form-control'
                            id={field.id}
                            name={field.id}
                            value={field.value}
                            readOnly
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className='form_btn'>
            <button
              type='button'
              className='btn btn-search'
              onClick={onBackPage}
            >
              목록
            </button>
          </div>
        </form>
      </div>
    );
  }
);

export default PlanInfoArea;

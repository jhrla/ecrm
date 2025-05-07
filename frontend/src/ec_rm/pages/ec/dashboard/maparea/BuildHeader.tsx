import React, { memo } from 'react';
import { CustomerInfo } from '../interface/DashboardType';

interface BuildHeaderProps {
  customerInfo: CustomerInfo | undefined;
}

const BuildHeader: React.FC<BuildHeaderProps> = ({ customerInfo }) => {
  return (
    <div className='search_area pupple_box pl15'>
      <div className='search_form'>
        <div className='row'>
          <div className='col-12 pr-0'>
            <div className='row'>
              <div className='form-group col-lg-4 col-sm-12'>
                <label className='col-form-label'>계약번호</label>
                <div>
                  <input
                    type='text'
                    className='form-control'
                    value={customerInfo?.contract_code || ''}
                    disabled
                  />
                </div>
              </div>
              <div className='form-group col-lg-4 col-sm-12'>
                <label className='col-form-label'>지역</label>
                <div className='row two'>
                  <div className='col-lg-6'>
                    <input
                      type='text'
                      className='form-control'
                      value={customerInfo?.city_name || ''}
                      disabled
                    />
                  </div>
                  <div className='col-lg-6'>
                    <input
                      type='text'
                      className='form-control'
                      value={customerInfo?.district_name || ''}
                      disabled
                    />
                  </div>
                </div>
              </div>
              <div className='form-group col-lg-4 col-sm-12'>
                <label className='col-form-label'>고객</label>
                <div>
                  <input
                    type='text'
                    className='form-control'
                    value={customerInfo?.customer_name || ''}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='form-group col-lg-4 col-sm-12'>
                <label className='col-form-label'>건물유형</label>
                <div>
                  <input
                    type='text'
                    className='form-control'
                    value={customerInfo?.building_type || ''}
                    disabled
                  />
                </div>
              </div>
              <div className='form-group col-lg-4 col-sm-12'>
                <label className='col-form-label'>소재지</label>
                <div>
                  <input
                    type='text'
                    className='form-control'
                    value={customerInfo?.address || ''}
                    disabled
                  />
                </div>
              </div>
              <div className='form-group col-lg-4 col-sm-12'>
                <label className='col-form-label'>담당자</label>
                <div>
                  <input
                    type='text'
                    className='form-control'
                    value={customerInfo?.manager_name || ''}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='form-group col-lg-4 col-sm-12'>
                <label className='col-form-label'>설치일시</label>
                <div>
                  <input
                    type='text'
                    className='form-control'
                    value={customerInfo?.contract_date || ''}
                    disabled
                  />
                </div>
              </div>
              <div className='form-group col-lg-4 col-sm-12'>
                <label className='col-form-label'>관할소방서</label>
                <div>
                  <input
                    type='text'
                    className='form-control'
                    value={customerInfo?.fire_tel || ''}
                    disabled
                  />
                </div>
              </div>
              <div className='form-group col-lg-4 col-sm-12'>
                <label className='col-form-label'>관할경찰서</label>
                <div>
                  <input
                    type='text'
                    className='form-control'
                    value={customerInfo?.police_tel || ''}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='form-group col-lg-4 col-sm-12'>
                <label className='col-form-label'>연락처1</label>
                <div>
                  <input
                    type='text'
                    className='form-control'
                    value={customerInfo?.emergency_tel1 || ''}
                    disabled
                  />
                </div>
              </div>
              <div className='form-group col-lg-4 col-sm-12'>
                <label className='col-form-label'>연락처2</label>
                <div>
                  <input
                    type='text'
                    className='form-control'
                    value={customerInfo?.emergency_tel2 || ''}
                    disabled
                  />
                </div>
              </div>
              <div className='form-group col-lg-4 col-sm-12'>
                <label className='col-form-label'>연락처3</label>
                <div>
                  <input
                    type='text'
                    className='form-control'
                    value={customerInfo?.emergency_tel3 || ''}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(BuildHeader);

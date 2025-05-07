import React, { useEffect, useState } from 'react';
import CustomerTable from './table/CustomerTable';
import StatusTable from './table/StatusTable';
import DeviceTable from './table/DeviceTable';
import {
  AreaData,
  CustomerInfo,
  CustomerStatusInfo,
  DeviceInfo,
} from '../interface/DashboardType';

interface CustomerAreaProps {
  customerStatusInfo?: CustomerStatusInfo[];
  customerList?: CustomerInfo[];
  deviceList?: DeviceInfo[];
  currentLevel: string | null;
  onTopClick: (areaData: AreaData | null) => void;
  onCustomerClick: (customerInfo: CustomerInfo | null) => void;
}

const CustomerArea: React.FC<CustomerAreaProps> = ({
  customerStatusInfo,
  customerList,
  deviceList = [],
  currentLevel,
  onTopClick,
  onCustomerClick,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const hideCustomer = () => {
    setIsOpen(false);
  };

  const handleTopRowClick = (areaInfo: CustomerStatusInfo) => {
    const newAreaInfo: AreaData = {
      code: areaInfo.code,
      name: areaInfo.name,
    };
    onTopClick(newAreaInfo);
  };

  const handleCustomerRowClick = (customerInfo: CustomerInfo) => {
    onCustomerClick(customerInfo);
  };

  // 이벤트 컴포넌트 렌더링 로직
  const renderCustomerContent = () => {
    if (currentLevel === 'customer') {
      return <DeviceTable deviceInfo={deviceList} />;
    } else if (currentLevel === 'district') {
      return (
        <CustomerTable
          customerList={customerList}
          onClick={handleCustomerRowClick}
        />
      );
    } else {
      return (
        <StatusTable
          customerStatus={customerStatusInfo}
          onTopClick={handleTopRowClick}
        />
      );
    }
  };

  return (
    <div className='customer_area'>
      <button type='button' onClick={hideCustomer} className='customer_button'>
        <i className='ti-angle-left'></i>
        <span>닫기</span>
      </button>
      <div className='inner_customer'>
        <div className='main_title'>
          <h3>스마트 안전관리 고객현황</h3>
        </div>
        <br></br>
        {renderCustomerContent()}
      </div>
    </div>
  );
};

export default CustomerArea;

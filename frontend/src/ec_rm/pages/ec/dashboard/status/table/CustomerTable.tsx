// src/components/EquipmentTable.tsx
import React from 'react';
import CommonTable from '../../../../../components/table/CommonTable';
import CommonTableRow from '../../../../../components/table/CommonTableRow';
import CommonTableColumn from '../../../../../components/table/CommonTableColumn';
import { CustomerInfo } from '../../interface/DashboardType';

interface CommonTableProps {
  customerList: CustomerInfo[] | undefined;
  className?: string;
  onClick: (customer: CustomerInfo) => void;
}

const CustomerTable: React.FC<CommonTableProps> = ({
  customerList,
  onClick,
}) => {
  const headersName = [{ name: '고객' }, { name: '주소' }];

  return (
    <div className='c_cont'>
      <div className='table_type5 brown'>
        <div className='table table-hover'>
          <CommonTable headersName={headersName} className='table-light'>
            {customerList && customerList.length > 0 ? (
              customerList.map((customer) => (
                <CommonTableRow
                  key={customer.contract_code}
                  onClick={() => onClick?.(customer)}
                >
                  <CommonTableColumn>
                    {customer.customer_name}
                  </CommonTableColumn>
                  <CommonTableColumn>{customer.address}</CommonTableColumn>
                </CommonTableRow>
              ))
            ) : (
              <CommonTableRow>
                <CommonTableColumn colSpan={headersName.length}>
                  데이터가 없습니다
                </CommonTableColumn>
              </CommonTableRow>
            )}
          </CommonTable>
        </div>
      </div>
    </div>
  );
};

export default CustomerTable;

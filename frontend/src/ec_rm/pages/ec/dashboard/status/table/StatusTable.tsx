// src/components/EquipmentTable.tsx
import React from 'react';
import CommonTable from '../../../../../components/table/CommonTable';
import CommonTableRow from '../../../../../components/table/CommonTableRow';
import CommonTableColumn from '../../../../../components/table/CommonTableColumn';
import { CustomerStatusInfo } from '../../interface/DashboardType';

interface AllRegionTableProps {
  customerStatus: CustomerStatusInfo[] | undefined;
  type?: string;
  onTopClick?: (customerArea: CustomerStatusInfo) => void;
}

export const TopTable: React.FC<AllRegionTableProps> = ({
  customerStatus = [],
  type = 'top',
  onTopClick,
}) => {
  const divStyle = type === 'top' ? 'table_type5 brown' : 'table_type5';

  const headersName = [{ name: '지역' }, { name: '고객' }];

  console.log(
    'customerStatus: ================================',
    customerStatus
  );

  return (
    <div className='c_cont'>
      <div className={divStyle}>
        <div className='table table-hover'>
          <CommonTable headersName={headersName} className='table-light'>
            {customerStatus.length > 0 ? (
              customerStatus.map((allRegion, index) => (
                <CommonTableRow
                  key={allRegion.code}
                  onClick={() => onTopClick?.(allRegion)}
                  style={{ cursor: 'pointer' }}
                >
                  <CommonTableColumn>{allRegion.name}</CommonTableColumn>
                  <CommonTableColumn>{allRegion.count}</CommonTableColumn>
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

export default TopTable;

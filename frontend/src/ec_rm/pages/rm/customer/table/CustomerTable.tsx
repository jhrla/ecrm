// src/components/EquipmentTable.tsx
import React from 'react';
import CommonTable from '../../../../components/table/CommonTable';
import CommonTableRow from '../../../../components/table/CommonTableRow';
import CommonTableColumn from '../../../../components/table/CommonTableColumn';

interface Customer {
  contract_code: string;
  client_code: string;
  client_name: string;
  ceo_name: string;
  region_code: string;
  region: string;
  sub_region_code: string;
  sub_region: string;
  contract_date: string;
  service_address: string;
  manager_name: string;
  manager_tel: string;
  fire_tel: string;
  police_tel: string;
  building_type_nm: string;
  remark: string;
  gps_position: string;
}

interface CustomerTableProps {
  customer: Customer[];
  transferCustomer: (customer: Customer) => void;
  deleteTransferCustomer: (customer: Customer) => void;
}

export const CustomerTable = ({
  customer = [],
  transferCustomer,
  deleteTransferCustomer,
}: CustomerTableProps): JSX.Element => {
  const headersName = [
    { name: '계약번호' },
    { name: '지역', colspan: 2 },
    { name: '고객' },
    { name: '대표자' },
    { name: '계약일시' },
    { name: '주소' },
    { name: '관리자' },
    { name: '연락처' },
    { name: '관할소방서' },
    { name: '관할경찰서' },
    { name: '건물유형' },
    { name: '데이터생성' },
  ];

  // 전체 열의 수 계산 (colspan 적용)
  const totalColumns = headersName.reduce(
    (total, header) => total + (header.colspan || 1),
    0
  );

  return (
    <div className='mscrollTable'>
      <div className='table_type1'>
        <CommonTable headersName={headersName}>
          {customer.length > 0 ? (
            customer.map((customer) => (
              <CommonTableRow key={customer.contract_code}>
                <CommonTableColumn>{customer.contract_code}</CommonTableColumn>
                <CommonTableColumn>{customer.region}</CommonTableColumn>
                <CommonTableColumn>{customer.sub_region}</CommonTableColumn>
                <CommonTableColumn>{customer.client_name}</CommonTableColumn>
                <CommonTableColumn>{customer.ceo_name}</CommonTableColumn>
                <CommonTableColumn>{customer.contract_date}</CommonTableColumn>
                <CommonTableColumn>
                  {customer.service_address}
                </CommonTableColumn>
                <CommonTableColumn>{customer.manager_name}</CommonTableColumn>
                <CommonTableColumn>{customer.manager_tel}</CommonTableColumn>
                <CommonTableColumn>{customer.fire_tel}</CommonTableColumn>
                <CommonTableColumn>{customer.police_tel}</CommonTableColumn>
                <CommonTableColumn>
                  {customer.building_type_nm}
                </CommonTableColumn>
                <CommonTableColumn>
                  {customer.gps_position == null ? ( // null 또는 undefined를 처리
                    <>
                      <button
                        onClick={() => transferCustomer(customer)}
                        className='btn btn-warning btn-sm'
                      >
                        RM 데이터 생성
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => deleteTransferCustomer(customer)}
                      className='btn btn-danger btn-sm text-white'
                    >
                      RM 데이터 삭제
                    </button>
                  )}
                </CommonTableColumn>
              </CommonTableRow>
            ))
          ) : (
            <CommonTableRow>
              <CommonTableColumn colSpan={totalColumns}>
                데이터가 없습니다
              </CommonTableColumn>
            </CommonTableRow>
          )}
        </CommonTable>
      </div>
    </div>
  );
};

export default CustomerTable;

// src/components/DeviceTable.tsx
import React from "react";
import CommonTable from "../../../../components/table/CommonTable";
import CommonTableRow from "../../../../components/table/CommonTableRow";
import CommonTableColumn from "../../../../components/table/CommonTableColumn";

interface FireSafetyInfo {
  number: number;
  contractNumber: string;
  region: string;
  subRegion: string;
  customer: string;
  representative: string;
  buildingType: string;
  equipmentName: string;
  modelCode: string;
  equipmentId: string;
  collectionTime: string;
  installationLocation: string;
  fwVersion: string;
  status: string;
}

interface FireSafetyTableProps {
  fireSafetyInfos: FireSafetyInfo[];
  //onFireSafety: (equipmentID: string) => void;
}

export const DeviceSetupTable = ({
  fireSafetyInfos,
}: //onFireSafety,
FireSafetyTableProps): JSX.Element => {
  const headersName = [
    { name: "번호" },
    { name: "계약번호" },
    { name: "지역" },
    { name: "고객" },
    { name: "대표자" },
    { name: "건물유형" },
    { name: "장비명" },
    { name: "모델코드" },
    { name: "장비ID" },
    { name: "수집시간(end)" },
    { name: "설치위치" },
    { name: "FW버전" },
    { name: "상태" },
  ];

  const onDeviceSetup = (deviceId: string) => {
    console.log("1234");
  };

  return (
    <div className="mscrollTable">
      <div className="table_type1">
        <CommonTable headersName={headersName}>
          {fireSafetyInfos.map((fireSafety) => (
            <CommonTableRow key={fireSafety.number}>
              <CommonTableColumn>{fireSafety.number}</CommonTableColumn>
              <CommonTableColumn>{fireSafety.contractNumber}</CommonTableColumn>
              <CommonTableColumn>{fireSafety.region}</CommonTableColumn>
              <CommonTableColumn>{fireSafety.customer}</CommonTableColumn>
              <CommonTableColumn>{fireSafety.representative}</CommonTableColumn>
              <CommonTableColumn>{fireSafety.buildingType}</CommonTableColumn>
              <CommonTableColumn>{fireSafety.equipmentName}</CommonTableColumn>
              <CommonTableColumn>{fireSafety.modelCode}</CommonTableColumn>
              <CommonTableColumn>{fireSafety.equipmentId}</CommonTableColumn>
              <CommonTableColumn>{fireSafety.collectionTime}</CommonTableColumn>
              <CommonTableColumn>
                {fireSafety.installationLocation}
              </CommonTableColumn>
              <CommonTableColumn>{fireSafety.fwVersion}</CommonTableColumn>
              <CommonTableColumn>{fireSafety.status}</CommonTableColumn>
            </CommonTableRow>
          ))}
        </CommonTable>
      </div>
    </div>
  );
};

export default DeviceSetupTable;

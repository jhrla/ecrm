// src/components/common/CommonTable.tsx
import React from "react";

interface HeaderConfig {
  name: string;
  colspan?: number;
}

interface CommonTableProps {
  headersName: HeaderConfig[];
  children: React.ReactNode;
  className?: string;
}

const CommonTable = ({
  headersName,
  children,
  className,
}: CommonTableProps): JSX.Element => {
  return (
    <table className={className}>
      <thead>
        <tr>
          {headersName.map((item, index) => {
            return (
              <th key={index} scope="col" colSpan={item.colspan || 1}>
                {item.name}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

export default CommonTable;

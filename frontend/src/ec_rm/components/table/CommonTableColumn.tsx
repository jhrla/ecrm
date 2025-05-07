// src/components/common/CommonTableColumn.tsx
import React from 'react';

interface CommonTableColumnProps {
  onClick?: () => void;
  children: React.ReactNode;
  colSpan?: number;
  style?: React.CSSProperties;
}

const CommonTableColumn = ({
  onClick,
  children,
  colSpan,
  style,
}: CommonTableColumnProps): JSX.Element => {
  return (
    <td colSpan={colSpan} onClick={onClick} style={style}>
      {children}
    </td>
  );
};

export default CommonTableColumn;

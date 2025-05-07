import React from 'react';

interface CommonTableRowProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}

const CommonTableRow = ({
  onClick,
  style,
  className,
  children,
}: CommonTableRowProps): JSX.Element => {
  const defaultStyle: React.CSSProperties = {
    cursor: typeof onClick === 'function' ? 'pointer' : 'default',
  };

  const mergedStyle: React.CSSProperties = {
    ...defaultStyle,
    ...style,
  };

  return (
    <tr onClick={onClick} style={mergedStyle} className={className}>
      {children}
    </tr>
  );
};

export default CommonTableRow;

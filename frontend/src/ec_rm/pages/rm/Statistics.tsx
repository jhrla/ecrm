import React from "react";
import { Outlet } from "react-router-dom";

export const Statistics = (): JSX.Element => (
  <div>
    <Outlet /> {/* 하위 컴포넌트가 여기에 렌더링됩니다 */}
  </div>
);

import { Navigate } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div>
      <h2>404 - Page Not Found</h2>
      <p>이 페이지는 존재하지 않습니다.</p>
      return <Navigate to="/" replace />;
    </div>
  );
};

export default NotFound;

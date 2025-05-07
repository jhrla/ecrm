import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import EcMain from './ec_rm/pages/EcMain';
import RmMain from 'ec_rm/pages/RmMain';


const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path='/ecrm/ec/*' element={<EcMain />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;

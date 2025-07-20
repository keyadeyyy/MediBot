import { Outlet, Link } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <h1 className="layout-heading">Welcome to MediBot!</h1>
      <div className="layout-button-container">
        <Link to="/register" className="layout-button">Register</Link>
        <Link to="/login" className="layout-button">Login</Link>
      </div>

      <Outlet />
    </div>
  );
};

export default Layout;

import { Outlet } from 'react-router';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      {/* Toast container */}
      <div className="toast" id="toast"></div>
    </>
  );
}

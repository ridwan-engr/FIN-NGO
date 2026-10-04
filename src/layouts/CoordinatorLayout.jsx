import { Outlet } from "react-router-dom";

import CoordinatorSidebar from "../components/layout/CoordinatorSidebar.jsx";
import MobileNavigation from "../components/layout/MobileNavigation.jsx";

import "./CoordinatorLayout.css";

export default function CoordinatorLayout() {
  return (
    <div className="coordinator-layout">
      <CoordinatorSidebar />
      <MobileNavigation />

      <div className="coordinator-layout__workspace">
        <Outlet />
      </div>
    </div>
  );
}

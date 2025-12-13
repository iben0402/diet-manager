import { Outlet } from "react-router-dom";
import SidebarMenu from "./sidebarMenu.jsx";

function LayoutWithSidebar() {
  return (
    <div className="layout-with-sidebar">
      <SidebarMenu />
      <div className="layout-content">
        <Outlet />
      </div>
    </div>
  );
}

export default LayoutWithSidebar;

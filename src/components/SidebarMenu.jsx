import { useState } from "react";
import { Link } from "react-router-dom";
import "./sidebarMenu.css";

const sections = [
  {
    title: "Main menu",
    items: [
      { icon: "dashboard", label: "Dashboard", path: "/main" },
      { icon: "crisis_alert", label: "Goals", path: "/goals" },
      { icon: "chrome_reader_mode", label: "Recipes", path: "/recipes" },
      { icon: "calendar_month", label: "Plan", path: "/plan" },
      { icon: "shopping_cart", label: "Grocery List", path: "/grocery-list" },
      { icon: "blood_pressure", label: "Measurements", path: "/measurements" },
    ],
  },
  {
    title: "Social",
    items: [
      { icon: "group", label: "Friends", path: "/friends" },
      { icon: "group_add", label: "Invite to Friends", path: "/invite" },
    ],
  },
  {
    title: "Other",
    items: [
      { icon: "settings", label: "Settings", path: "/settings" },
      { icon: "info", label: "Help & Center", path: "/help" },
    ],
  },
];

function SidebarMenu() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="sidebar-wrapper">
      {!collapsed ? (
        <aside className="sidebar">
          <div className="sidebar__top">
            <div className="sidebar__brand">nutri bloom</div>
            <button
              type="button"
              className="sidebar__toggle"
              onClick={() => setCollapsed(true)}
              aria-label="Hide menu"
            >
              <span className="material-symbols-outlined">left_panel_close</span>
            </button>
          </div>
          {sections.map((section) => (
            <div key={section.title} className="sidebar__section">
              <div className="sidebar__section-title">{section.title}</div>
              <ul className="sidebar__list">
                {section.items.map((item) => (
                  <li key={item.label} className="sidebar__item">
                    <Link to={item.path} className="sidebar__link">
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span className="sidebar__item-label">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
      ) : (
        <button
          type="button"
          className="sidebar__expand-btn"
          onClick={() => setCollapsed(false)}
          aria-label="Show menu"
        >
          <span className="material-symbols-outlined">menu_open</span>
        </button>
      )}
    </div>
  );
}

export default SidebarMenu;

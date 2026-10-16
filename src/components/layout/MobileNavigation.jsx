import {
  House,
  Accessibility,
  ListTodo,
  CalendarCheck,
  ChartNoAxesColumn,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import "./MobileNavigation.css";

const navigation = [
  {
    label: "Home",
    path: "/coordinator/dashboard",
    icon: House,
  },
  {
    label: "Volunteers",
    path: "/coordinator/volunteers",
    icon: Accessibility,
  },
  {
    label: "Tasks",
    path: "/coordinator/tasks",
    icon: ListTodo,
  },
  {
    label: "Attendance",
    path: "/coordinator/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Reports",
    path: "/coordinator/reports",
    icon: ChartNoAxesColumn,
  },
  {
    label: "Settings",
    path: "/coordinator/settings",
    icon: Settings,
  },
];

export default function MobileNavigation() {
  return (
    <nav
      className="mobile-navigation"
      aria-label="Mobile coordinator navigation"
    >
      {navigation.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={label}
          to={path}
          className={({ isActive }) =>
            [
              "mobile-navigation__item",
              isActive ? "mobile-navigation__item--active" : "",
            ]
              .filter(Boolean)
              .join(" ")
          }
        >
          <Icon
            className="mobile-navigation__icon"
            size={23}
            strokeWidth={1.8}
          />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

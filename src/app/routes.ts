import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { AllCattle } from "./components/AllCattle";
import { Genealogy } from "./components/Genealogy";
import { Timeline } from "./components/Timeline";
import { Alerts } from "./components/Alerts";
import { Donations } from "./components/Donations";
import { CattleProfile } from "./components/CattleProfile";
import { CattleDrillDown } from "./components/CattleDrillDown";
import { Notes } from "./components/Notes";
import { AdminHerd } from "./components/AdminHerd";
import { AdminUsers } from "./components/AdminUsers";
import { RegisterCattle } from "./components/RegisterCattle";
import { EditCattle } from "./components/EditCattle";
import { Report } from "./components/Report";
import { DailyOps } from "./components/DailyOps";
import { Login } from "./components/Login";
import { PendingApproval } from "./components/PendingApproval";
import { RequireAuth, RequireAdminOrManager, RequireAdmin } from "./components/RequireAuth";

export const router = createBrowserRouter([
  { path: "login", Component: Login },
  { path: "pending-approval", Component: PendingApproval },
  {
    path: "/",
    Component: RequireAuth,
    children: [
      {
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "list-cattle/:type", Component: AllCattle },
          { path: "genealogy", Component: Genealogy },
          // { path: "timeline", Component: Timeline },
          { path: "alerts", Component: Alerts },
          { path: "donations", Component: Donations },
          { path: "cattle/:tagNumber", Component: CattleProfile },
          { path: "cattle-drill-down", Component: CattleDrillDown },
          { path: "notes", Component: Notes },
          {
            Component: RequireAdminOrManager,
            children: [
              { path: "admin/herd", Component: AdminHerd },
              { path: "admin/register", Component: RegisterCattle },
              { path: "admin/edit/:tagNumber", Component: EditCattle },
              { path: "admin/report", Component: Report },
              { path: "admin/daily", Component: DailyOps },
            ],
          },
          {
            Component: RequireAdmin,
            children: [
              { path: "admin/users", Component: AdminUsers },
            ],
          },
        ],
      },
    ],
  },
]);

import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { AllCattle } from "./components/AllCattle";
import { Genealogy } from "./components/Genealogy";
import { Timeline } from "./components/Timeline";
import { Alerts } from "./components/Alerts";
import { BreedScoring } from "./components/BreedScoring";
// import { Memorial } from "./components/Memorial";
import { Donations } from "./components/Donations";
import { CattleProfile } from "./components/CattleProfile";
import { AdminHerd } from "./components/AdminHerd";
import { AdminUsers } from "./components/AdminUsers";
import { Login } from "./components/Login";
import { RequireAuth } from "./components/RequireAuth";

export const router = createBrowserRouter([
  { path: "login", Component: Login },
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
          // { path: "breed-scoring", Component: BreedScoring },
          { path: "timeline", Component: Timeline },
          { path: "alerts", Component: Alerts },
          // { path: "memorial", Component: Memorial },
          { path: "donations", Component: Donations },
          { path: "cattle/:tagNumber", Component: CattleProfile },
          { path: "admin/herd", Component: AdminHerd },
          { path: "admin/users", Component: AdminUsers },
        ],
      },
    ],
  },
]);
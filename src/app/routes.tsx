import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardOverview } from "./pages/dashboard/DashboardOverview";
import { Accounts } from "./pages/dashboard/Accounts";
import { Transactions } from "./pages/dashboard/Transactions";
import { Cards } from "./pages/dashboard/Cards";
import { Support } from "./pages/dashboard/Support";
import { Settings } from "./pages/dashboard/Settings";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { Users } from "./pages/admin/Users";
import { AdminTransactions } from "./pages/admin/AdminTransactions";
import { Withdrawals } from "./pages/admin/Withdrawals";
import { Messages } from "./pages/admin/Messages";
import { AdminSettings } from "./pages/admin/AdminSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardOverview },
      { path: "accounts", Component: Accounts },
      { path: "transactions", Component: Transactions },
      { path: "cards", Component: Cards },
      { path: "support", Component: Support },
      { path: "settings", Component: Settings },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminOverview },
      { path: "users", Component: Users },
      { path: "transactions", Component: AdminTransactions },
      { path: "withdrawals", Component: Withdrawals },
      { path: "messages", Component: Messages },
      { path: "settings", Component: AdminSettings },
    ],
  },
]);

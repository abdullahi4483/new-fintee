import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardOverview } from "./pages/client/DashboardOverview";
import { Accounts } from "./pages/client/Accounts";
import { Transactions } from "./pages/client/Transactions";
import { Cards } from "./pages/client/Cards";
import { Support } from "./pages/client/Support";
import { Settings } from "./pages/client/Settings";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { Users } from "./pages/admin/Users";
import { AdminTransactions } from "./pages/admin/AdminTransactions";
import { Withdrawals } from "./pages/admin/Withdrawals";
import { Messages } from "./pages/admin/Messages";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { GuestOnly, RequireAuth } from "./lib/auth";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: () => (
      <GuestOnly>
        <Login />
      </GuestOnly>
    ),
  },
  {
    path: "/signup",
    Component: () => (
      <GuestOnly>
        <Signup />
      </GuestOnly>
    ),
  },
  {
    path: "/dashboard",
    Component: () => (
      <RequireAuth role="client">
        <DashboardLayout />
      </RequireAuth>
    ),
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
    Component: () => (
      <RequireAuth role="admin">
        <AdminLayout />
      </RequireAuth>
    ),
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

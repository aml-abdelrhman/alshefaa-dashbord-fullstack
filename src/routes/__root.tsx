// // src/routes/__root.tsx — Complete final route tree

import { createRootRoute, Outlet } from '@tanstack/react-router'
import { RootLayout } from "../layouts/RootLayout"

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <div>الصفحة غير موجودة - تأكد من الروابط</div>,
})

// import {
//   createRouter,
//   createRoute,
//   createRootRoute,
//   redirect,
// } from "@tanstack/react-router";

// import { RootLayout }         from "../layouts/RootLayout";
// import { LoginPage }          from "../pages/auth/LoginPage";
// import { RegisterPage }       from "../pages/auth/RegisterPage";
// import { PatientDashboard }   from "./_protected/PatientDashboard";
// import { AdminDashboard }     from "./_protected/AdminDashboard";
// import { AppointmentsPage }   from "./_protected/AppointmentsPage";
// import { RecordsPage }        from "./_protected/RecordsPage";
// import { NewRecordPage }      from "./_protected/NewRecordPage";
// import { FavoritesPage }      from "./_protected/FavoritesPage";
// import { PatientsPage }       from "./_protected/PatientsPage";
// import { AnalyticsPage }      from "./_protected/AnalyticsPage";
// import { SettingsPage }       from "./_protected/SettingsPage";
// import { DoctorsPage }        from "./DoctorsPage";
// import { DoctorDetail }       from "./_protected/DoctorDetail";
// import { PackagesPage }       from "./products/PackagesPage";
// import { CartPage }           from "./cart.lazy";

// // ─── Auth helpers ─────────────────────────────────────────────────────────────
// const getToken = (): string | null => {
//   try {
//     const authData = localStorage.getItem("telehealth-auth");
//     if (!authData) return null;
//     return JSON.parse(authData)?.state?.token ?? null;
//   } catch { return null; }
// };

// const getRole = (): string | null => {
//   try {
//     const authData = localStorage.getItem("telehealth-auth");
//     if (!authData) return null;
//     return JSON.parse(authData)?.state?.user?.role ?? null;
//   } catch { return null; }
// };

// const requireAuth = ({ location }: { location: { pathname: string } }) => {
//   if (!getToken())
//     throw redirect({ to: "/login", search: { redirect: location.pathname }, replace: true });
// };

// const requireAdmin = (ctx: { location: { pathname: string } }) => {
//   requireAuth(ctx);
//   if (getRole() !== "admin") throw redirect({ to: "/dashboard/patient" });
// };

// // ─── Root ─────────────────────────────────────────────────────────────────────
// export const Route = createRootRoute({ component: RootLayout });

// // ─── Public routes ────────────────────────────────────────────────────────────
// export const indexRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/",
//   component: () => null,
//   beforeLoad: () => {
//     throw redirect({ to: getToken() ? "/dashboard/patient" : "/doctors" });
//   },
// });

// type LoginSearch = {
//   redirect?: string;
// };

// export const loginRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/login",
//   component: LoginPage,
//   validateSearch: (search: Record<string, unknown>): LoginSearch => ({
//     redirect: (search.redirect as string) || undefined,
//   }),
//   beforeLoad: ({ search }) => {
//     if (getToken()) {
//       throw redirect({ to: search.redirect || "/dashboard/patient", replace: true });
//     }
//   },
// });

// export const registerRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/register",
//   component: RegisterPage,
//   beforeLoad: () => { if (getToken()) throw redirect({ to: "/dashboard/patient", replace: true }); },
// });

// export const doctorsRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/doctors",
//   component: DoctorsPage,
// });

// export const doctorDetailRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/doctors/$doctorId",
//   component: DoctorDetail,
// });

// export const packagesRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/packages",
//   component: PackagesPage,
// });

// // ─── Protected — Patient ──────────────────────────────────────────────────────
// export const cartRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/cart",
//   component: CartPage,
//   beforeLoad: requireAuth,
// });

// export const patientDashRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/dashboard/patient",
//   component: PatientDashboard,
//   beforeLoad: requireAuth,
// });

// export const appointmentsRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/appointments",
//   component: AppointmentsPage,
//   beforeLoad: requireAuth,
// });

// export const recordsRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/records",
//   component: RecordsPage,
//   beforeLoad: requireAuth,
// });

// export const newRecordRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/NewRecordPage",
//   component: NewRecordPage,
//   beforeLoad: requireAuth,
// });

// export const favoritesRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/favorites",
//   component: FavoritesPage,
//   beforeLoad: requireAuth,
// });

// export const settingsRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/settings",
//   component: SettingsPage,
//   beforeLoad: requireAuth,
// });

// // ─── Protected — Admin only ───────────────────────────────────────────────────
// export const adminDashRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/dashboard/admin",
//   component: AdminDashboard,
//   beforeLoad: requireAdmin,
// });

// export const patientsRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/patients",
//   component: PatientsPage,
//   beforeLoad: requireAdmin,
// });

// export const analyticsRoute = createRoute({
//   getParentRoute: () => Route,
//   path: "/analytics",
//   component: AnalyticsPage,
//   beforeLoad: requireAdmin,
// });

// // ─── Route tree ───────────────────────────────────────────────────────────────
// const routeTree = Route.addChildren([
//   indexRoute,
//   loginRoute,
//   registerRoute,
//   // Public
//   doctorsRoute,
//   doctorDetailRoute,
//   packagesRoute,
//   // Patient-protected
//   cartRoute,
//   patientDashRoute,
//   appointmentsRoute,
//   recordsRoute,
//   newRecordRoute,
//   favoritesRoute,
//   settingsRoute,
//   // Admin-only
//   adminDashRoute,
//   patientsRoute,
//   analyticsRoute,
// ]);

// // ─── Router ───────────────────────────────────────────────────────────────────
// export const router = createRouter({
//   routeTree,
//   defaultPreload: "intent",
//   defaultPreloadStaleTime: 0,
// });

// declare module "@tanstack/react-router" {
//   interface Register { router: typeof router; }
// }
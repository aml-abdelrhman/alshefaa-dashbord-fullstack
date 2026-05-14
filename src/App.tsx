import React from "react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";
import "./index.css";

// 1. استيراد شجرة المسارات التي تم توليدها تلقائياً
import { routeTree } from "./routeTree.gen";

// 2. إنشاء كائن الـ router وربطه بالشجرة
const router = createRouter({
  routeTree,
  context: {
    queryClient, // بنمرر الـ queryClient لو حابة تستخدميه جوه الـ Loaders لاحقاً
  },
});

// 3. تعريف الـ Types عشان TypeScript يديكي Autocomplete للمسارات في المشروع كله
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 4. تمرير الـ router المجهز للـ Provider */}
      <RouterProvider router={router} />
      
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
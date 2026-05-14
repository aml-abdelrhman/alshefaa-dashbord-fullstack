// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// تهيئة مكتبة الترجمة لمنع خطأ NO_I18NEXT_INSTANCE
i18n
  .use(initReactI18next)
  .init({
    resources: {},
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

const rootElement = document.getElementById("root") || document.getElementById("app");

if (!rootElement) {
  throw new Error("Failed to find the root element. Please check your index.html has a <div id='root'></div> or <div id='app'></div>");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
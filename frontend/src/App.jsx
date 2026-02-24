import React from "react";
import { Routes, Route } from "react-router-dom";

import RoleSelectorApp from "./RoleSelectorApp";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import { AdminProvider } from "./context/AdminContext";
import SettingsPage from "./components/SettingsPage";
import "./App.css";
export default function App() {
  return (
    <AdminProvider>
      <Routes>
        <Route path="/" element={<RoleSelectorApp />} />
        <Route path="/senior" element={<Dashboard seniorId={2} />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminDashboard seniorId={2} />} />
      </Routes>
    </AdminProvider>
  );
}

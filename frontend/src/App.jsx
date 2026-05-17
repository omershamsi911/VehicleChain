// src/App.jsx
import React, { useState } from "react";
import { Web3Provider } from "./utils/Web3Context";
import { ThemeProvider } from "./utils/ThemeContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import VehicleDetails from "./pages/VehicleDetails";
import RegisterVehicle from "./pages/RegisterVehicle";
import TransferPage from "./pages/TransferPage";
import TheftPage from "./pages/TheftPage";
import HistoryPage from "./pages/HistoryPage";
import DAOPage from "./pages/DAOPage";
import TokenPage from "./pages/TokenPage";
import { AboutPage } from "./pages/AboutPage";
import { HelpPage } from "./pages/HelpPage";
import AdminPage from "./pages/AdminPage"
import "./App.css";

export default function App() {
  const [page,     setPage]     = useState("dashboard");
  const [vinFocus, setVinFocus] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigate = (p, vin = null) => {
    setPage(p);
    if (vin) setVinFocus(vin);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard       navigate={navigate} />;
      case "vehicle":   return <VehicleDetails  vin={vinFocus} navigate={navigate} />;
      case "register":  return <RegisterVehicle navigate={navigate} />;
      case "transfer":  return <TransferPage    navigate={navigate} />;
      case "theft":     return <TheftPage       navigate={navigate} />;
      case "history":   return <HistoryPage     navigate={navigate} />;
      case "dao":       return <DAOPage         navigate={navigate} />;
      case "token":     return <TokenPage       navigate={navigate} />;
      case "about":     return <AboutPage       navigate={navigate} />;
      case "help":      return <HelpPage        navigate={navigate} />;
      case "admin":      return <AdminPage        navigate={navigate} />;
      default:          return <Dashboard       navigate={navigate} />;
    }
  };

  return (
    <ThemeProvider>
      <Web3Provider>
        <div className="app-root">
          <Navbar
            navigate={navigate}
            currentPage={page}
            onToggleSidebar={() => setSidebarCollapsed(c => !c)}
            sidebarCollapsed={sidebarCollapsed}
          />
          <div className="app-body">
            <Sidebar
              navigate={navigate}
              currentPage={page}
              collapsed={sidebarCollapsed}
            />
            <main className="app-main">
              {renderPage()}
            </main>
          </div>
          <Footer navigate={navigate} />
        </div>
      </Web3Provider>
    </ThemeProvider>
  );
}
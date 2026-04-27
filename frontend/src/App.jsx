// src/App.jsx
import React, { useState } from "react";
import { Web3Provider } from "./utils/Web3Context";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import VehicleDetails from "./pages/VehicleDetails";
import RegisterVehicle from "./pages/RegisterVehicle";
import TransferPage from "./pages/TransferPage";
import TheftPage from "./pages/TheftPage";
import HistoryPage from "./pages/HistoryPage";
import DAOPage from "./pages/DAOPage";
import TokenPage from "./pages/TokenPage";
import "./App.css";

export default function App() {
  const [page,    setPage]    = useState("dashboard");
  const [vinFocus, setVinFocus] = useState(null); // for deep-linking to vehicle details

  const navigate = (p, vin = null) => {
    setPage(p);
    if (vin) setVinFocus(vin);
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":  return <Dashboard navigate={navigate} />;
      case "vehicle":    return <VehicleDetails vin={vinFocus} navigate={navigate} />;
      case "register":   return <RegisterVehicle navigate={navigate} />;
      case "transfer":   return <TransferPage navigate={navigate} />;
      case "theft":      return <TheftPage navigate={navigate} />;
      case "history":    return <HistoryPage navigate={navigate} />;
      case "dao":        return <DAOPage navigate={navigate} />;
      case "token":      return <TokenPage navigate={navigate} />;
      default:           return <Dashboard navigate={navigate} />;
    }
  };

  return (
    <Web3Provider>
      <div className="app-root">
        <Navbar navigate={navigate} currentPage={page} />
        <main className="app-main">
          {renderPage()}
        </main>
      </div>
    </Web3Provider>
  );
}

import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";
import LandingPage from "./components/LandingPage";
import GameBoard from "./components/GameBoard";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/game" element={<GameBoard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

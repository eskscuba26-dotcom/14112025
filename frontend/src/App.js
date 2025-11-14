import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShipmentPage from "./pages/ShipmentPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ShipmentPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

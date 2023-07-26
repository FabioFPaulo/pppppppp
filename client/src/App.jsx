import { Route, Routes } from "react-router-dom";
import ClientScreen from "./screens/ClientScreen";
import AdminScreen from "./screens/AdminScreen";
import { io } from "socket.io-client";
import { useRef } from "react";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<></>} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/client" element={<ClientScreen />} />
      </Routes>
    </div>
  );
}

export default App;

import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast"; 
import Login from "./Pages/Login";
import Sidebar from "./Pages/SideBar";
import Users from "./Pages/Users";
import Events from "./Pages/Events";
import Presence from "./Pages/PresenceAndAbsence";
import Documents from "./Pages/Documents";
import Cellules from "./Pages/Cellules";
import Announcement from "./Pages/Announecement";
import Dashboard from "./Pages/Statistique";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={true} />
      <Routes>
        {/* Route Home */}
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Sidebar />}>
          <Route path="users" element={<Users />} />
          <Route path="events" element={<Events />} />
          <Route path="Presence&absence" element={<Presence />} />
          <Route path="documents" element={<Documents />} />
          <Route path="cellules" element={< Cellules/>} />
          <Route path="announce" element={< Announcement/>} />
                    <Route path="dashboard" element={< Dashboard/>} />

        
        
        </Route>
      </Routes>
    </>
  );
}

export default App;

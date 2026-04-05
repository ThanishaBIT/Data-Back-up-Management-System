import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminFiles from "./pages/AdminFiles";

function App() {

  return(

    <Router>

      <Routes>

        <Route path="/" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>

        {/* ADMIN ROUTES */}

        <Route path="/admin" element={<AdminLayout/>}>

          {/* ⭐ Default admin page */}
          <Route index element={<Navigate to="dashboard" />} />

          <Route path="dashboard" element={<AdminDashboard/>}/>
          <Route path="users" element={<AdminUsers/>}/>
          <Route path="files" element={<AdminFiles/>}/>

        </Route>

      </Routes>

    </Router>

  );

}

export default App;
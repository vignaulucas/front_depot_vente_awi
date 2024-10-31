import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './screens/Register';
import SignIn from './screens/SignIn';
import UserList from "./screens/listUser";
import AdminList from "./screens/listAdmin";
import ManagerRequestList from "./screens/managerRequestList";
import './App.css';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/listeUtilisateur" element={<UserList />} />
        <Route path="/listeGestionnairesAdmins" element={<AdminList />} />
        <Route path="/listeDemandesGestionnaires" element={<ManagerRequestList />} />
        {/*<Route path="/home" element={<Home />} />*/}
        {/* Ajoutez d'autres routes si nécessaire */}
      </Routes>
    </Router>
  );
}

export default App;

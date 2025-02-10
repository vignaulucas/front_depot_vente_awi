import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './screens/Register';
import SignIn from './screens/SignIn';
import UserList from "./screens/listUser";
import AdminList from "./screens/listAdmin";
import ManagerRequestList from "./screens/managerRequestList";
import './App.css';
import SaleSessionList from "./screens/saleSessionList";
import GameDeposit from "./screens/gameDeposit";
import UploadCsv from "./screens/uploadCsv";
import GameList from "./screens/gameList";
import HomePage from "./screens/home";
import Wishlist from "./screens/wishlist";
import GamePurchase from "./screens/buyGame";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/listeUtilisateur" element={<UserList />} />
        <Route path="/listeGestionnairesAdmins" element={<AdminList />} />
        <Route path="/listeDemandesGestionnaires" element={<ManagerRequestList />} />
        <Route path="/listeSessionsVente" element={<SaleSessionList />} />
        <Route path="/depotVente" element={<GameDeposit />} />
        <Route path="/uploadCsv" element={<UploadCsv />} />
        <Route path="/listeJeuxDepot" element={<GameList />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/purchase" element={<GamePurchase />} />
        {/*<Route path="/home" element={<Home />} />*/}
        {/* Ajoutez d'autres routes si nécessaire */}
      </Routes>
    </Router>
  );
}

export default App;

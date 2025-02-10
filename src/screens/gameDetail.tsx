import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Box, Typography, CircularProgress } from "@mui/material";
import Navbar from "../component/navbar";

const theme = createTheme({
  palette: {
    primary: { main: "#1e3a8a" },
    secondary: { main: "#e53935" },
  },
});

interface CsvGame {
  id: number;
  idJeu: string;
  nameGame: string;
  author: string;
  editor: string;
  nbPlayers: string;
  minAge: string;
  duration: string;
  type: string;
  notice: string;
  mechanisms: string;
  themes: string;
  tags: string;
  description: string;
  image: string;
  logo: string;
  video: string;
}

const GameDetail: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>(); // Correction ici
  const apiUrl = process.env.REACT_APP_API_URL;
  const [game, setGame] = useState<CsvGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setError("ID du jeu introuvable.");
      setLoading(false);
      return;
    }

    // Premier appel pour récupérer les infos du jeu (nom)
    fetch(`${apiUrl}/depot/games/${gameId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Jeu non trouvé.");
        }
        return response.json();
      })
      .then((gameData) => {
        if (!gameData || !gameData.name) {
          throw new Error("Nom du jeu introuvable.");
        }
        const gameName = gameData.name; // Stocke la valeur
        console.log("Nom du jeu (avant encodage):", gameName);
        
        const encodedGameName = encodeURIComponent(gameName);
        console.log("Nom encodé:", encodedGameName);
                // Deuxième appel API pour récupérer les détails à partir du CSV
        return fetch(`${apiUrl}/csv/game/${encodeURIComponent(gameData.name)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Jeu non trouvé dans la base de données.");
        }
        return response.json();
      })
      .then((csvGameData) => {
        setGame(csvGameData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [gameId, apiUrl]);

  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <div
        style={{
          backgroundImage: 'url("/BlueWall (1).jpeg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          paddingTop: "80px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "800px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            boxSizing: "border-box",
            overflowY: "auto",
            maxHeight: "90vh",
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center">
              {error}
            </Typography>
          ) : game ? (
            <>
              <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
                {game.nameGame}
              </Typography>

              {game.image && (
                <Box display="flex" justifyContent="center" mb={2}>
                  <img
                    src={game.image}
                    alt={game.nameGame}
                    style={{ width: "100%", maxHeight: "300px", borderRadius: "10px" }}
                  />
                </Box>
              )}

              <Typography variant="h6" fontWeight="bold">Auteur:</Typography>
              <Typography variant="body1" mb={1}>{game.author || "Non renseigné"}</Typography>

              <Typography variant="h6" fontWeight="bold">Éditeur:</Typography>
              <Typography variant="body1" mb={1}>{game.editor || "Non renseigné"}</Typography>

              <Typography variant="h6" fontWeight="bold">Nombre de joueurs:</Typography>
              <Typography variant="body1" mb={1}>{game.nbPlayers || "Non renseigné"}</Typography>

              <Typography variant="h6" fontWeight="bold">Âge minimum:</Typography>
              <Typography variant="body1" mb={1}>{game.minAge || "Non renseigné"} ans</Typography>

              <Typography variant="h6" fontWeight="bold">Durée:</Typography>
              <Typography variant="body1" mb={1}>{game.duration || "Non renseigné"} minutes</Typography>

              <Typography variant="h6" fontWeight="bold">Type:</Typography>
              <Typography variant="body1" mb={1}>{game.type || "Non renseigné"}</Typography>

              <Typography variant="h6" fontWeight="bold">Mécanismes:</Typography>
              <Typography variant="body1" mb={1}>{game.mechanisms || "Non renseigné"}</Typography>

              <Typography variant="h6" fontWeight="bold">Thèmes:</Typography>
              <Typography variant="body1" mb={1}>{game.themes || "Non renseigné"}</Typography>

              <Typography variant="h6" fontWeight="bold">Tags:</Typography>
              <Typography variant="body1" mb={1}>{game.tags || "Non renseigné"}</Typography>

              <Typography variant="h6" fontWeight="bold">Description:</Typography>
              <Typography variant="body1" mb={1}>{game.description || "Non renseigné"}</Typography>

              {game.video && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <iframe
                    width="100%"
                    height="315"
                    src={game.video}
                    title="Vidéo du jeu"
                    allowFullScreen
                    style={{ borderRadius: "10px" }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Typography align="center">Aucune information disponible.</Typography>
          )}
        </Box>
      </div>
    </ThemeProvider>
  );
};

export default GameDetail;

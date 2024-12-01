import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

function Navbar({ isGameActive }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = React.useState(false);

  const handleAboutClick = () => {
    if (isGameActive) {
      setConfirmDialog(true);
    } else {
      navigate("/about");
    }
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {user ? `Welcome, ${user.username}!` : "Please log in"}
          </Typography>
          <Button
            color="inherit"
            onClick={handleAboutClick}
            sx={{ mr: 1.3, fontSize: 17, fontWeight: 550 }}
          >
            About
          </Button>
          {user && (
            <Button
              color="inherit"
              onClick={logout}
              sx={{ fontSize: 17, fontWeight: 550 }}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Leave Current Game?</DialogTitle>
        <DialogContent>
          Going to the About page will interrupt your current game. Do you want
          to continue?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Stay in Game</Button>
          <Button
            onClick={() => {
              setConfirmDialog(false);
              navigate("/about");
            }}
            color="primary"
          >
            Leave Game
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default Navbar;

import React from "react";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Container,
  Paper,
  List,
  ListItem,
  Button,
} from "@mui/material";
import { GitHub, LinkedIn, Person } from "@mui/icons-material";

function About() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          onClick={() => (window.location.href = "/")}
          sx={{
            mb: 2,
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          Back To Home
        </Button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
            borderRadius: "16px",
          }}
        >
          <motion.div
            variants={itemVariants}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Typography
              variant="h2"
              gutterBottom
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(90deg, #2196F3, #21CBF3, #6EC6FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "blue-gradient-shift 4s infinite linear",
                textShadow: "0px 4px 8px rgba(33, 150, 243, 0.6)",
                "@keyframes blue-gradient-shift": {
                  "0%": { backgroundPosition: "0% 50%" },
                  "50%": { backgroundPosition: "100% 50%" },
                  "100%": { backgroundPosition: "0% 50%" },
                },
                textAlign: "center",
              }}
            >
              TicTacTyler
            </Typography>
          </motion.div>

          {/* Features Section */}
          <motion.div variants={itemVariants}>
            <Box sx={{ my: 6 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Features
              </Typography>
              <Paper elevation={2} sx={{ p: 3, borderRadius: "12px" }}>
                <List>
                  {[
                    "Online multiplayer with real-time gameplay",
                    "Four AI difficulty levels: Easy, Medium, Hard, and Impossible (PLEASE LET ME KNOW IF YOU BEAT THE IMPOSSIBLE BOT)",
                    "Local multiplayer for face-to-face games",
                    "Player statistics tracking",
                    "Secure account system",
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ListItem sx={{ py: 1 }}>• {feature}</ListItem>
                    </motion.div>
                  ))}
                </List>
              </Paper>
            </Box>
          </motion.div>
          {/* Developer Section */}
          <motion.div variants={itemVariants}>
            <Box sx={{ my: 6 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                About Me
              </Typography>
              <Paper elevation={2} sx={{ p: 3, borderRadius: "12px" }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <img
                    src="/tyler-photo.jpg"
                    alt="Tyler Collo"
                    style={{
                      width: "2100px",
                      height: "430px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "4px solid #2196F3",
                      backgroundColor: "#2196F3",
                    }}
                  />
                  <Box>
                    <Typography
                      variant="body1"
                      paragraph
                      sx={{ fontFamily: "sans" }}
                    >
                      Hello! My name is Tyler and I'm currently a student
                      studying computer science at George Washington University.
                      TicTacTyler was my first full-stack project (and my first
                      personal project in general) that I followed through to
                      completion. If you'd like to learn more about me or my
                      other projects, feel free to check out my personal website
                      (that doesn't exist yet). My GitHub and LinkedIn profiles
                      are also linked below if you wanna get in touch!
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Person />}
                      href="https://www.tylercollo.com/"
                      target="_blank"
                      sx={{
                        mt: 2,
                        backgroundColor: "#0077B5",
                        color: "white",
                      }}
                    >
                      Personal Website
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<GitHub />}
                      href="https://github.com/tylerc122/ReactTicTac"
                      target="_blank"
                      sx={{
                        mt: 2,
                        ml: 2,
                        backgroundColor: "black",
                        color: "white",
                      }}
                    >
                      Github
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<LinkedIn />}
                      href="https://www.linkedin.com/in/tyler-collo-345679276/"
                      target="_blank"
                      sx={{
                        mt: 2,
                        ml: 2,
                        backgroundColor: "#0077B5",
                        color: "white",
                      }}
                    >
                      LinkedIn
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </motion.div>
          {/* Tech Stack Section */}
          <motion.div variants={itemVariants}>
            <Box sx={{ my: 6 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Tech Stack
              </Typography>
              <Box sx={{ display: "flex", gap: 4 }}>
                <Paper
                  elevation={2}
                  sx={{ p: 3, borderRadius: "12px", flex: 1 }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ color: "primary.main" }}
                  >
                    Frontend
                  </Typography>
                  <List>
                    <ListItem>• React.js</ListItem>
                    <ListItem>• Material-UI</ListItem>
                    <ListItem>• Socket.IO client</ListItem>
                  </List>
                </Paper>
                <Paper
                  elevation={2}
                  sx={{ p: 3, borderRadius: "12px", flex: 1 }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ color: "primary.main" }}
                  >
                    Backend
                  </Typography>
                  <List>
                    <ListItem>• Node.js w/ Express</ListItem>
                    <ListItem>• MongoDB</ListItem>
                    <ListItem>• Socket.IO</ListItem>
                    <ListItem>• JWT Authentication</ListItem>
                    <ListItem>• Nginx</ListItem>
                    <ListItem>• PM2</ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>
          </motion.div>
          {/* Future Plans Section */}
          <motion.div variants={itemVariants}>
            <Box sx={{ my: 6 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Future Plans
              </Typography>
              <Paper elevation={2} sx={{ p: 3, borderRadius: "12px" }}>
                <List>
                  {[
                    "Enhanced player profiles",
                    "Global leaderboard",
                    "Animations and sound effects",
                  ].map((plan, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ListItem sx={{ py: 1 }}>• {plan}</ListItem>
                    </motion.div>
                  ))}
                </List>
              </Paper>
            </Box>
          </motion.div>
        </Paper>
      </motion.div>
    </Container>
  );
}

export default About;

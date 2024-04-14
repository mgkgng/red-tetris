import express from "express";
import cors from "cors";
import http from "http";
import { initSocketServer } from "./socket.js";
import apiRoutes from "./routes/api.js"; // Import your API routes

const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Use your routes
app.use("/api", apiRoutes); // This mounts your API routes under the /api prefix

initSocketServer(server);

server.listen(3000, () => {
  console.log(`Red-tetris server initialized on port ${PORT}...`);
});

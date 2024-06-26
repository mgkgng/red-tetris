import express from "express";
import cors from "cors";
import http from "http";
import { initSocketServer } from "./socket.js";
import apiRoutes from "./routes/api.js";

const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

initSocketServer(server);

server.listen(3000, () => {
  console.log(`Red-tetris server initialized on port ${PORT}...`);
});

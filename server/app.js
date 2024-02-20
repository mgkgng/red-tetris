import express from 'express';
import http from 'http';
import { initSocketServer } from './socket.js';

const PORT = 3000;

const app = express();
const server = http.createServer(app);

initSocketServer(server);

server.listen(3000, () => {
    console.log(`Server listening on port ${PORT}...`);
});

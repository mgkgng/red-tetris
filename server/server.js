import express from 'express';
import http from 'http';
import { setupSocket } from './socketConfig.js';

const app = express();
const server = http.createServer(app);

setupSocket(server);

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

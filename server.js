import express from 'express';
import { Server } from 'socket.io';
import { handler } from './build/handler.js'; // SvelteKit build output
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// WebSocket logic
io.on('connection', (socket) => {
	console.log('Socket connected:', socket.id);

	socket.emit('eventFromServer', 'Hello from the server! 👋');

	socket.on('message', (msg) => {
		console.log('Received:', msg);
		socket.broadcast.emit('eventFromServer', msg); // broadcast to others
	});
});

// Serve static built SvelteKit site
app.use(handler);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});

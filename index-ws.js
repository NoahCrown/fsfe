const express = require("express");
const server = require("http").createServer();
const app = express();

app.get("/", (req, res) => {
	res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);
server.listen(3000, () => {
	console.log("Server is listening on port 3000");
});

/** Begin Websocket */
const WebsocketServer = require("ws").Server;

const wss = new WebsocketServer({ server });

wss.on("connection", (ws) => {
	const numClients = wss.clients.size;
	console.log(`New client connected. Total clients: ${numClients}`);

	wss.broadcast("Current visitors: " + numClients);

	if (ws.readyState === ws.OPEN) {
		ws.send("Welcome to the WebSocket server!");
	}

	ws.on("close", () => {
		const numClients = wss.clients.size;
		console.log(`Client disconnected. Total clients: ${numClients}`);
		wss.broadcast("Current visitors: " + numClients);
	});
});

wss.broadcast = function broadcast(data) {
	wss.clients.forEach((client) => {
		if (client.readyState === client.OPEN) {
			client.send(data);
		}
	});
};

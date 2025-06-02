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

process.on("SIGINT", () => {
	console.log("Received SIGINT. Shutting down gracefully...");
	shutdownDb();
	server.close(() => {
		console.log("HTTP server closed.");
		process.exit(0);
	});
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

	db.run("INSERT INTO visitors (count, time) VALUES (?, ?)", [
		numClients,
		new Date().toISOString(),
	]);

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

/** End Websocket */

/** Begin Database */
const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");

db.serialize(() => {
	db.run(`
        CREATE TABLE visitors (
            count INTEGER, 
            time TEXT
        )    
        
    `);
});

function getCounts() {
	db.each("SELECT * FROM visitors", (err, row) => {
		console.log(`Count: ${row.count}, Time: ${row.time}`);
	});
}

function shutdownDb() {
	getCounts();
	console.log("Shutting down database connection...");
	db.close((err) => {});
}

const http = require('http');

http.createServer((req, res) => {
res.write("On the way to being a fullstack engineer!");
res.end();
}).listen(3000)

console.log("Server is running in port 3000")



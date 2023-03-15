const http = require('http');
const url = require('url');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);

    if(parsedUrl.pathname === "/rest/channel/_sum/.*") {
        res.writeHead(200, {'Content-Type': 'application/json'});
        let data = fs.readFileSync('fenecon.json');
        res.end(data);
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(3000);
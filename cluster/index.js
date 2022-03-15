// health check

// execute I/O bound in this api. Example read a file

// execute CPU bound in this api. Example run sort large data.
// (Using cluster, child process or worker in the second app).

const http = require('http');
const fs = require('fs');
const cluster = require('cluster');

const hostname = '127.0.0.1';
const port = 3000;
const numCPUs = 20

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

if (cluster.isMaster) {

    console.log('Master cluster setting up ' + numCPUs + ' workers...');

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        // console.log('Starting a new worker');
        // cluster.fork();
    });
    
} else {
    const server = http.createServer(async (req, res) => {
        if (req.url === "/heath-check" && req.method === "GET") {
            try {
                // Read file
                const results = JSON.parse(fs.readFileSync('./MOCK_DATA.json'))
                let arr = []
                for (let i = 0; i < 1000000; i++) {
                    const index = getRandomInt(0, 1000)
                    arr.push(results[index])
                }
                res.end(JSON.stringify(arr))
            } catch (error) {
                throw new Error(error)
            }
        } else if (req.url === "/crash" && req.method === "GET") {
            process.exit()
        } else if (req.url === "/time" && req.method === "GET") {
            try {
                res.end(JSON.stringify(new Date()))
            } catch (error) {
                throw new Error(error)
            }
        }
    
        // No route
        else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Route not found" }));
        }
    });
    
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}
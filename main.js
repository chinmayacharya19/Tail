const WebSocket = require("ws")
const fs = require("fs")
const Tail = require("./tail")
const { uuid } = require("uuidv4")
let http = require("http")

const wss = new WebSocket.Server({ port: 8081 })

let connections = []

wss.on("connection", function connection(ws) {
    ws.id = uuid()
    connections.push({ ws, totalLines: 0, fileName: "", lastPosition: 0 })
    ws.on("message", function incoming(message) {
        let messages = message.split(" ")
        if (messages[0] === "INIT") {
            let index = -1
            for (let con in connections) {
                if (connections[con].ws.id === ws.id) {
                    index = con
                    connections[con].fileName = messages[1]
                    connections[con].totalLines = messages[2] ? +messages[2] : 10
                }
            }
            if (index !== -1) {
                let getLastPosition = Tail.getFileStartPointBackwards(connections[index].fileName, connections[index].totalLines)
                connections[index].lastPosition = getLastPosition.position
                Tail.readAndSend(connections[index])
                Tail.watchFile(connections[index])
            }
        }
    })

    ws.on("close", () => {
        let i = 0
        for (let con in connections) {
            if (connections[con].ws.id === ws.id) {
                i = con
            }
        }
        connections.splice(i, 1)
        console.log("Closed")
    })
})


http.createServer(function (req, res) {
    fs.readFile(__dirname + req.url, function (err, data) {
        if (err) {
            res.writeHead(404)
            res.end(JSON.stringify(err))
            return
        }
        res.writeHead(200)
        res.end(data)
    })
}).listen(8080)



const WebSocket = require("ws")
const fs = require("fs")
const Tail = require("./tail")
const { uuid } = require("uuidv4")
const http = require("http")

const wss = new WebSocket.Server({ port: 8081 })

const connections = {}

wss.on("connection", function connection(ws) {
    ws.id = uuid()
    connections[ws.id] = { ws, totalLines: 0, fileName: "", lastPosition: 0 }
    ws.on("message", async function incoming(message) {
        const messages = message.split(" ")
        if (messages[0] === "INIT") {
            if (connections[ws.id]) {
                connections[ws.id].fileName = messages[1]
                connections[ws.id].totalLines = messages[2] ? +messages[2] : 10
                const size = await Tail.readAndSendFirstNLines(connections[ws.id])
                connections[ws.id].lastPosition = size
                const ret = await Tail.readAndSend(connections[ws.id])
                if (ret) {
                    Tail.watchFile(connections[ws.id])
                }
            }
        }
    })

    ws.on("close", () => {
        if (connections[ws.id]) {
            delete connections[ws.id]
        }
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



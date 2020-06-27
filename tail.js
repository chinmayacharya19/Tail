const fs = require("fs")

function getFileStartPointBackwards(filename, linesToRead) {
    let file = fs.openSync(filename)
    let size = fs.fstatSync(file).size
    if (size === 0) {
        return { position: 0, lineEnd: "" }
    }
    let chunkSize = Math.min(1024 * 1024, size)
    let buffer = Buffer.alloc ? Buffer.alloc(chunkSize) : new Buffer(chunkSize)
    let oldPosition = size
    let totalLineEnds = []
    let lineEnd = "CRLF"
    let linesRead = linesToRead
    while (oldPosition > 0) {
        let position = Math.max(0, oldPosition - chunkSize)
        fs.readSync(file, buffer, 0, chunkSize, position)
        oldPosition = position
        let lineEndIndexes = buffer.toString("utf-8").split("\n")
        //Reversing an array
        totalLineEnds = lineEndIndexes.concat(totalLineEnds)
        linesRead -= totalLineEnds.length
        if (linesRead <= 0) {
            for (let i = 0; i < Math.abs(linesRead); i++) {
                oldPosition += Buffer.from(totalLineEnds[i]).length + 1
            }
            break
        }
    }
    fs.closeSync(file)
    return { position: oldPosition, lineEnd: lineEnd, linesRead }
}

function readFile(fd, position, chunkSize) {
    let buffer = Buffer.alloc ? Buffer.alloc(chunkSize) : new Buffer(chunkSize)
    fs.readSync(fd, buffer, 0, chunkSize, position)
    return buffer
}

function readAndSend(connection) {
    let file = fs.openSync(connection.fileName)
    let size = fs.fstatSync(file).size
    let from = connection.lastPosition
    let chunkSize = Math.min(1024 * 1024, Math.max(size - from, 0))
    let totalDataToSend = size - from
    while (size && totalDataToSend > 0) {
        let data = readFile(file, from, chunkSize)
        totalDataToSend -= chunkSize
        connection.ws.send(data.toString("utf-8"))
    }
    if (size != 0) {
        connection.lastPosition = size
    }
    fs.closeSync(file)
}

function watchFile(connection) {
    fs.watch(connection.fileName, (event) => {
        if (event === "change") {
            readAndSend(connection)
        }
    })
}

module.exports = { getFileStartPointBackwards, watchFile, readAndSend }
const { promises: fsPromisified } = require("fs")
const fs = require("fs")

const OS_SAVE_TIME = 500

async function readAndSendFirstNLines(connection) {
    let file
    try {
        file = await fsPromisified.open(connection.fileName)
    }
    catch (err) {
        return 0
    }
    const stat = await file.stat()
    const size = stat.size
    if (size === 0) {
        return 0
    }
    const chunkSize = Math.min(200 * 10, size)
    const buffer = Buffer.alloc ? Buffer.alloc(chunkSize) : new Buffer(chunkSize)
    let oldPosition = size
    let totalLineEnds = []
    let linesRead = connection.totalLines
    let linesToSend = []
    while (oldPosition > 0) {
        const position = Math.max(0, oldPosition - chunkSize)
        await file.read(buffer, 0, chunkSize, position)
        oldPosition = position
        const singleline = buffer.toString("utf-8")
        const lines = singleline.split("\n")
        oldPosition += Buffer.from(lines[0]).length 
        lines.shift()
        linesToSend = lines.concat(linesToSend)
        totalLineEnds = lines.concat(totalLineEnds)
        linesRead -= lines.length
        if (linesToSend.length > connection.totalLines) {
            linesToSend = linesToSend.splice(linesToSend.length - connection.totalLines, connection.totalLines)
            break
        }
        if (linesRead <= 0) {
            for (let i = 0; i < Math.abs(linesRead); i++) {
                oldPosition += Buffer.from(totalLineEnds[i]).length + 1
            }
            break
        }
    }
    await file.close()
    connection.ws.send(linesToSend.join("\n"))
    return size
}


async function readFile(file, position, chunkSize) {
    const buffer = Buffer.alloc ? Buffer.alloc(chunkSize) : new Buffer(chunkSize)
    await file.read(buffer, 0, chunkSize, position)
    return buffer
}


async function readAndSend(connection) {
    let file
    try {
        file = await fsPromisified.open(connection.fileName)
    }
    catch (err) {
        if (err.code === "ENOENT") {
            connection.ws.send(connection.fileName + " File not found")
            return false
        }
        connection.ws.send("Something is not wrong, check backend console")
        console.log(err)
        return false
    }
    const stat = await fs.fstatSync(file.fd)
    const size = stat.size
    const from = connection.lastPosition
    const chunkSize = Math.min(200 * 10, Math.max(size - from, 0))
    let totalDataToSend = size - from
    while (size && totalDataToSend > 0) {
        const data = await readFile(file, from, chunkSize)
        totalDataToSend -= chunkSize
        connection.ws.send(data.toString("utf-8"))
    }
    if (size != 0) {
        connection.lastPosition = size
    }
    await file.close()
    return true
}

function watchFile(connection) {
    var lock = false
    fs.watch(connection.fileName, async (event) => {
        if (event === "change") {
            if (!lock) {
                lock = true
                setTimeout(async () => {
                    lock = false
                    await readAndSend(connection)
                }, OS_SAVE_TIME)
            }
        }
    })
}

module.exports = { watchFile, readAndSend, readAndSendFirstNLines }
const assert = require("assert")
const Tail = require("../tail")
describe("no data file", async function () {
    it("should return no data when asked for 3 lines", async function () {
        const connection = {}
        connection.ws = {}
        connection.ws.send = (data) => { assert.equal(data.length, 0) }
        connection.fileName = "test/nodata.txt"
        connection.lastPosition = 0
        await Tail.readAndSend(connection)
    })
    it("should be 0 in empty file", async function () {
        const filename = "test/nodata.txt"
        const linesToRead = 0
        const read = Tail.getFileStartPointBackwards(filename, linesToRead)
        assert.equal(read.position, 0)
    })
})
describe("data file", async function () {
    it("should return exactly 7 bytes", async function () {
        const connection = {}
        connection.ws = {}
        connection.ws.send = (data) => { assert.equal(data.length, 7) }
        connection.fileName = "test/three.txt"
        connection.lastPosition = 0
        await Tail.readAndSend(connection)
    })
})


describe("starting point calculating tests", async function () {
    it("Send all rows", async function () {
        const connection = {}
        connection.ws = {}
        connection.fileName = "test/fifty.txt"
        connection.ws.send = (data) => { assert.equal(data.length, 219) }
        await Tail.readAndSendFirstNLines(connection)
    })
    it("should calculate 10 rows", async function () {
        const connection = {}
        connection.ws = {}
        connection.fileName = "test/fifty.txt"
        connection.totalLines = 10
        connection.ws.send = (data) => { assert.equal(data.length, 38) }
        await Tail.readAndSendFirstNLines(connection)
    })
    it("should calculate 0 rows", async function () {
        const connection = {}
        connection.ws = {}
        connection.fileName = "test/fifty.txt"
        connection.totalLines = 0
        connection.ws.send = (data) => { assert.equal(data.length, 0) }
        await Tail.readAndSendFirstNLines(connection)
    })

})


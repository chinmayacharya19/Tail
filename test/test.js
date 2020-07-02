var assert = require("assert")
let Tail = require("../tail")
describe("no data file", async function () {
    it("should return no data when asked for 3 lines", async function () {
        let connection = {}
        connection.ws = {}
        connection.ws.send = (data) => { assert.equal(data.length, 0) }
        connection.fileName = "test/nodata.txt"
        connection.lastPosition = 0
        await Tail.readAndSend(connection)
    })
    it("should be 0 in empty file", async function () {
        let filename = "test/nodata.txt"
        let linesToRead = 0
        let read = Tail.getFileStartPointBackwards(filename, linesToRead)
        assert.equal(read.position, 0)
    })
})
describe("data file", async function () {
    it("should return exactly 7 bytes", async function () {
        let connection = {}
        connection.ws = {}
        connection.ws.send = (data) => { assert.equal(data.length, 7) }
        connection.fileName = "test/three.txt"
        connection.lastPosition = 0
        await Tail.readAndSend(connection)
    })
})


describe("starting point calculating tests", async function () {
    it("Send all rows", async function () {
        let connection = {}
        connection.ws = {}
        connection.fileName = "test/fifty.txt"
        connection.ws.send = (data) => { assert.equal(data.length, 219) }
        let read = await Tail.readAndSendFirstNLines(connection)
    })
    it("should calculate 10 rows", async function () {
        let connection = {}
        connection.ws = {}
        connection.fileName = "test/fifty.txt"
        connection.linesToRead = 10
        connection.ws.send = (data) => { assert.equal(data.length, 38) }
        let read = await Tail.readAndSendFirstNLines(connection)
    })
    it("should calculate 0 rows", async function () {
        let connection = {}
        connection.ws = {}
        connection.fileName = "test/fifty.txt"
        connection.linesToRead = 0
        connection.ws.send = (data) => { assert.equal(data.length, 0) }
        let read = await Tail.readAndSendFirstNLines(connection)
    })

})


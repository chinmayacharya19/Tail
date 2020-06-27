var assert = require("assert")
let Tail = require("../tail")
describe("no data file", function () {
    it("should return no data when asked for 3 lines", function () {
        let connection = {}
        connection.ws = {}
        connection.ws.send = (data) => { assert.equal(data.length, 0) }
        connection.fileName = "test/nodata.txt"
        connection.lastPosition = 0
        Tail.readAndSend(connection)
    })
    it("should be 0 in empty file", function () {
        let filename = "test/nodata.txt"
        let linesToRead = 0
        let read = Tail.getFileStartPointBackwards(filename, linesToRead)
        assert.equal(read.position, 0)
    })
})
describe("data file", function () {
    it("should return exactly 7 bytes", function () {
        let connection = {}
        connection.ws = {}
        connection.ws.send = (data) => { assert.equal(data.length, 7) }
        connection.fileName = "test/three.txt"
        connection.lastPosition = 0
        Tail.readAndSend(connection)
    })
})


describe("starting point calculating tests", function () {
    it("should calculate 5 rows", function () {
        let filename = "test/fifty.txt"
        let linesToRead = 5
        let read = Tail.getFileStartPointBackwards(filename, linesToRead)
        assert.equal(Math.abs(read.linesRead)+linesToRead, 50)
    })
    it("should calculate 10 rows", function () {
        let filename = "test/fifty.txt"
        let linesToRead = 10
        let read = Tail.getFileStartPointBackwards(filename, linesToRead)
        assert.equal(Math.abs(read.linesRead)+linesToRead, 50)
    })
    it("should calculate 0 rows", function () {
        let filename = "test/fifty.txt"
        let linesToRead = 0
        let read = Tail.getFileStartPointBackwards(filename, linesToRead)
        assert.equal(Math.abs(read.linesRead)+linesToRead, 50)
    })
    
})


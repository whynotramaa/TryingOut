const { log } = require("console")
const http = require("http")
const fs = require("fs")
const express = require("express")


const myServer = http.createServer((req, res) => {
  const log = `${Date.now()}: New Request Received\n`

  fs.appendFile("log.txt", log, (err, data) => {
    res.end("HEELLOOO FROM SERVER")
  })

  console.log("New Request received", req.url)
})


myServer.listen(8000, () => console.log("Server started"))


const app = express()
app.get('/', (req, res) => {
  return res.send("Hello from expressssssssssss")
})

app.get('/about', (req, res) => {
  return res.send(`Hello ${req.query.name}`)
})

app.listen(8001, () => console.log("Express Server Started!!!"));

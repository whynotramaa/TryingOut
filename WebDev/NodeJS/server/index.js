// const { log } = require("console")
// const http = require("http")
// const fs = require("fs")
// const express = require("express")


// const myServer = http.createServer((req, res) => {
//   const log = `${Date.now()}: New Request Received\n`

//   fs.appendFile("log.txt", log, (err, data) => {
//     res.end("HEELLOOO FROM SERVER")
//   })

//   console.log("New Request received", req.url)
// })


// myServer.listen(8000, () => console.log("Server started"))


// const app = express()
// app.get('/', (req, res) => {
//   return res.send("Hello from expressssssssssss")
// })

// app.get('/about', (req, res) => {
//   return res.send(`Hello ${req.query.name}`)
// })

// app.listen(8001, () => console.log("Express Server Started!!!"));


const express = require("express")
const fs = require('fs')
const app = express()
const PORT = 8000
const users = require('./mock_data.json')

app.listen(PORT, () => console.log(`SERVER STARTED AT ${PORT}`))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/api/users', (req, res) => {
  return res.json(users)
})


app.get('/users', (req, res) => {
  const html = `
  <ul>
  ${users.map((user) => `<li> ${user.first_name} </li>`).join("")}
  </ul>
  `

  res.send(html)
})


app.post('/api/users', (req, res) => {
  const body = req.body

  users.push({ ...body, id: users.length + 1 })
  fs.writeFile('./mock_data.json', JSON.stringify(users), (err, data) => {
    return res.json({ status: "SUCCESS", id: users.length })
  })
})

// better way to do same as we were using same route multiple times
app
  .route('/api/users/:id')
  .get((req, res) => {
    const id = Number(req.params.id)
    const user = users.find((user) => user.id === id);
    return res.json(user)
  })
  .patch((req, res) => {
    const id = Number(req.params.id)
    const body = req.body

    const index = users.findIndex((user) => Number(user.id) === id)

    if (index === -1) {
      return res.json({ status: "User not found" })
    }

    users[index] = { ...users[index], ...body }

    fs.writeFile('./mock_data.json', JSON.stringify(users), (err) => {
      if (err) {
        return res.json({ status: "ERROR" })
      }

      return res.json({ status: "UPDATED" })
    })
  })
  .delete((req, res) => {
    const id = Number(req.params.id)

    const index = users.findIndex(u => u.id === id)

    if (index === -1) return res.json({ status: "Not found" })

    users.splice(index, 1)

    fs.writeFile('./mock_data.json', JSON.stringify(users), () => {
      res.json({ status: "DELETED" })
    })
  })

const fs = require("fs")

const os = require("os") // max number of threads i can have => thread pool thing

console.log(os.cpus().length)

fs.writeFileSync('./test.txt', 'hey there, video going well ')


const res = fs.readFileSync('./test.txt', "utf-8")
console.log(res)


// const res = fs.readFile('./test.txt', "utf-8")
// console.log(res)
// this gives error as it is an async and doesnt work like that

// this method doesnt return anything, this just reads so we need a callback

fs.readFile('./test.txt', 'utf-8', (err, res) => {
  if (err) {
    console.error("Error", err)
  }
  else {
    console.log(res)
  }
})

/*

same we have multiple functions:
fs.appendFileSync('./test.txt')
fs.cpSync => COPYING
fs.unlinkSync => DELETING

fs.statSync()
fs.statSync().isFile()

*/

// fs.mkdirSync('mydocs/a/b', { recursive: true })

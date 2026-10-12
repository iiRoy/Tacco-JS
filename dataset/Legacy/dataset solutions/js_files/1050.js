"use strict"

const solver = (n, as, q, ms) => {
  const patterns = []
  for (let bit = 0; bit < (1<<n); bit++) {
    let v = 0
    for (let i = 0; i < n; i++) {
      if (bit & (1 << i)) {
        v = v + as[i]
      }
    }
    if (v !== 0) {
      patterns.push(v)
    }
  }
  const result = []
  for (let i = 0; i < q; i++) {
    if (patterns.indexOf(ms[i]) !== -1) {
      result.push("yes")
    } else {
      result.push("no")
    }
  }
  return result
}

let rows = 0
let n = 0
let as = null
let q = 0
let ms = null
const reader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
})
reader.on("line", (line) => {
  rows++
  if (rows === 1) {
    n = Number(line)
  } else if (rows === 2) {
    as = line.trim().split(" ").map(a => Number(a))
  } else if (rows === 3) {
    q = Number(line)
  } else {
    ms = line.trim().split(" ").map(m => Number(m))
    const result = solver(n, as, q, ms)
    for (let i = 0; i < result.length; i++) {
      console.log(result[i])
    }
    process.exit(0)
  }
})


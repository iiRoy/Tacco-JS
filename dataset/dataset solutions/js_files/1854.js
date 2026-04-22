const input = require("fs").readFileSync("/dev/stdin", "utf8")
let cin = input.split(/ |\n/), cid = 0
const next = () => cin[cid++]
const nexts = (n) => cin.slice(cid, cid+=n).map(i=>parseInt(i))

const [A, B, H, M] = nexts(4)

const long = M * 6.0
const short = (H + M / 60) * 30.0
let angle = Math.abs(long - short)

// console.log(long, short, angle)

// console.log(long, short, angle)
const result = Math.sqrt(A**2 + B**2 - 2 * A * B * Math.cos(angle * (Math.PI / 180)))
console.log(result)

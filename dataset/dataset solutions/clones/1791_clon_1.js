const input = require("fs").readFileSync("/dev/stdin", "utf8")
let cin = input.split(/ |\n/), cid = 0
const next = () => cin[cid++]
const nexts = (n) => cin.slice(cid, cid+=n).map(i=>parseInt(i))

const [A, V, B, W, T] = nexts(5)

isSamePos = false
for (let i = 0; i < T; i++) {
    if (A + V * i == A + W * i) {
        isSamePos = true
        }
}
if (!isSamePos) return console.log('NO')
if (A + V * T >= B + W * T) {
        console.log('YES')
    } else {
        console.log('NO')
    }

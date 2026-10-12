const input = require("fs").readFileSync("/dev/stdin", "utf8")
const lines = input.split('\n')
const [N, K] = lines[0].split(' ').map(Number)

console.log(N, K)

let ans = N % K
ans = Math.min(ans, Math.abs(ans - K))
console.log(ans)
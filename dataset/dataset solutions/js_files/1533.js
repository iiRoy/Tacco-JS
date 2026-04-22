const input = require("fs").readFileSync("/dev/stdin", "utf8")

const lines = input.split('\n')
let S = lines[0].trim() - 0

const mod = 1000000007
const map = Array(S).fill().map(_ => Array(S).fill(1))

for (let i = 1; i < S; i++) {
    for (let j = 1; j < S; j++) {
        map[i][j] = (map[i - 1][j] + map[i][j - 1]) % mod
    }
}

let sum = 0
const l = Math.floor(S / 3)
for (let i = 0; i < l; i++) {
    sum += map[i][S - (i + 1) * 3]
}

console.log(sum % mod)

const input = require("fs").readFileSync("/dev/stdin", "utf8")

console.log((input[0]*100 + input[2]*10 +input[4]*1) % 4 === 0 ? 'YES' : 'NO')
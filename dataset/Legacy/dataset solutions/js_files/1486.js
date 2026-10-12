const input = require("fs").readFileSync("/dev/stdin", "utf8")
const lines = input.split('\n')
let [N, K] = lines[0].split(' ').map(Number)

let dp = Array(300001).fill(0);
for(let i = 1; i <= N; i++) {
    const A = lines[i] - 0
    const val = dp[A] + 1
    const min = Math.max(0, A - K)
    const max = A + K
    for (let j = min; j <= max; j++) {
        dp[j] = Math.max(val, dp[j])
    }
}

console.log(dp.reduce((a, b) => a > b ? a : b))

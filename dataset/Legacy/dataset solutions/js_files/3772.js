"use strict";
let input = require("fs").readFileSync("/dev/stdin", "utf8");
let dp = [];
dp[0] = 0;
for (let n = 1; n <= 100000; n ++) {
    dp[n] = Infinity;
    let power = 1;
    while (power <= n) {
        dp[n] = Math.min(dp[n], dp[n - power] + 1);
        power *= 6;
    }
    power = 1;
    while (power <= n) {
        dp[n] = Math.min(dp[n], dp[n - power] + 1);
        power *= 9;
    }
}

console.log(dp[parseInt(input)]);
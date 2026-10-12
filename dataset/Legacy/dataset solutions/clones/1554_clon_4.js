const fs = require("fs");

const MOD = 1000000007n;

const input = fs.readFileSync("/dev/stdin", "utf8").trim().split(/\s+/);
const amount = Number(input[0]);
const values = input.slice(1, amount + 1).map(BigInt);

let suffixSum = 0n;
let answer = 0n;

for (let index = amount - 1; index >= 0; index--) {
    const current = ((values[index] % MOD) + MOD) % MOD;
    answer = (answer + current * suffixSum) % MOD;
    suffixSum = (suffixSum + current) % MOD;
}

console.log(answer.toString());
const fs = require("fs");

const n = BigInt(fs.readFileSync(0, "utf8").trim());
const mod = 1000000007n;

const answer = (n * (n - 1n)) % mod;

process.stdout.write(answer.toString());
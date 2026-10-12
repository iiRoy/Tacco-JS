const fs = require("fs");

const data = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const n = data[0];
const k = data[1];

let numerator = n - 1;
numerator += k - 2;

process.stdout.write(String(numerator / (k - 1)));
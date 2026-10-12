const fs = require("fs");

const nums = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const dividend = nums[0];
const divisor = nums[1];

let quotient = dividend / divisor;
let integerPart = quotient < 0 ? Math.ceil(quotient) : Math.floor(quotient);
let remainder = dividend - integerPart * divisor;
let decimalPart = Number(quotient.toFixed(8));

process.stdout.write([integerPart, remainder, decimalPart].join(" "));
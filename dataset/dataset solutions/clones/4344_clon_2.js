function calculateProduct(value) {
  if (!Number.isInteger(value) || value < 0) {
    return null;
  }

  let accumulated = 1n;

  for (let multiplier = 2; multiplier <= value; multiplier++) {
    accumulated *= BigInt(multiplier);
  }

  return accumulated;
}

const rawValue = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim();

const value = Number(rawValue);
const answer = calculateProduct(value);

console.log(
  answer === null
    ? "INVALID"
    : answer.toString()
);
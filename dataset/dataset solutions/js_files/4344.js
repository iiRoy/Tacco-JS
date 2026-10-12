function factorial(number) {
  if (!Number.isInteger(number) || number < 0) {
    return null;
  }

  let result = 1n;

  for (let factor = 2; factor <= number; factor++) {
    result *= BigInt(factor);
  }

  return result;
}

const input = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim();

const number = Number(input);
const result = factorial(number);

console.log(
  result === null
    ? "INVALID"
    : result.toString()
);
function absolute(value) {
  return value < 0n
    ? -value
    : value;
}

function greatestCommonDivisor(first, second) {
  let current = absolute(first);
  let remainderSource = absolute(second);

  while (remainderSource !== 0n) {
    const remainder = current % remainderSource;
    current = remainderSource;
    remainderSource = remainder;
  }

  return current;
}

function parseInteger(value) {
  if (!/^-?\d+$/.test(value)) {
    return null;
  }

  return BigInt(value);
}

const input = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split(/\s+/);

const first = parseInteger(input[0] ?? "");
const second = parseInteger(input[1] ?? "");

if (first === null || second === null) {
  console.log("INVALID");
} else {
  console.log(
    greatestCommonDivisor(first, second).toString()
  );
}
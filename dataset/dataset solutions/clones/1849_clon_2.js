function positiveMagnitude(number) {
  return number < 0n
    ? -number
    : number;
}

function obtainGcd(leftNumber, rightNumber) {
  let dividend = positiveMagnitude(leftNumber);
  let divisor = positiveMagnitude(rightNumber);

  while (divisor !== 0n) {
    const residue = dividend % divisor;
    dividend = divisor;
    divisor = residue;
  }

  return dividend;
}

function convertInteger(text) {
  if (!/^-?\d+$/.test(text)) {
    return null;
  }

  return BigInt(text);
}

const values = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split(/\s+/);

const leftNumber = convertInteger(values[0] ?? "");
const rightNumber = convertInteger(values[1] ?? "");

if (leftNumber === null || rightNumber === null) {
  console.log("INVALID");
} else {
  console.log(
    obtainGcd(leftNumber, rightNumber).toString()
  );
}
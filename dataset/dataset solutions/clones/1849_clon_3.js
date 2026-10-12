function normalizePair(first, second) {
  const normalizedFirst =
    first < 0n ? -first : first;

  const normalizedSecond =
    second < 0n ? -second : second;

  return [
    normalizedFirst,
    normalizedSecond
  ];
}

function euclideanReduction(dividend, divisor) {
  if (divisor === 0n) {
    return dividend;
  }

  const nextDividend = divisor;
  const nextDivisor = dividend % divisor;

  return euclideanReduction(
    nextDividend,
    nextDivisor
  );
}

function calculateGcd(first, second) {
  const normalized = normalizePair(
    first,
    second
  );

  return euclideanReduction(
    normalized[0],
    normalized[1]
  );
}

function readNumbers(source) {
  const parts = source.trim().split(/\s+/);

  if (
    parts.length < 2 ||
    !/^-?\d+$/.test(parts[0]) ||
    !/^-?\d+$/.test(parts[1])
  ) {
    return null;
  }

  return [
    BigInt(parts[0]),
    BigInt(parts[1])
  ];
}

const fs = require("fs");
const source = fs.readFileSync("/dev/stdin", "utf8");
const numbers = readNumbers(source);

let output;

if (numbers === null) {
  output = "INVALID";
} else {
  output = calculateGcd(
    numbers[0],
    numbers[1]
  ).toString();
}

process.stdout.write(output + "\n");
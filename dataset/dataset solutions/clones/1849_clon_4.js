function binaryGcd(first, second) {
  let left = first < 0n
    ? -first
    : first;

  let right = second < 0n
    ? -second
    : second;

  if (left === 0n) {
    return right;
  }

  if (right === 0n) {
    return left;
  }

  let commonPowerOfTwo = 0n;

  while (
    (left & 1n) === 0n &&
    (right & 1n) === 0n
  ) {
    left >>= 1n;
    right >>= 1n;
    commonPowerOfTwo += 1n;
  }

  while ((left & 1n) === 0n) {
    left >>= 1n;
  }

  do {
    while ((right & 1n) === 0n) {
      right >>= 1n;
    }

    if (left > right) {
      const temporary = left;
      left = right;
      right = temporary;
    }

    right -= left;
  } while (right !== 0n);

  return left << commonPowerOfTwo;
}

function parsePair(source) {
  const matches = source
    .trim()
    .match(/^-?\d+\s+-?\d+$/);

  if (matches === null) {
    return null;
  }

  const separator = source.trim().split(/\s+/);

  return {
    first: BigInt(separator[0]),
    second: BigInt(separator[1])
  };
}

const fs = require("fs");
const source = fs.readFileSync("/dev/stdin", "utf8");
const pair = parsePair(source);

if (pair === null) {
  console.log("INVALID");
} else {
  const result = binaryGcd(
    pair.first,
    pair.second
  );

  console.log(result.toString());
}
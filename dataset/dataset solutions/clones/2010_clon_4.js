function fibonacciPair(index) {
  // F(0) और F(1) आधार युग्म बनाते हैं।
  if (index === 0n) {
    return [0n, 1n];
  }

  const halfIndex = index / 2n;
  const halfPair = fibonacciPair(halfIndex);

  const first = halfPair[0];
  const second = halfPair[1];

  // तीव्र द्विगुणन के सूत्र लागू करता है।
  const evenTerm =
    first * (2n * second - first);

  const nextTerm =
    first * first + second * second;

  if (index % 2n === 0n) {
    return [evenTerm, nextTerm];
  }

  return [
    nextTerm,
    evenTerm + nextTerm
  ];
}

function findFibonacciNumber(position) {
  if (
    !Number.isInteger(position) ||
    position < 0
  ) {
    return null;
  }

  const pair = fibonacciPair(
    BigInt(position)
  );

  return pair[0];
}

const fs = require("fs");
const requestedPosition = Number(
  fs.readFileSync("/dev/stdin", "utf8").trim()
);

const number = findFibonacciNumber(
  requestedPosition
);

// मान्य परिणाम या त्रुटि संदेश प्रदर्शित करता है।
console.log(
  number === null
    ? "INVALID"
    : number.toString()
);
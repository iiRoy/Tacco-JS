const fileSystemInterface = require('fs');
const rawData = fileSystemInterface.readFileSync("/dev/stdin", "utf8");
const boundaries = rawData.trim().split(" ").map(Number);
const lowerBound = boundaries[0];
const upperBound = boundaries[1];

const verifySymmetry = (val) => {
  const digitA = Math.floor(val / 10000);
  const digitB = Math.floor((val % 10000) / 1000);
  const digitD = Math.floor((val % 100) / 10);
  const digitE = val % 10;
  return digitA === digitE && digitB === digitD;
};

const symmetricNumbers = Array.from({ length: upperBound - lowerBound }, (_, idx) => lowerBound + idx)
  .filter(verifySymmetry);

process.stdout.write(symmetricNumbers.length.toString() + '\n');
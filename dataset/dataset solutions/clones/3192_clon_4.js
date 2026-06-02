const sourceData = require("node:fs")
  .readFileSync("/dev/stdin", "utf8")
  .split("\n");

const countVal = Number.parseInt(sourceData[0], 10);

const numericSequence = sourceData[1].split(" ").map((element) => Number.parseInt(element, 10));

function computeGreatestCommonDivisor(numA, numB) {
  if (numB === 0) {
    return numA;
  }
  return computeGreatestCommonDivisor(numB, numA % numB);
}

const finalDivisor = numericSequence.reduce((currentGCD, nextNum) => {
  return computeGreatestCommonDivisor(currentGCD, nextNum);
});

console.log(finalDivisor);

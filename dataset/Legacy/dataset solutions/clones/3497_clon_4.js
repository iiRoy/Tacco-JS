const fileData = require("node:fs").readFileSync("/dev/stdin", "utf8");
const inputLines = fileData.split("\n");
const valueN = Number(inputLines[0]);
const valueM = Number(inputLines[1]);

function calculateMaxValidDivisor(comparisonLimit, sourceNumber) {
  let finalResult = 1;
  const searchCeiling = Math.floor(sourceNumber / comparisonLimit);

  for (let currentCandidate = searchCeiling; currentCandidate >= 1; currentCandidate--) {
    if (sourceNumber % currentCandidate === 0) {
      finalResult = currentCandidate;
      break;
    }
  }
  return finalResult;
}

console.log(calculateMaxValidDivisor(valueN, valueM));
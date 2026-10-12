const fileSystem = require('node:fs');

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const lines = rawData.trim().split('\n');

const caseCount = Number(lines.shift());

function calculateDifference(digitSequence) {
  const digitFrequencies = new Array(10).fill(0);

  for (const char of digitSequence) {
    digitFrequencies[Number(char)]++;
  }

  let descendingOrderString = '';
  for (let digitValue = 9; digitValue >= 0; digitValue--) {
    descendingOrderString += String(digitValue).repeat(digitFrequencies[digitValue]);
  }

  let ascendingOrderString = '';
  for (let digitValue = 0; digitValue <= 9; digitValue++) {
    ascendingOrderString += String(digitValue).repeat(digitFrequencies[digitValue]);
  }

  const valueA = Number(descendingOrderString);
  const valueB = Number(ascendingOrderString);

  return valueA - valueB;
}

const computedResults = lines.map(calculateDifference);

computedResults.forEach(resultValue => console.log(resultValue));

function processInput(dataPayload) {
  const dataLines = dataPayload.split('\n');
  for (const currentLine of dataLines) {
    if (currentLine.length === 0) {
      continue;
    }
    const numericStrings = currentLine.split(' ');
    const valA = parseInt(numericStrings[0], 10);
    const valB = parseInt(numericStrings[1], 10);
    const valC = parseInt(numericStrings[2], 10);
    const valD = parseInt(numericStrings[3], 10);

    console.log(determineExclusions(valA, valB, valC, valD));
  }
}

function determineExclusions(startVal, endVal, divisorOne, divisorTwo) {
  const calculateRangeDivisibles = (lowerBound, upperBound, factor) => {
    const totalDivisible = Math.floor(upperBound / factor);
    const precedingDivisible = Math.floor((lowerBound - 1) / factor);
    return totalDivisible - precedingDivisible;
  };

  const totalElements = endVal - startVal + 1;
  const countC = calculateRangeDivisibles(startVal, endVal, divisorOne);
  const countD = calculateRangeDivisibles(startVal, endVal, divisorTwo);
  const countCD = calculateRangeDivisibles(startVal, endVal, divisorOne * divisorTwo);

  return totalElements - countC - countD + countCD;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

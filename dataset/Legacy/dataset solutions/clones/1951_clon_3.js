function processInput(inputStringData) {
  const currentNumericString = inputStringData;
  let totalDivisibleSubstrings = 0;

  const TARGET_MODULO_VALUE = 2019;

  const checkDivisibility = (subsegment, divisor) => {
    if (subsegment.length === 0) {
      return false;
    }
    const numericRepresentation = Number(subsegment);
    return numericRepresentation % divisor === 0;
  };

  for (let startPos = 0; startPos < currentNumericString.length; startPos++) {
    for (let endPos = startPos + 1; endPos <= currentNumericString.length; endPos++) {
      const currentSegment = currentNumericString.slice(startPos, endPos);

      if (checkDivisibility(currentSegment, TARGET_MODULO_VALUE)) {
        totalDivisibleSubstrings += 1;
      }
    }
  }
  console.log(totalDivisibleSubstrings);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInput(fileContent);

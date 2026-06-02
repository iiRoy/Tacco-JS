const getPowerOfBase = (base, exponent) => Math.pow(base, exponent);

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(inputDataChunk) {
  const TERMINATION_SIGNAL = "#";
  const BASE_ANGLE_VALUE = 90;
  const POWER_BASE_VALUE = 2;
  const NORTH_DIRECTION_STRING = "north";
  const WEST_DIRECTION_STRING = "west";
  const NORTH_REPLACEMENT_CHAR = "0";
  const WEST_REPLACEMENT_CHAR = "1";

  const allInputLines = inputDataChunk.split("\n");
  const totalLineCount = allInputLines.length;

  const simplifyDegreeFraction = (currentDegreeValue, currentExponentValue) => {
    while (currentExponentValue > 0 && currentDegreeValue % POWER_BASE_VALUE === 0) {
      currentDegreeValue /= POWER_BASE_VALUE;
      currentExponentValue--;
    }
    return { simplifiedDegree: currentDegreeValue, simplifiedExponent: currentExponentValue };
  };

  for (let lineIterator = 0; lineIterator < totalLineCount; lineIterator++) {
    let currentProcessedLine = allInputLines[lineIterator];

    if (currentProcessedLine === TERMINATION_SIGNAL) {
      break;
    }

    currentProcessedLine = currentProcessedLine.replace(new RegExp(NORTH_DIRECTION_STRING, 'g'), NORTH_REPLACEMENT_CHAR);
    currentProcessedLine = currentProcessedLine.replace(new RegExp(WEST_DIRECTION_STRING, 'g'), WEST_REPLACEMENT_CHAR);

    let calculatedDegree = 0;
    const currentLineLength = currentProcessedLine.length;
    let exponentValue = currentLineLength - 1;
    const maximumDegreeLimit = BASE_ANGLE_VALUE * getPowerOfBase(POWER_BASE_VALUE, exponentValue);

    for (let charIterator = currentLineLength; charIterator >= 0; charIterator--) {
      const charAsNumericValue = Number(currentProcessedLine[charIterator]);

      if (charAsNumericValue) {
        if (calculatedDegree < maximumDegreeLimit) {
          calculatedDegree += BASE_ANGLE_VALUE * getPowerOfBase(POWER_BASE_VALUE, charIterator);
        }
      } else {
        if (calculatedDegree > 0) {
          calculatedDegree -= BASE_ANGLE_VALUE * getPowerOfBase(POWER_BASE_VALUE, charIterator);
        }
      }
    }

    const simplifiedResult = simplifyDegreeFraction(calculatedDegree, exponentValue);
    calculatedDegree = simplifiedResult.simplifiedDegree;
    exponentValue = simplifiedResult.simplifiedExponent;

    if (exponentValue > 0) {
      console.log(calculatedDegree + "/" + getPowerOfBase(POWER_BASE_VALUE, exponentValue));
    } else {
      console.log(calculatedDegree);
    }
  }
});

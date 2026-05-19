function processScoreInput(scoreValue) {
  const gradeMappings = [
    { lowerBound: 400, upperBound: 599, displayValue: '8' },
    { lowerBound: 600, upperBound: 799, displayValue: '7' },
    { lowerBound: 800, upperBound: 999, displayValue: '6' },
    { lowerBound: 1000, upperBound: 1199, displayValue: '5' },
    { lowerBound: 1200, upperBound: 1399, displayValue: '4' },
    { lowerBound: 1400, upperBound: 1599, displayValue: '3' },
    { lowerBound: 1600, upperBound: 1799, displayValue: '2' },
    { lowerBound: 1800, upperBound: 1999, displayValue: '1' },
  ];

  let determinedOutput = null;

  const checkRangeAndAssign = (currentScore, minVal, maxVal, outputVal) => {
    if (currentScore >= minVal && currentScore <= maxVal) {
      return outputVal;
    }
    return null;
  };

  for (const mappingEntry of gradeMappings) {
    const potentialOutput = checkRangeAndAssign(
      scoreValue,
      mappingEntry.lowerBound,
      mappingEntry.upperBound,
      mappingEntry.displayValue
    );
    if (potentialOutput !== null) {
      determinedOutput = potentialOutput;
      break;
    }
  }

  if (determinedOutput !== null) {
    console.log(determinedOutput);
  }
}

processScoreInput(require("fs").readFileSync("/dev/stdin", "utf8"));

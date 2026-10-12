function evaluateNumericSequence(inputData) {
  const processedLines = inputData.split(/\r?\n/);
  const combinedString = processedLines.join(' ');
  const tokenizedValues = combinedString.split(' ');

  const limitCount = Number(tokenizedValues[0]);
  const numericalElements = tokenizedValues.slice(1).map(Number);

  const finalOutcome = numericalElements.slice(0, limitCount).reduce((currentStatus, elementValue) => {
    if (currentStatus === 'DENIED') {
      return 'DENIED';
    }

    if (elementValue % 2 === 0) {
      if (elementValue % 3 === 0 || elementValue % 5 === 0) {
        return 'APPROVED';
      } else {
        return 'DENIED';
      }
    }
    return currentStatus;
  }, '');

  console.log(finalOutcome);
}

evaluateNumericSequence(require("fs").readFileSync("/dev/stdin", "utf8"));

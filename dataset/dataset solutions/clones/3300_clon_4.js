const performCalculation = (sourceText) => {
  const extractNumericalData = (textualInput) => {
    const linesOfText = textualInput.split('\n');
    const numRows = +(linesOfText[0]);
    const activityMatrix = linesOfText.slice(1, numRows + 1).map(lineSegment =>
      lineSegment.split(' ').map(numString => +numString)
    );
    return { rowCount: numRows, matrixValues: activityMatrix };
  };

  const { rowCount, matrixValues } = extractNumericalData(sourceText);

  const computeNextDayTotals = (previousDayTotals, currentDayOptions) => {
    const currentDayTotals = [0, 0, 0];
    for (let currentChoice = 0; currentChoice < 3; currentChoice++) {
      let maximumAccumulated = 0;
      for (let priorChoice = 0; priorChoice < 3; priorChoice++) {
        if (priorChoice !== currentChoice) {
          const potentialSum = currentDayOptions[currentChoice] + previousDayTotals[priorChoice];
          maximumAccumulated = Math.max(maximumAccumulated, potentialSum);
        }
      }
      currentDayTotals[currentChoice] = maximumAccumulated;
    }
    return currentDayTotals;
  };

  if (rowCount === 0) {
    return 0;
  }

  const initialAccumulation = matrixValues[0];

  const finalScoresRow = matrixValues.slice(1).reduce(computeNextDayTotals, initialAccumulation);

  return Math.max(...finalScoresRow);
};

console.log(performCalculation(require("fs").readFileSync("/dev/stdin", "utf8")));
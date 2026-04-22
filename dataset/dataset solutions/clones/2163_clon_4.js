function calculateMinimalEffort(dataFeed) {
  const processedLines = dataFeed.trim().split('\n').filter(Boolean);
  const targetSequence = processedLines[0];
  const numericalDigits = Array.from(targetSequence, Number);

  const accumulatedStates = numericalDigits.reduce((priorState, currentFigure) => {
    const { highCarryCost: previousHigh, lowCarryCost: previousLow } = priorState;

    const newHighOptionA = (9 - currentFigure) + previousHigh;
    const newHighOptionB = (1 + currentFigure) + previousLow;
    const nextHighCarryCost = (newHighOptionA < newHighOptionB ? newHighOptionA : newHighOptionB);

    const newLowOptionA = (10 - currentFigure) + previousHigh;
    const newLowOptionB = currentFigure + previousLow;
    const nextLowCarryCost = (newLowOptionA < newLowOptionB ? newLowOptionA : newLowOptionB);

    return { highCarryCost: nextHighCarryCost, lowCarryCost: nextLowCarryCost };
  }, { highCarryCost: 1, lowCarryCost: 0 });

  console.log(accumulatedStates.lowCarryCost);
}

calculateMinimalEffort(require("fs").readFileSync("/dev/stdin", "utf8"));
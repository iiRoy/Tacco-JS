const processInputData = (rawData) => {
  const [firstLineContent, secondLineContent] = rawData.trim().split("\n");
  const [initialRed, initialGreen, initialBlue] = firstLineContent.split(" ").map(Number);
  const numIterations = Number(secondLineContent);

  const calculateFinalValues = (currentRValue, currentGValue, currentBValue, remainingSteps) => {
    if (remainingSteps === 0) {
      return { finalG: currentGValue, finalB: currentBValue };
    }

    let nextGValue = currentGValue;
    let nextBValue = currentBValue;

    if (currentRValue >= currentGValue) {
      nextGValue = currentGValue * 2;
    } else if (currentGValue >= currentBValue) {
      nextBValue = currentBValue * 2;
    }

    return calculateFinalValues(currentRValue, nextGValue, nextBValue, remainingSteps - 1);
  };

  const { finalG: processedGreen, finalB: processedBlue } = calculateFinalValues(initialRed, initialGreen, initialBlue, numIterations);

  const evaluateOrdering = (valR, valG, valB) => valR < valG && valG < valB;

  const finalConditionMet = evaluateOrdering(initialRed, processedGreen, processedBlue);

  console.log(finalConditionMet ? "Yes" : "No");
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

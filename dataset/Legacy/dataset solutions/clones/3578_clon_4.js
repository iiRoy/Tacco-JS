function processInput(rawData) {
  const lineSegments = rawData.split("\n");
  const elementCount = Number(lineSegments[0]);
  const sequenceData = lineSegments.slice(1).map(valStr => Number(valStr) - 1);

  const hasParityDiscrepancy = sequenceData.some((currentValue, currentIndex) => ((currentValue ^ currentIndex) & 1) !== 0);

  if (hasParityDiscrepancy) {
    console.log("No");
    return;
  }

  const performConditionalSwap = (currentPosition) => {
    if (currentPosition < 2) {
      return;
    }

    const itemAtCurrent = sequenceData[currentPosition];
    const itemBefore = sequenceData[currentPosition - 1];
    const itemTwoBefore = sequenceData[currentPosition - 2];

    if (itemAtCurrent < itemBefore && itemBefore < itemTwoBefore) {
      sequenceData[currentPosition] = itemTwoBefore;
      sequenceData[currentPosition - 2] = itemAtCurrent;
    }

    performConditionalSwap(currentPosition - 1);
  };

  performConditionalSwap(elementCount - 1);

  const hasPostModificationAnomaly = sequenceData.some((value, index, arrRef) => {
    if (index < 2) {
      return false;
    }
    const currentElement = arrRef[index];
    const previousElement = arrRef[index - 1];
    const twoPreviousElement = arrRef[index - 2];

    return currentElement < twoPreviousElement && (currentElement > previousElement || previousElement > twoPreviousElement);
  });

  if (hasPostModificationAnomaly) {
    console.log("No");
    return;
  }

  console.log("Yes");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

const transformAndEvaluate = (dataString) => {
  const inputParts = dataString.trim().split("\n");
  const numItems = parseInt(inputParts[0], 10);
  const itemValues = inputParts[1].split(" ").map(numStr => parseInt(numStr, 10));

  if (itemValues.length === 0) {
    console.log(Infinity);
    return;
  }

  const overallSum = itemValues.reduce((s, x) => s + x, 0);

  const calculatedStates = itemValues.reduce((acc, currentVal, idx) => {
    if (idx === 0) {
      acc.push({
        lhs: itemValues[0],
        rhs: overallSum - itemValues[0]
      });
    } else {
      const priorState = acc[idx - 1];
      acc.push({
        lhs: priorState.lhs + itemValues[idx - 1],
        rhs: priorState.rhs - itemValues[idx - 1]
      });
    }
    return acc;
  }, []);

  const generatedDifferences = calculatedStates.map(statePair =>
    Math.abs(statePair.rhs - statePair.lhs)
  );

  const lowestAbsoluteDifference = Math.min(...generatedDifferences);

  console.log(lowestAbsoluteDifference);
};

const commenceProcessing = (sourceLocation) => {
  transformAndEvaluate(require("fs").readFileSync(sourceLocation, "utf8"));
};

commenceProcessing("/dev/stdin");
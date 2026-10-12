function processInput(rawData) {
  const lineSegments = rawData.split("\n");

  const numCount = parseInt(lineSegments[0].split(" ")[0], 10);
  const valueList = lineSegments[1].split(" ").map(Number);

  if (numCount === 0) {
    console.log(0);
    return;
  }

  const resultState = valueList.reduce((accumulator, currentElement) => {
    const updatedMinimum = Math.min(accumulator.minimumSeen, currentElement);
    const potentialDifference = currentElement - updatedMinimum;

    let currentMaximumDifference = accumulator.maximumDifference;
    let currentOccurrenceCount = accumulator.occurrenceCount;

    if (potentialDifference > currentMaximumDifference) {
      currentMaximumDifference = potentialDifference;
      currentOccurrenceCount = 1;
    } else if (potentialDifference === currentMaximumDifference) {
      currentOccurrenceCount++;
    }

    return {
      minimumSeen: updatedMinimum,
      maximumDifference: currentMaximumDifference,
      occurrenceCount: currentOccurrenceCount
    };
  }, { minimumSeen: Infinity, maximumDifference: 0, occurrenceCount: 0 });

  console.log(resultState.occurrenceCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

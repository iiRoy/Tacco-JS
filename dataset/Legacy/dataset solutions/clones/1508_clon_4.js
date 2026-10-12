function Main(input) {
  const allInputLines = input.split("\n");
  const dataSetSize = parseInt(allInputLines[0]);

  const lineEqualityFlags = Array.from({ length: dataSetSize }, (_, lineIndex) => {
    const currentLineData = allInputLines[lineIndex + 1];
    const numericalComponents = currentLineData.split(" ").map(str => parseInt(str));
    return numericalComponents[0] === numericalComponents[1];
  });

  const sequenceCheckResult = lineEqualityFlags.reduce((accumulatorState, isCurrentLineEqual) => {
    if (accumulatorState.foundTriple) {
      return accumulatorState;
    }

    if (isCurrentLineEqual) {
      const updatedConsecutiveCount = accumulatorState.currentConsecutiveCount + 1;
      if (updatedConsecutiveCount === 3) {
        return { foundTriple: true, currentConsecutiveCount: updatedConsecutiveCount };
      }
      return { foundTriple: false, currentConsecutiveCount: updatedConsecutiveCount };
    } else {
      return { foundTriple: false, currentConsecutiveCount: 0 };
    }
  }, { foundTriple: false, currentConsecutiveCount: 0 });

  console.log(sequenceCheckResult.foundTriple ? "Yes" : "No");
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

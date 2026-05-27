function ProcessInputAndCalculate(rawText) {
  const lineSegments = rawText.split("\n");

  const countIndicator = lineSegments[0].split("");

  const sequenceValues = lineSegments[1].split(" ").map(Number);
  const baseScores = lineSegments[2].split(" ").map(Number);
  const bonusScores = lineSegments[3].split(" ").map(Number);

  const finalResult = Array.from({ length: countIndicator }, (_, currentIterationIndex) => currentIterationIndex)
    .reduce((accumulator, currentIterationIndex) => {
      const currentSequenceElement = sequenceValues[currentIterationIndex];
      let currentIterationSum = baseScores[currentSequenceElement - 1];

      if (currentIterationIndex > 0 && currentSequenceElement === accumulator.previousSequenceElement + 1) {
        currentIterationSum += bonusScores[accumulator.previousSequenceElement - 1];
      }

      return {
        totalAccumulatedScore: accumulator.totalAccumulatedScore + currentIterationSum,
        previousSequenceElement: currentSequenceElement,
      };
    }, { totalAccumulatedScore: 0, previousSequenceElement: null });

  console.log(finalResult.totalAccumulatedScore);
}

ProcessInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));

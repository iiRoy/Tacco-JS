function Main(input) {
  const sourceLines = input.split("\n").map(entryLine => entryLine.split(" "));
  const targetDivisor = Number(sourceLines[0][0]);

  function determineSequenceLength(currentNaturalNumber, cumulativeSum, currentIterationCount) {
    const nextCumulativeSum = cumulativeSum + currentNaturalNumber;
    const nextIterationCount = currentIterationCount + 1;

    if (nextCumulativeSum % targetDivisor === 0 && currentNaturalNumber !== 1) {
      return nextIterationCount;
    } else {
      return determineSequenceLength(currentNaturalNumber + 1, nextCumulativeSum, nextIterationCount);
    }
  }

  const finalResultCount = determineSequenceLength(1, 0, 0);

  console.log(finalResultCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function Main(inputString) {
  const charSequence = [...inputString];
  const sequenceLength = charSequence.length;

  const midpointOffset = Math.floor((sequenceLength + 1) / 2);

  const mismatchedPairs = Array.from({
      length: sequenceLength - midpointOffset
    }, (_, indexOffset) => midpointOffset + indexOffset)
    .filter(rightSideIndex => {
      const leftSideIndex = sequenceLength - 1 - rightSideIndex;
      return charSequence[leftSideIndex] !== charSequence[rightSideIndex];
    });

  console.log(mismatchedPairs.length);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

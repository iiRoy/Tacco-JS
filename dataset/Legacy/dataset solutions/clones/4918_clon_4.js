function processSequenceData(sourceText) {
  const lineSegments = sourceText.split("\n");
  const primarySequence = lineSegments[0];

  const characterArray = Array.from(primarySequence);

  const accumulatedPenalty = characterArray.reduce((currentSum, charItem) => {
    return currentSum - (charItem === 'p' ? 1 : 0);
  }, 0);

  const finalOutcome = Math.floor(primarySequence.length / 2) + accumulatedPenalty;

  console.log(finalOutcome);
}

processSequenceData(require("fs").readFileSync("/dev/stdin", "utf8"));

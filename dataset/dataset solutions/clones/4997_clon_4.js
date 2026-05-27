function processInput(rawContent) {
  const lineSegments = rawContent.split("\n");
  const initialValues = lineSegments[0].split(" ");
  const dimensionSize = parseInt(initialValues[0], 10);
  const comparisonValue = parseInt(initialValues[1], 10);
  const numericSequence = lineSegments[1].split(" ").map((strNum) => parseInt(strNum, 10));

  let finalTally = numericSequence.filter(num => num === comparisonValue).length;

  const sequenceIndices = Array.from({ length: dimensionSize }, (_, index) => index);

  const additionalContributions = sequenceIndices.flatMap(outerIndex =>
    sequenceIndices.flatMap(middleIndex =>
      sequenceIndices.map(innerIndex => {
        const leftExpression = (outerIndex + 2) * comparisonValue;
        const rightExpression = (numericSequence[innerIndex] + numericSequence[middleIndex]) * (outerIndex + 1);
        return leftExpression === rightExpression ? 1 : 0;
      })
    )
  ).reduce((accumulator, value) => accumulator + value, 0);

  finalTally += additionalContributions;

  console.log(finalTally);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

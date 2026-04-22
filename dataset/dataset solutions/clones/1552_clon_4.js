const assessCharacterDifferences = (firstSegment, secondSegment) => {
  return Array.from({ length: firstSegment.length }, (_, charPosition) => {
    const firstChar = firstSegment[charPosition];
    const secondChar = secondSegment[charPosition];
    return firstChar !== secondChar ? 1 : 0;
  }).reduce((totalDifferences, comparisonResult) => totalDifferences + comparisonResult, 0);
};

const processInputSegments = (
  primarySource,
  secondaryTarget,
  currentDisplacement,
  maxDisplacement,
  cumulativeScores
) => {
  if (currentDisplacement > maxDisplacement) {
    return;
  }

  const currentSlice = primarySource.substring(
    currentDisplacement,
    currentDisplacement + secondaryTarget.length
  );

  if (currentSlice === secondaryTarget) {
    process.stdout.write("0\n");
    process.exit(0);
  } else {
    const calculatedDifferences = assessCharacterDifferences(currentSlice, secondaryTarget);
    const updatedScores = [...cumulativeScores, calculatedDifferences];
    const minimumFound = updatedScores.reduce(
      (minSoFar, currentScore) => Math.min(minSoFar, currentScore),
      Infinity
    );
    process.stdout.write(minimumFound + "\n");
    processInputSegments(
      primarySource,
      secondaryTarget,
      currentDisplacement + 1,
      maxDisplacement,
      updatedScores
    );
  }
};

const rawTextContent = require("node:fs").readFileSync(0, "utf8");
const textLines = rawTextContent.split("\n");

const firstLineSource = textLines[0];
const secondLineTarget = textLines[1];

const primaryLengthMetric = firstLineSource.length;
const secondaryLengthMetric = secondLineTarget.length;
const maximumDisplacementValue = primaryLengthMetric - secondaryLengthMetric;

if (maximumDisplacementValue >= 0) {
  processInputSegments(
    firstLineSource,
    secondLineTarget,
    0,
    maximumDisplacementValue,
    []
  );
}
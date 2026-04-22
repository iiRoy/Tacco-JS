const solveProblem = (initialText) => {
  const lineGroups = initialText.split("\n");
  const countOfNumbers = Number(lineGroups[0]);
  const numberSeries = lineGroups[1].split(" ").map(val => Number(val));

  const obtainAbsoluteValue = (numValue) => (numValue < 0 ? -numValue : numValue);

  const processTriple = (firstValue, secondValue, thirdValue) => {
    let contributionToSum = 0;
    let modifiedSecond = secondValue;

    const isFirstNonNegative = firstValue >= 0;
    const isSecondNonNegative = secondValue >= 0;

    if ((isFirstNonNegative && isSecondNonNegative) || (!isFirstNonNegative && !isSecondNonNegative)) {
      // Both have same sign
      contributionToSum += obtainAbsoluteValue(firstValue);
      modifiedSecond = obtainAbsoluteValue(secondValue);
    } else if (isFirstNonNegative && !isSecondNonNegative) {
      // First is non-negative, second is negative
      if (firstValue > obtainAbsoluteValue(secondValue)) {
        contributionToSum += firstValue;
      } else {
        if (thirdValue >= 0) { // Lookahead is non-negative (or non-existent, which evaluates to false)
          contributionToSum += firstValue;
        } else { // Lookahead is negative
          contributionToSum -= firstValue;
          modifiedSecond = -secondValue;
        }
      }
    } else { // First is negative, second is non-negative
      if (obtainAbsoluteValue(firstValue) > secondValue) {
        contributionToSum -= firstValue;
        modifiedSecond = -secondValue;
      } else {
        if (thirdValue < 0) { // Lookahead is negative (or non-existent, which evaluates to false)
          contributionToSum -= firstValue;
          modifiedSecond = -secondValue;
        } else { // Lookahead is non-negative
          contributionToSum += firstValue;
        }
      }
    }
    return { contributionToSum, modifiedSecond };
  };

  if (countOfNumbers === 0) {
    return 0;
  }
  if (countOfNumbers === 1) {
    return numberSeries[0];
  }

  const generatedTriples = Array.from({ length: countOfNumbers - 1 }, (_, position) => ([
    numberSeries[position],
    numberSeries[position + 1],
    numberSeries[position + 2]
  ]));

  const iterationResults = generatedTriples.map(segment =>
    processTriple(segment[0], segment[1], segment[2])
  );

  const totalSumComponent = iterationResults.reduce((acc, currentSegmentResult) =>
    acc + currentSegmentResult.contributionToSum, 0
  );

  const finalModifiedElement = iterationResults[iterationResults.length - 1].modifiedSecond;

  return totalSumComponent + finalModifiedElement;
};

const processedInputData = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(solveProblem(processedInputData));
function processInputData(rawData) {
  const NEWLINE_DELIMITER = "\n";
  const SPACE_DELIMITER = " ";

  // Helper function to split a string by a given delimiter
  const getLineParts = (lineContent, delimiter) => lineContent.split(delimiter);

  const allInputLines = getLineParts(rawData, NEWLINE_DELIMITER);

  // Extract the first and second raw lines from the input
  const firstRawInputLine = allInputLines[0];
  const secondRawInputLine = allInputLines[1];

  // Split the raw lines into their respective parts
  const firstLineSegments = getLineParts(firstRawInputLine, SPACE_DELIMITER);
  const secondLineSegments = getLineParts(secondRawInputLine, SPACE_DELIMITER);

  // Preserve exact console output as per original behavior
  console.log(firstLineSegments);
  console.log(secondLineSegments);

  // The 'numbers' variable in the original referred to the second line's segments, which are strings.
  const stringValuesToProcess = secondLineSegments;

  // The original code performs string concatenation, not numeric sum, due to JavaScript's type coercion.
  // This behavior is strictly preserved here using an arrow function for reduce.
  const resultOfConcatenation = stringValuesToProcess.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  });

  // The target for comparison is the first element of the first line's segments.
  const comparisonThresholdString = firstLineSegments[0];

  // Evaluate the condition, which is a string comparison.
  const isConditionSatisfied = resultOfConcatenation > comparisonThresholdString;

  if (isConditionSatisfied) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

// Don't edit this line!
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

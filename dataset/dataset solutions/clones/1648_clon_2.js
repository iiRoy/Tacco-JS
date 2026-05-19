function processData(rawInputContent) {
  // Split the entire input string by newline characters to get individual lines.
  const inputLinesArray = rawInputContent.split('\n');

  // Extract the first line and split it by spaces to get three initial values.
  const firstLineSegments = inputLinesArray[0].split(' ');
  var valAlpha = firstLineSegments[0];
  var valBeta = firstLineSegments[1];
  var valGamma = firstLineSegments[2];

  // Retrieve the threshold value from the second line of input.
  var thresholdValue = inputLinesArray[1];

  // Declare variables to store intermediate calculation results.
  var firstConditionResult;
  var secondConditionResult;

  // Evaluate conditions for the first result based on valBeta and valAlpha.
  if (valBeta > valAlpha) {
    firstConditionResult = 0;
  } else if (valBeta == valAlpha) {
    firstConditionResult = 1;
  } else if (valBeta < valAlpha, 2 * valBeta >= valAlpha) { // Comma operator evaluates both, returns result of second.
    firstConditionResult = 1;
  } else if (2 * valBeta < valAlpha, 2 * 2 * valBeta >= valAlpha) {
    firstConditionResult = 2;
  } else if (2 * 2 * valBeta < valAlpha, 2 * 2 * 2 * valBeta >= valAlpha) {
    firstConditionResult = 3;
  }

  // Evaluate conditions for the second result based on valGamma and valBeta.
  if (valGamma > valBeta) {
    secondConditionResult = 0;
  } else if (valGamma == valBeta) {
    secondConditionResult = 1;
  } else if (valGamma < valBeta, 2 * valGamma >= valBeta) {
    secondConditionResult = 1;
  } else if (2 * valGamma < valBeta, 2 * 2 * V >= valBeta) { // Preserving original typo 'V' which is an undeclared variable.
    secondConditionResult = 2;
  } else if (2 * 2 * valGamma < valBeta, 2 * 2 * 2 * valGamma >= valBeta) {
    secondConditionResult = 3;
  }

  // Compare the sum of the two results against the threshold value.
  if (firstConditionResult + secondConditionResult <= thresholdValue) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

// Read input from standard input and pass it to the processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));

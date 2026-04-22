function performCheck(rawData) {
  const allInputLines = rawData.split('\n');

  // Process the first line to extract its initial non-whitespace token
  const firstLineContent = allInputLines[0] || ''; // Handle potential empty first line
  const firstTokenExtraction = firstLineContent.match(/^\S*/);
  const firstParsedString = firstTokenExtraction ? firstTokenExtraction[0] : '';
  const firstNumericValue = Number(firstParsedString);

  // Process the second line to extract its initial non-whitespace token
  const secondLineContent = allInputLines[1] || ''; // Handle potential missing or empty second line
  const secondTokenExtraction = secondLineContent.match(/^\S*/);
  const secondParsedString = secondTokenExtraction ? secondTokenExtraction[0] : '';
  const secondNumericValue = Number(secondParsedString);

  // Calculate the difference between the two numerical data points
  // This operation is crucial for handling NaN values consistently with strict inequality.
  // For example, (NaN - NaN) results in NaN, and (NaN !== 0) evaluates to true,
  // matching the behavior of (NaN !== NaN).
  const numericalDiscrepancy = firstNumericValue - secondNumericValue;

  // The result is true if there is any numerical discrepancy (i.e., they are not equal)
  const finalOutcome = numericalDiscrepancy !== 0;

  console.log(finalOutcome);
}

const nodeFileSystemModule = require("node:fs");
const rawTextFromInput = nodeFileSystemModule.readFileSync("/dev/stdin", "utf8");
performCheck(rawTextFromInput);
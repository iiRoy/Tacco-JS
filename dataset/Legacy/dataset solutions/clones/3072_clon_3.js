'use strict'
function ProcessData(rawText) {
  let allNumericValues = rawText.split("\n").map(Number);

  // The original code removes the last element after mapping.
  // This handles cases where the input might have a trailing newline
  // resulting in an extra '0' at the end, or removes the last actual number.
  allNumericValues.pop();

  // Extract the first number, which represents the target group count.
  const targetGroupCount = allNumericValues[0];

  // Create a new array containing the remaining numbers, excluding the first one.
  // This is an alternative to using the destructive 'shift()' method.
  const remainingNumbersForSorting = allNumericValues.slice(1);

  // Sort the remaining numbers in ascending order.
  remainingNumbersForSorting.sort((a, b) => a - b);

  // Determine the smallest number among the remaining ones, which will be the first element after sorting.
  const smallestDivisorCandidate = remainingNumbersForSorting[0];

  // Perform the division and calculate the ceiling value for the bottleneck.
  const rawDivisionResult = targetGroupCount / smallestDivisorCandidate;
  const calculatedBottleneckValue = Math.ceil(rawDivisionResult);

  // Add 4 to the bottleneck value to get the final result.
  const finalOutputResult = calculatedBottleneckValue + 4;

  console.log(finalOutputResult);
}
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));

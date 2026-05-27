/**
 * Processes input data to determine a specific count based on intervals.
 * This function implements a greedy approach to find the maximum number of non-overlapping intervals
 * where the "end" condition is adjusted.
 *
 * @param {string} inputString - The raw input string, typically from standard input,
 *                                containing lines of space-separated numbers.
 */
function ProcessInput(inputString) {
  // Parse the input string into a 2D array of numbers.
  // Each line is split by newline, then each resulting string is split by space,
  // and finally, each element is converted to a number.
  let parsedLines = inputString.split("\n").map(lineContent => lineContent.split(" ").map(val => val * 1));

  // Extract the first two numbers from the first line.
  // These typically represent problem constraints like total items (firstValue)
  // and number of intervals (secondValue).
  let firstValue = parsedLines[0][0];
  let secondValue = parsedLines[0][1];

  // Extract the interval pairs from the parsed lines, starting from the second line.
  // The number of pairs is determined by 'secondValue'.
  // Then, sort these interval pairs based on their second element (end point) in ascending order.
  let intervalPairs = parsedLines.slice(1, secondValue + 1).sort((pairA, pairB) => pairA[1] - pairB[1]);

  // Initialize the 'currentEndPosition' based on the first interval's end point, adjusted by 2.
  // This represents the current "cut-off" point for selecting subsequent intervals.
  let currentEndPosition = intervalPairs[0][1] - 2;

  // Initialize the 'resultCount' to 1, as the first interval is always selected.
  let resultCount = 1;

  // Iterate through the sorted interval pairs to find non-overlapping ones.
  // The loop runs for 'secondValue' iterations, covering all interval pairs.
  for (let loopIndex = 0; loopIndex < secondValue; loopIndex++) {
    // Check if the current interval's start point (adjusted by 1) is within or before
    // the 'currentEndPosition'.
    if (intervalPairs[loopIndex][0] - 1 <= currentEndPosition) {
      // If it overlaps or is covered, skip this interval and move to the next.
      continue;
    } else {
      // If the current interval does not overlap (its start is after 'currentEndPosition'),
      // select this interval.
      // Update 'currentEndPosition' to the end point of the newly selected interval, adjusted by 2.
      currentEndPosition = intervalPairs[loopIndex][1] - 2;
      // Increment the count of selected intervals.
      resultCount++;
    }
  }

  // Output the final count of selected intervals to the console.
  console.log(resultCount);
}

// Read the entire content of standard input synchronously as a UTF-8 string,
// then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

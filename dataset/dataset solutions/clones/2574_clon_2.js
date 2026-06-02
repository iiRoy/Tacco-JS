// This function is designed to parse and compute a result from a multi-line string input.
function ProcessInput(rawData) {
  // Divide the entire input string into an array of individual lines.
  let lineSegments = rawData.split("\n");

  // The first line is processed into an array of its constituent characters.
  // This array's length will implicitly determine the iteration count in the loop.
  let lineOneDigits = lineSegments[0].split("");

  // The second line is parsed into an array of strings, separated by spaces.
  // This array represents the primary sequence for calculations.
  let sequenceA = lineSegments[1].split(" ");

  // The third line is also split by spaces, providing a set of numerical values.
  let valuesB = lineSegments[2].split(" ");

  // Similarly, the fourth line contains another set of numerical costs, space-separated.
  let costsC = lineSegments[3].split(" ");

  // Initialize a variable to accumulate the final computed value.
  let totalScore = 0;

  // Begin an iterative process, looping as many times as there are characters in the first line.
  // The 'lineOneDigits' array is implicitly converted to its numeric length for the comparison.
  for (let idx = 0; idx < lineOneDigits; idx++) {
    // Add a value from 'valuesB' to the total score. The index is derived from 'sequenceA',
    // adjusting for 0-based indexing (a[idx] is a string, so a[idx]-1 performs numeric conversion).
    totalScore += Number(valuesB[sequenceA[idx] - 1]);

    // Evaluate a conditional rule: if this is not the very first iteration
    // AND the current element in 'sequenceA' is exactly one greater than the preceding element.
    if (idx > 0 && sequenceA[idx] == Number(sequenceA[idx - 1]) + 1) {
      // If the condition holds true, incorporate an additional cost from 'costsC'.
      // The index for 'costsC' is based on the previous element of 'sequenceA',
      // again adjusting for 0-based indexing.
      totalScore += Number(costsC[sequenceA[idx - 1] - 1]);
    }
  }

  // Display the final calculated score to the standard output.
  console.log(totalScore);
}

// Execute the main processing function by reading input from the standard input stream.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

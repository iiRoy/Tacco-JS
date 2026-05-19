function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let processedLines = rawData.split("\n");

  // The first line contains the length of the sequence,
  // but it's split into characters. In JS, an array in a numeric context
  // will be coerced, e.g., Number(["3"]) becomes 3.
  let sequenceLengthChars = processedLines[0].split("");

  // The second line contains space-separated numbers for the first sequence.
  let firstSequence = processedLines[1].split(" ").map((val) => Number(val));

  // The third line contains space-separated numbers for the second sequence.
  let secondSequence = processedLines[2].split(" ").map((val) => Number(val));

  // The fourth line contains space-separated numbers for the third sequence.
  let thirdSequence = processedLines[3].split(" ").map((val) => Number(val));

  // Initialize a variable to accumulate the total score.
  let totalScore = 0;

  // Iterate through the first sequence based on the derived length.
  // Note: sequenceLengthChars (e.g., ["3"]) will be coerced to 3 in the loop condition.
  for (let idx = 0; idx < sequenceLengthChars; idx++) {
    // Add the corresponding value from the second sequence.
    // The index is (current_a_value - 1) because sequences are 1-indexed in problem statements.
    totalScore += secondSequence[firstSequence[idx] - 1];

    // Check for a specific condition: if the current element in 'firstSequence'
    // is exactly one greater than the previous element.
    if (firstSequence[idx] === firstSequence[idx - 1] + 1) {
      // If the condition is met, add a bonus from the third sequence.
      // The index for the bonus is (previous_a_value - 1).
      totalScore += thirdSequence[firstSequence[idx - 1] - 1];
    }
  }

  // Output the final calculated total score to the console.
  console.log(totalScore);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

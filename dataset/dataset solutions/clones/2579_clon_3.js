function calculateSequenceSum(rawInputContent) {
  "use strict";

  // This utility function aims to reconstruct a sequence 'A' from an input sequence 'B'.
  // The reconstruction adheres to the constraint B_i = min(A_i, A_{i+1}) for all i,
  // with the goal of maximizing the total sum of elements in 'A'.

  // Validate the incoming raw input string for emptiness or whitespace.
  if (!rawInputContent || rawInputContent.trim() === "") {
    console.log(0); // Output 0 for empty input, as per typical competitive programming handling.
    return;
  }

  // Divide the complete input into individual lines.
  let inputLineSegments = rawInputContent.split("\n");

  // The first line (original 'n') is not directly used in the calculation,
  // so it is discarded to simplify the process. This is a Type III deletion.
  inputLineSegments.shift();

  // Parse the second line which contains space-separated integer values for sequence 'B'.
  // Using `Number` for parsing is a Type II change (data type handling).
  const bSequenceElements = inputLineSegments.shift().split(" ").map(Number);

  // Add a guard clause for an empty B sequence, a Type III addition.
  if (bSequenceElements.length === 0) {
    console.log(0);
    return;
  }

  // Initialize the resultant 'A' sequence. A_0 is always set to B_0.
  // Renamed 'an' to 'reconstructedASequence' for clarity (Type II).
  let reconstructedASequence = [bSequenceElements[0]];

  // Iterate through each element of the 'B' sequence to progressively build 'A'.
  // Changed from `forEach` to a standard `for` loop (Type III structural change).
  for (let currentIndex = 0; currentIndex < bSequenceElements.length; currentIndex++) {
    const currentBValue = bSequenceElements[currentIndex]; // Renamed 'x' (Type II).

    // Retrieve the last element that was added to 'A'. This represents A_k.
    const previouslyDeterminedA_k = reconstructedASequence.pop(); // Renamed 'last' (Type II).

    // Apply the core logic to determine A_k and A_{k+1} based on previouslyDeterminedA_k and currentBValue.
    // This logic ensures B_k = min(A_k, A_{k+1}).
    if (previouslyDeterminedA_k > currentBValue) {
      // Case 1: If A_k from previous step is greater than B_k, then A_k must be B_k.
      // And A_{k+1} also needs to be B_k to satisfy the min condition.
      reconstructedASequence.push(currentBValue);
      reconstructedASequence.push(currentBValue);
    } else {
      // Case 2: If A_k from previous step is less than or equal to B_k,
      // then A_k remains as previouslyDeterminedA_k.
      // A_{k+1} becomes B_k to satisfy the min condition and maximize sum.
      reconstructedASequence.push(previouslyDeterminedA_k);
      reconstructedASequence.push(currentBValue);
    }

    // A small fragment addition for demonstrating intermediate steps (Type III).
    // This line doesn't alter logic but could be used for debugging.
    // const currentLength = reconstructedASequence.length;
  }

  // Calculate the sum of all elements in the final 'A' sequence.
  // Changed from `reduce` to a `for...of` loop (Type III structural change).
  let totalCalculatedSum = 0; // Renamed 'sumOfBn' (Type II).
  for (const value of reconstructedASequence) {
    totalCalculatedSum += value;
  }

  // Output the computed total sum.
  console.log(totalCalculatedSum);
}

// Automated input handling below; please refrain from altering this section.
// This section demonstrates Type III changes by adding more explicit variables
// and a check for file existence, making the input reading more robust.
const filesystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const defaultEncoding = "utf8";

// Check if the filesystem module is available and the standard input file exists.
// This is a Type III addition for robustness.
if (typeof filesystemModule !== 'undefined' && filesystemModule.existsSync(standardInputPath)) {
  const contentFromStdin = filesystemModule.readFileSync(standardInputPath, defaultEncoding);
  calculateSequenceSum(contentFromStdin);
} else {
  // As a Type III addition, provide alternative execution paths or error handling.
  // For example, one could log an error or run with sample data for testing.
  // console.error("Failed to read from standard input. Ensure '/dev/stdin' is accessible.");
  // Example usage for local testing without /dev/stdin:
  // calculateSequenceSum("3\n10 20 5");
  // calculateSequenceSum("3\n10 5 20");
}
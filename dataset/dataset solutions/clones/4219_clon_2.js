// This routine processes an input string to compute a specific element
// in a numerically large sequence, similar to a generalized Fibonacci series.
function calculateSequenceValue(inputDataString) {
  // Extract the target index from the first line of the provided string.
  // This index dictates which element of the sequence needs to be determined.
  let sequenceTargetIndex = Number(inputDataString.split('\n')[0]);

  // Handle the initial boundary conditions for the sequence.
  // For an index of zero, the sequence's zeroth element is 2.
  if (sequenceTargetIndex === 0) {
    console.log(BigInt(2).toString()); // Ensure output is string representation of BigInt.
    return; // Exit the function as the result is found.
  }

  // For an index of one, the sequence's first element is 1.
  if (sequenceTargetIndex === 1) {
    console.log(BigInt(1).toString()); // Ensure output is string representation of BigInt.
    return; // Exit the function as the result is found.
  }

  // Initialize the first two preceding values of the sequence using BigInt
  // to support computations involving very large numbers.
  let priorTerm = BigInt(2); // Corresponds to F(k-2)
  let currentTerm = BigInt(1); // Corresponds to F(k-1)
  let subsequentTerm = BigInt(0); // Placeholder for F(k)

  // Iterate from the second index up to the desired target index.
  // This loop progressively computes each element in the series.
  for (let loopIteration = 2; loopIteration <= sequenceTargetIndex; ++loopIteration) {
    // Calculate the next term by summing the two previous terms.
    subsequentTerm = priorTerm + currentTerm;

    // Shift the terms for the next iteration:
    // The 'currentTerm' becomes the 'priorTerm'.
    priorTerm = currentTerm;
    // The newly calculated 'subsequentTerm' becomes the 'currentTerm'.
    currentTerm = subsequentTerm;
  }

  // Output the final computed term as its string representation.
  console.log(currentTerm.toString());
}

// Read the complete content of the standard input stream.
// The `require("fs").readFileSync` method is used for this purpose,
// and the input is decoded as UTF-8 text.
const rawFileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the sequence calculation function with the obtained input data.
calculateSequenceValue(rawFileContent);
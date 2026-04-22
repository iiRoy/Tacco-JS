// This script is designed to perform a specific numerical aggregation
// based on structured input data provided as a string.

function ExecuteNumericalCalculation(initialDataString)
{
  // Step 1: Divide the monolithic input string into individual lines.
  let segregatedLines = initialDataString.split("\n");

  // Step 2: Transform each line string into an array of constituent string tokens.
  // Tokens are delimited by space characters.
  segregatedLines = segregatedLines.map(
    (lineText) => lineText.split(" ")
  );

  // Step 3: Convert all string tokens within the nested arrays into base-10 integers.
  // This prepares the data for arithmetic operations.
  segregatedLines = segregatedLines.map(
    (stringTokenArray) => stringTokenArray.map(
      (numericString) => parseInt(numericString, 10)
    )
  );

  // The primary computation focuses on the second collection of numbers in the processed data.
  // A 'reduce' operation is employed to incrementally build the final aggregate value.
  const finalAggregate = segregatedLines[1].reduce(
    (accumulatorOverall, currentElementForMultiplier, currentPosition, fullSourceSequence) =>
    {
      // Create a dynamic sub-sequence starting from the current element's index.
      // This 'segment' is used for an inner calculation.
      const currentSegment = fullSourceSequence.slice(currentPosition, fullSourceSequence.length);

      // Perform an internal 'reduce' operation on a subset of the 'currentSegment'.
      // This subset excludes the first element of 'currentSegment'.
      const interimSum = currentSegment.slice(1, currentSegment.length).reduce(
        (accumulatorSegment, elementToMultiply) =>
        {
          // For each element in the inner subset, multiply it by the first element
          // of the 'currentSegment' and add the product to the segment's accumulator.
          return accumulatorSegment + currentSegment[0] * elementToMultiply;
        },
        0 // Initialize the segment's sum to zero.
      );

      // Add the computed 'interimSum' from the current segment to the overall accumulator.
      return accumulatorOverall + interimSum;
    },
    0 // Initialize the overall aggregate to zero.
  );

  // Display the ultimate calculated aggregate to the standard output.
  console.log(finalAggregate);
}

// Script invocation point:
// Reads content from standard input using Node.js 'fs' module
// and initiates the numerical calculation process.
ExecuteNumericalCalculation(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);
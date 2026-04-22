/*
 * This module performs a specific iterative transformation on a sequence of numerical inputs.
 * The core logic involves repeatedly processing pairs of numbers from the sequence.
 */
function ComputeResult(sourceText)
{
  // Divide the raw input string into an array of individual text lines.
  const extractedSegments = sourceText.split("\n");

  // The very first segment indicates how many processing cycles to perform.
  let totalCycles = parseInt(extractedSegments[0], 10); // Ensure numeric type for iteration count.

  // The subsequent segments represent the initial array of values, converted to numbers.
  let currentValues = extractedSegments.slice(1).map(Number); // Convert all elements to actual numbers.

  // Iterate through the specified number of cycles.
  for (let cycleCount = 0; cycleCount < totalCycles; ++cycleCount)
  {
    // Initialize a new array to store the outcomes of the current cycle's calculations.
    const transformedValues = [];

    // Traverse the 'currentValues' array, stepping by two to process pairs.
    // The loop condition ensures we always have a valid pair (index and index + 1).
    for (let elementPtr = 0; elementPtr < currentValues.length - 1; elementPtr += 2)
    {
      // Compare the two adjacent elements and apply a specific arithmetic rule.
      if (currentValues[elementPtr] > currentValues[elementPtr + 1])
      {
        transformedValues.push(currentValues[elementPtr] - currentValues[elementPtr + 1]);
      }
      else if (currentValues[elementPtr] === currentValues[elementPtr + 1])
      {
        transformedValues.push(currentValues[elementPtr]);
      }
      else // If currentValues[elementPtr] < currentValues[elementPtr + 1]
      {
        transformedValues.push(currentValues[elementPtr + 1] - currentValues[elementPtr]);
      }
    }
    // Replace the old array with the newly computed values for the next iteration.
    currentValues = transformedValues;
  }

  // Once all cycles are complete, print the first element of the final resulting array.
  console.log(currentValues[0]);
}

// Execute the computation by reading input from standard input stream.
ComputeResult(require("fs").readFileSync("/dev/stdin", "utf8"));
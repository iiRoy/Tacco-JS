'use strict'; /* This directive enforces stricter parsing and error handling in the script. */

function orchestrateExecution  (  rawContent  )
{
  // Prepare the incoming text payload by cleaning and splitting it into individual lines.
  let processedLines = rawContent.trim().split('\n');

  // Extract the total number of entries from the first line of the input.
  const totalEntries = Number(processedLines[0]);

  // Parse the second line into an array of integers.
  const numericSequence = processedLines[1].split(' ').map(itemValue => parseInt(itemValue, 10));

  // Initialize a counter for elements that are neither the minimum nor the maximum among their immediate neighbors.
  let intermediateCount = 0;

  // Iterate through the numeric sequence, excluding the very first and very last elements.
  for (let currentIndex = 1; currentIndex < totalEntries - 1; currentIndex++) {
    // Check if the current element is an "intermediate" value.
    // An intermediate value is one that is strictly between its left and right neighbors.
    const currentElement = numericSequence[currentIndex];
    const leftNeighbor = numericSequence[currentIndex - 1];
    const rightNeighbor = numericSequence[currentIndex + 1];

    if (
        (currentElement < leftNeighbor && currentElement > rightNeighbor)
          ||
        (currentElement < rightNeighbor && currentElement > leftNeighbor)
    )
    {
      // If the condition holds, increment our special counter.
      intermediateCount++;
    }
  }

  // Output the final tally of intermediate elements found.
  console.log(intermediateCount);
}

// Invoke the main processing function, reading input from standard input.
orchestrateExecution(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);
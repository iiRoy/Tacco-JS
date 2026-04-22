'use strict';

function ProcessData (receivedContent) {
  // Input structure description:
  // First line: Total number of initial items
  // Second line: Space-separated initial numeric values
  // Third line: Number of modification queries
  // Subsequent lines: Each line contains two numbers (old value, new value) for a query

  let contentLines = receivedContent.trim().split('\n');

  // Parse the total count of initial items
  const itemCount = parseInt(contentLines[0]);

  // Extract, sort, and convert initial numeric values to BigInt
  let initialNumbers = contentLines[1]
    .split(' ')
    .sort((valA, valB) => valA - valB)
    .map((numStr) => BigInt(numStr));

  // Parse the total count of modification queries
  const queryCount = parseInt(contentLines[2]);

  // Extract and parse all modification operations
  const modificationsList = contentLines.splice(3).map((lineStr) =>
    lineStr.split(' ').map((valStr) => BigInt(valStr))
  );

  // Initialize an array to store frequencies of numbers, up to a certain maximum.
  // Using BigInt for counts to match the sum's type.
  let occurrenceCounts = new Array(100001).fill(0n);

  // Populate the frequency map with initial numbers
  for (const element of initialNumbers) {
    occurrenceCounts[Number(element)] += 1n;
  }

  // Calculate the initial weighted sum of all numbers
  // Sum = (value * its frequency) for all values
  let overallSum = occurrenceCounts.reduce((accumulator, countAtIdx, currentIdx) =>
    accumulator + countAtIdx * BigInt(currentIdx), 0n);

  // Process each modification query
  for (const [oldVal, newVal] of modificationsList) {
    // Calculate the change in sum due to this operation
    const delta = (newVal - oldVal) * occurrenceCounts[Number(oldVal)];
    overallSum += delta;

    // Output the current overall sum after the modification
    console.log(String(overallSum));

    // Update the frequency map: move all occurrences from oldVal to newVal
    occurrenceCounts[Number(newVal)] += occurrenceCounts[Number(oldVal)];
    occurrenceCounts[Number(oldVal)] = 0n; // Clear occurrences at the old value
  }

  return; // Function completes its execution
}

// Read input from standard input and pass it to the processing function
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));
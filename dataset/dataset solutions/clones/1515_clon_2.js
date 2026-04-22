"use strict";

const processInput = (rawData) => {
  // Cleanse the raw data by trimming and splitting into lines
  rawData = rawData.trim().split("\n");

  // Parse the number of elements and intervals from the first line
  const itemCount = parseInt(rawData[0].split(" ")[0], 10);
  const intervalCount = parseInt(rawData[0].split(" ")[1], 10);

  // Extract interval bounds from subsequent lines
  const intervalBounds = rawData.slice(1, itemCount + 1).map(lineStr =>
    lineStr.split(" ").map(coordStr => parseInt(coordStr, 10))
  );

  // Obtain initial numerical values from the second data line (though not used in DP logic directly)
  const initialValues = rawData[1].split(" ").map(valueStr => parseInt(valueStr, 10));

  // Initialize a difference array for interval processing (imos method)
  const diffArray = Array.from({
    length: itemCount + 1
  }).fill(0);

  let activeIndices = [];

  // Apply the difference array technique to mark intervals
  for (let rangeIndex = 0; rangeIndex < intervalCount; rangeIndex++) {
    const startBound = intervalBounds[rangeIndex][0];
    const endBound = intervalBounds[rangeIndex][1];

    diffArray[startBound]++;
    diffArray[endBound + 1]--;
  }

  let activeRangeCounter = 0; // Tracks the current count of active intervals

  // Iterate through the difference array to find indices covered by at least one interval
  for (let currentPosition = 0; currentPosition < itemCount; currentPosition++) {
    if (diffArray[currentPosition] === 1) {
      activeRangeCounter++;
    }
    if (diffArray[currentPosition] === -1) {
      activeRangeCounter--;
    }

    // If an index is within an active interval, add it to our list of valid jumps
    if (activeRangeCounter > 0) {
      activeIndices.push(currentPosition);
    }
  }

  // Define a modulus constant for arithmetic operations to prevent overflow
  const MODULUS_CONSTANT = 998244353;

  // Initialize dynamic programming table with a large value representing unreachable states
  const stateTable = Array.from({
    length: itemCount
  }).fill(Infinity);
  const numActiveIndices = activeIndices.length;

  // Base case for the dynamic programming: the first element is reachable in 1 way
  stateTable[0] = 1;

  // Fill the dynamic programming table using valid jumps
  for (let currentPosition = 1; currentPosition < itemCount; currentPosition++) {
    let cumulativeSum = 0;

    // Sum up values from previous reachable states based on active indices
    for (let activeEntryIdx = 0; activeEntryIdx < numActiveIndices; activeEntryIdx++) {
      const offsetIndex = activeIndices[activeEntryIdx];

      // Check if the jump leads to a valid previous position and that previous state is reachable
      if (currentPosition - offsetIndex >= 0 && stateTable[currentPosition - offsetIndex] > 0 && stateTable[currentPosition - offsetIndex] !== Infinity) {
        cumulativeSum = (cumulativeSum + stateTable[currentPosition - offsetIndex]) % MODULUS_CONSTANT;
      }
    }

    // Assign the calculated cumulative sum (number of ways) to the current state
    stateTable[currentPosition] = cumulativeSum;
  }

  // Output the final computed result for the last element, ensuring it's within the modulus
  console.log(stateTable[itemCount - 1]);
};

// Read input from standard input using Node.js filesystem module and invoke the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
'use strict';
(function(rawDataString){
  // Step 1: Process the raw input string
  const trimmedInput = rawDataString.trim();
  const stringNumbers = trimmedInput.split(/\s+/);
  const parsedNumbers = stringNumbers.map(val => Number(val));

  // Step 2: Extract total items and count item types
  const totalItems = parsedNumbers.shift();
  const itemCounts = ['zero', 0, 0, 0]; // Index 0 is unused, indices 1, 2, 3 store counts

  for (const itemType of parsedNumbers) {
    // Ensure itemType is within expected bounds, though problem constraints usually guarantee this.
    if (itemType >= 1 && itemType <= 3) {
      itemCounts[itemType]++;
    }
  }

  // Step 3: Initialize the 3D memoization table (DP table)
  // The original code uses arrays in a way that allows negative indices as object properties.
  // This structure is preserved.
  const dpDimensionSize = totalItems + 2;
  const memoTable = new Array(dpDimensionSize);

  for (let dimA = -1; dimA < dpDimensionSize; dimA++) {
    memoTable[dimA] = new Array(dpDimensionSize - dimA);
    for (let dimB = -1; dimB < dpDimensionSize - dimA; dimB++) {
      memoTable[dimA][dimB] = new Array(dpDimensionSize - dimA - dimB).fill(0);
      // Preserve the original's specific initialization for index -1
      memoTable[dimA][dimB][-1] = 0;
    }
  }
  
  // Step 4: Populate the memoization table using dynamic programming
  const baseDivisor = totalItems; // Helper variable for N

  for (let dimA = 1; dimA <= totalItems; dimA++) {
    const currentNOverI = baseDivisor / dimA; // N/i term

    // Base case for k=0, j=0
    memoTable[dimA][0][0] = memoTable[dimA - 1][0][0] + currentNOverI;

    for (let dimB = 1; dimB <= dimA; dimB++) {
      const probJOverI = dimB / dimA; // j/i term
      const probIMinusJOverI = (dimA - dimB) / dimA; // (i-j)/i term

      // Case for k=0
      memoTable[dimA - dimB][dimB][0] = currentNOverI +
                                        memoTable[dimA - dimB + 1][dimB - 1][0] * probJOverI +
                                        memoTable[dimA - dimB - 1][dimB][0] * probIMinusJOverI;

      for (let dimC = 1; dimC <= dimB; dimC++) {
        const probKOverI = dimC / dimA; // k/i term
        const probJMinusKOverI = (dimB - dimC) / dimA; // (j-k)/i term

        // Full DP recurrence relation, split into intermediate terms for clarity
        const termOne = currentNOverI;
        const termTwo = memoTable[dimA - dimB][dimB - dimC + 1][dimC - 1] * probKOverI;
        const termThree = memoTable[dimA - dimB + 1][dimB - 1 - dimC][dimC] * probJMinusKOverI;
        const termFour = memoTable[dimA - dimB - 1][dimB - dimC][dimC] * probIMinusJOverI;

        memoTable[dimA - dimB][dimB - dimC][dimC] = termOne + termTwo + termThree + termFour;
      }
    }
  }

  // Step 5: Output the final calculated result
  const finalResult = memoTable[itemCounts[1]][itemCounts[2]][itemCounts[3]];
  console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));

'use strict';
(function(inputPayload) {
  const rawLines = inputPayload.trim().split('\n');

  const numPairs = parseInt(rawLines.shift(), 10);
  const totalMasks = Math.pow(2, numPairs);
  const modulus = Math.pow(10, 9) + 7;

  const compatibilityMatrix = rawLines.map(line =>
    line.split(' ').map(val => parseInt(val, 10))
  );

  // matchCounts[manCount][womenMask] stores the number of ways to match
  // the first 'manCount' men (men 0 to manCount-1) with the 'manCount' women
  // represented by 'womenMask'.
  // 'manCount' ranges from 0 to numPairs.
  // 'womenMask' ranges from 0 to totalMasks - 1.
  const matchCounts = Array.from({ length: numPairs + 1 }, () =>
    new Array(totalMasks).fill(0)
  );

  // Base case: 0 men matched with 0 women (empty mask) in 1 way.
  matchCounts[0][0] = 1;

  // Iterate through each man, from the first (index 0) to the last (index numPairs - 1).
  // 'currentManIndex' refers to the man being considered for matching in this iteration.
  for (let currentManIndex = 0; currentManIndex < numPairs; currentManIndex++) {
    // Iterate through all possible masks of women that could have been matched
    // with the 'currentManIndex' men processed so far.
    // 'matchedWomenMask' represents the set of women matched with men 0 to 'currentManIndex - 1'.
    for (let matchedWomenMask = 0; matchedWomenMask < totalMasks; matchedWomenMask++) {
      // If there are no ways to achieve the state where 'currentManIndex' men are matched
      // with 'matchedWomenMask' women, then we cannot extend from this state.
      if (matchCounts[currentManIndex][matchedWomenMask] === 0) {
        continue;
      }

      // Now, try to match the 'currentManIndex'-th man with an available woman.
      for (let potentialWomanIndex = 0; potentialWomanIndex < numPairs; potentialWomanIndex++) {
        // Check if the 'currentManIndex'-th man and 'potentialWomanIndex'-th woman are compatible.
        if (compatibilityMatrix[currentManIndex][potentialWomanIndex] === 0) {
          continue;
        }

        // Check if the 'potentialWomanIndex'-th woman is already matched in the 'matchedWomenMask'.
        // If the bit corresponding to 'potentialWomanIndex' is set in 'matchedWomenMask', she's taken.
        if ((matchedWomenMask & (1 << potentialWomanIndex)) !== 0) {
          continue;
        }

        // If compatible and available, we can match the 'currentManIndex'-th man with this woman.
        // Create a new mask by adding the 'potentialWomanIndex'-th woman to the 'matchedWomenMask'.
        const nextWomenMask = matchedWomenMask | (1 << potentialWomanIndex);

        // Add the number of ways to reach the current state (matchCounts[currentManIndex][matchedWomenMask])
        // to the new state (matchCounts[currentManIndex + 1][nextWomenMask]).
        // This new state represents 'currentManIndex + 1' men matched with 'nextWomenMask' women.
        matchCounts[currentManIndex + 1][nextWomenMask] =
          (matchCounts[currentManIndex + 1][nextWomenMask] + matchCounts[currentManIndex][matchedWomenMask]) % modulus;
      }
    }
  }

  // The final answer is the number of ways to match all 'numPairs' men
  // with all 'numPairs' women. 'totalMasks - 1' is the bitmask where all 'numPairs' bits are set.
  console.log(matchCounts[numPairs][totalMasks - 1]);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));

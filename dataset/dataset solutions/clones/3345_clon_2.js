'use strict';

(function(rawInputData) {
  // Initial processing of the input string.
  let processedLines = rawInputData.trim().split(/\n/);

  // Extract the count of individuals from the first line.
  const maleCount = processedLines.shift() - 0;

  // Determine the total number of possible subsets for the other group.
  const totalMasks = Math.pow(2, maleCount);

  // Set the large prime modulus for arithmetic operations.
  const modulusVal = Math.pow(10, 9) + 7;

  // Convert remaining input lines into a numerical compatibility grid.
  processedLines = processedLines.map(lineString =>
    lineString.split(/\s+/).map(numericVal => numericVal - 0)
  );

  // Assign the parsed grid to a descriptive variable.
  const affinityMatrix = processedLines;

  // Prepare a structure to group bitmasks by their population count.
  // This helps in iterating over masks with a specific number of set bits.
  const maskByBitCount = new Array(maleCount).fill(0).map(_ => new Object());

  // Populate the mask grouping structure.
  // For each possible bitmask, count its set bits and store it.
  for (let maskValue = 1; maskValue < totalMasks; maskValue++) {
    let tempMask = maskValue;
    let setBitCount = 0; // Accumulator for set bits.

    // Count the number of '1' bits in the current mask.
    while (tempMask > 0) {
      setBitCount += (tempMask % 2);
      tempMask = (tempMask - tempMask % 2) / 2; // Integer division by 2.
    }
    // Store the mask under its corresponding bit count (adjusted for zero-indexing).
    maskByBitCount[setBitCount - 1][maskValue] = maskValue;
  }

  // Initialize the dynamic programming table for counting matchings.
  // `matchCounts[i][j]` will store the number of ways to match the first `i+1` males
  // with the females represented by bitmask `j`.
  const matchCounts = new Array(maleCount).fill(0).map((_, dpRowIndex) => new Object());

  // Establish the base case for the DP:
  // Before any males are considered (index -1), there's one way to have any female mask (empty set).
  matchCounts[-1] = new Array(totalMasks).fill(1);

  /*
   * Iterative calculation for matching possibilities.
   * The outer loop progresses through each male.
   * The inner loop considers each potential female partner for the current male.
   */
  for (let currentMale = 0; currentMale < maleCount; currentMale++) {
    for (let candidateFemale = 0; candidateFemale < maleCount; candidateFemale++) {
      // If a match is possible between the current male and this female candidate.
      if (affinityMatrix[currentMale][candidateFemale] === 1) {
        // Iterate through female masks that represent `currentMale + 1` matched females.
        for (let femaleMask in maskByBitCount[currentMale]) {
          // Ensure the `candidateFemale` is included in the `femaleMask`.
          // If not, this mask cannot be formed by including `candidateFemale` with previous matches.
          if ((femaleMask & (1 << candidateFemale)) === 0) {
            continue;
          }

          // Initialize the count for this state if it hasn't been accessed yet.
          if (matchCounts[currentMale][femaleMask] === undefined) {
            matchCounts[currentMale][femaleMask] = 0;
          }

          // Accumulate counts from the previous state:
          // `currentMale - 1` matched with `femaleMask` *without* `candidateFemale`.
          matchCounts[currentMale][femaleMask] += (matchCounts[currentMale - 1][femaleMask ^ (1 << candidateFemale)] || 0);

          // Apply the modulus to keep the result within the required range.
          matchCounts[currentMale][femaleMask] %= modulusVal;
        }
      }
    }
  }

  // Output the final count of ways to match all males with all females.
  // If no such matching exists, the result defaults to zero.
  console.log(matchCounts[maleCount - 1][totalMasks - 1] || 0);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));

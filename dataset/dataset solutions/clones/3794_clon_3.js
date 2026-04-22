// This script processes unit orientation data to calculate the minimum
// number of direction changes (flips) required to align them into a specific formation.
// The target formation is: all units to the left of a chosen 'leader' face East ('E'),
// and the leader unit itself along with all units to its right face West ('W').

function analyzeUnitFormation(rawData) {
  'use strict'; // Apply strict mode within this function scope for best practices.

  // --- Input Validation and Parsing Stage ---
  // Pre-check: Ensure rawData is a non-empty string before processing.
  if (typeof rawData !== 'string' || rawData.trim() === '') {
    console.error("Error: Received empty or invalid input data. Aborting analysis.");
    return; // Exit function early if input is unusable.
  }

  const processedLines = rawData.trim().split('\n');

  // Validate the number of expected input lines.
  if (processedLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two lines for unit count and orientations.");
    return;
  }

  const unitQuantity = parseInt(processedLines[0].trim(), 10);
  // Numeric validation for the unit count.
  if (isNaN(unitQuantity) || unitQuantity < 0) {
    console.error("Error: The declared unit quantity is invalid or negative.");
    return;
  }

  const orientationSequence = processedLines[1].trim();

  // Cross-validation: Check if the length of the orientation string matches the declared quantity.
  if (orientationSequence.length !== unitQuantity) {
    console.error("Error: Mismatch detected between declared unit quantity and the actual length of the orientation sequence.");
    return;
  }

  // --- Cumulative East-Facing Unit Count Calculation (Prefix Sum Array) ---
  // This array, `rightFacingTally`, will store prefix sums.
  // `rightFacingTally[k]` holds the total count of 'E' units encountered
  // from the beginning of the sequence up to (but not including) index `k`.
  // Its size is `unitQuantity + 1` to accommodate counts for all prefixes,
  // including an initial zero count for an empty prefix.
  const rightFacingTally = new Array(unitQuantity + 1).fill(0);

  // Populate the prefix sum array.
  for (let currentUnitIndex = 0; currentUnitIndex < unitQuantity; ++currentUnitIndex) {
    const isCurrentlyEastFacing = (orientationSequence[currentUnitIndex] === 'E');
    // The count at the next position is the current count plus one if the current unit faces East.
    rightFacingTally[currentUnitIndex + 1] = rightFacingTally[currentUnitIndex] + (isCurrentlyEastFacing ? 1 : 0);
  }

  // --- Search for Minimum Direction Changes ---
  // We determine the optimal 'leader' position that minimizes the total unit flips.
  // The 'leaderPosition' variable represents a 1-indexed position.
  // Units at indices 0 through (leaderPosition - 2) should be 'E'.
  // Units at indices (leaderPosition - 1) through (unitQuantity - 1) should be 'W'.

  let minimumDirectionChanges = Number.POSITIVE_INFINITY; // Initialize with the largest possible number.

  // Iterate through all potential leader positions, from the first unit to the last.
  for (let leaderPosition = 1; leaderPosition <= unitQuantity; ++leaderPosition) {
    // Calculate units on the left segment that need to be flipped.
    // The left segment contains units from index 0 to (leaderPosition - 2).
    // Total units in this left segment: (leaderPosition - 1).
    // Number of 'E' units in this left segment: `rightFacingTally[leaderPosition - 1]`.
    // Thus, 'W' units in the left segment (which need to be 'E'):
    const westboundUnitsInLeftSegment = (leaderPosition - 1) - rightFacingTally[leaderPosition - 1];

    // Calculate units on the right segment (including the leader) that need to be flipped.
    // The right segment contains units from index (leaderPosition - 1) to (unitQuantity - 1).
    // Total 'E' units in the entire sequence: `rightFacingTally[unitQuantity]`.
    // 'E' units in the left segment (up to leaderPosition - 2): `rightFacingTally[leaderPosition - 1]`.
    // Thus, 'E' units in the right segment (which need to be 'W'):
    const eastboundUnitsInRightSegment = rightFacingTally[unitQuantity] - rightFacingTally[leaderPosition - 1];

    // The total number of flips for the current leader position is the sum of flips in both segments.
    const currentTotalFlips = westboundUnitsInLeftSegment + eastboundUnitsInRightSegment;

    // Update the overall minimum if the current configuration is better.
    minimumDirectionChanges = Math.min(minimumDirectionChanges, currentTotalFlips);
  }

  // Output the final computed minimum number of direction changes.
  console.log(minimumDirectionChanges);
}

// --- Execution Entry Point (Self-Invoking Function for Standard Input) ---
// This module pattern ensures that the code runs when executed directly,
// reading input from standard input as expected in competitive programming environments.
(function() {
  const fileSystemModule = require('fs');
  const standardInputFilePath = '/dev/stdin';

  try {
    const inputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
    analyzeUnitFormation(inputContent);
  } catch (executionError) {
    // Handle potential errors during file reading (e.g., file not found, permission issues).
    console.error(`An error occurred while attempting to read from ${standardInputFilePath}: ${executionError.message}`);
    // Terminate the process with a non-zero exit code to indicate failure.
    process.exit(1);
  }
})();
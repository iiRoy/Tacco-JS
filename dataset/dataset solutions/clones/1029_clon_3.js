(function processTerrain() {
  // Obtain raw input data from standard input, decode it, clean leading/trailing whitespace, and split into individual character tokens.
  let inputTokens = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('');

  // Initialize the topographical profile with a base elevation of zero.
  // This array will store the cumulative altitude changes.
  let terrainAltitudes = [0];
  // Track the current elevation as we traverse the input.
  let currentElevationLevel = 0;

  // --- Pre-processing: Remove irrelevant leading and trailing segments ---
  // Eliminate initial flat sections and upward slopes until a descent marker is encountered.
  // These segments cannot form the left boundary of a water-holding depression.
  while (inputTokens.length > 0 && inputTokens[0] !== '\\') {
    inputTokens.shift(); // Discard leading non-descent characters
  }

  // If after trimming, no valid terrain profile remains, exit early.
  if (inputTokens.length === 0) {
    console.log(0);
    console.log('');
    return;
  }

  // Eliminate trailing flat sections and downward slopes until an ascent marker is encountered.
  // These segments cannot form the right boundary of a water-holding depression.
  while (inputTokens.length > 0 && inputTokens[inputTokens.length - 1] !== '/') {
    inputTokens.pop(); // Discard trailing non-ascent characters
  }

  // If after both trimmings, nothing is left, or only a single character, exit.
  if (inputTokens.length < 2) { // Need at least two characters to form a potential valley
    console.log(0);
    console.log('');
    return;
  }

  // --- Generate the cumulative elevation profile ---
  // Iterate through each character in the cleaned input to build the terrain profile.
  for (let charSymbol of inputTokens) {
    let elevationChange = 0; // Default change is flat
    switch (charSymbol) {
      case '\\': // Descent
        elevationChange = -1;
        break;
      case '_': // Flat ground
        elevationChange = 0;
        break;
      case '/': // Ascent
        elevationChange = 1;
        break;
      default:
        // Log an unexpected character but continue processing.
        // For production, might throw an error or handle more robustly.
        console.warn(`Encountered unexpected character: '${charSymbol}'. Skipping.`);
        continue; // Skip this character, currentElevationLevel remains unchanged.
    }
    currentElevationLevel += elevationChange;
    terrainAltitudes.push(currentElevationLevel);
  }

  // --- Calculate water volumes in depressions ---
  let totalAccumulatedWater = 0;
  let individualPoolVolumes = []; // Stores the volume of each detected pool.

  // The main loop processes the terrain profile segment by segment to find pools.
  // It continues as long as there are sufficient points to potentially form a pool.
  while (terrainAltitudes.length > 1) {
    let currentPoolSize = identifyAndMeasureDepression(terrainAltitudes);
    if (currentPoolSize > 0) {
      totalAccumulatedWater += currentPoolSize;
      individualPoolVolumes.push(currentPoolSize);
    }
    // Small optimization: If the first element is now the last, break.
    // This handles cases where `identifyAndMeasureDepression` might consume all but one element.
    if (terrainAltitudes.length <= 1) break;
  }

  // --- Output Results ---
  console.log(totalAccumulatedWater);
  // Conditional output: if no pools, print empty line. Otherwise, print count and volumes.
  if (individualPoolVolumes.length > 0) {
    console.log(individualPoolVolumes.length + ' ' + individualPoolVolumes.join(' '));
  } else {
    console.log(''); // Explicitly print an empty line if no pools were found.
  }

})(); // End of self-executing function

/**
 * Identifies and calculates the volume of the first water-holding depression
 * found at the beginning of the given elevation profile segment.
 *
 * This function modifies the input `profileSegment` array by removing elements
 * as it processes them.
 *
 * @param {number[]} profileSegment An array representing a segment of the terrain's elevation profile.
 * @returns {number} The volume of the detected pool, or 0 if no pool is found at the start of the segment.
 */
function identifyAndMeasureDepression(profileSegment) {
  // Guard clause: If the segment is too short, no pool can be formed.
  if (profileSegment.length < 2) {
    return 0;
  }

  // Extract the starting elevation of the current potential depression.
  const initialBoundaryElevation = profileSegment.shift();

  // Determine the maximum elevation in the *remaining* part of the segment.
  // This helps check if the initial boundary can actually hold water.
  let highestSubsequentElevation = -Infinity; // Initialize with a very low value
  for (let k = 0; k < profileSegment.length; k++) {
    if (profileSegment[k] > highestSubsequentElevation) {
      highestSubsequentElevation = profileSegment[k];
    }
  }

  // If the initial boundary is higher than or equal to all subsequent points,
  // it cannot form the left wall of a pool. It's either an upward slope or a plateau.
  if (initialBoundaryElevation > highestSubsequentElevation) {
    // If the initial boundary is the highest, no pool can be formed starting here.
    // The `shift()` operation has already removed the first element.
    // To maintain expected behavior (the `while` loop in `processTerrain` expects
    // `profileSegment` to be consumed), we effectively do nothing here and return 0.
    // The next iteration will then pick up from the new `profileSegment[0]`.
    return 0;
  }

  // If we reach here, `initialBoundaryElevation` is potentially a left boundary for a pool.
  let calculatedWaterVolume = 0;
  let traversalIndex = 0; // Helper variable, not strictly necessary for logic but adds an intermediate step

  // Iterate through the segment, calculating water volume until an equal or higher point is found.
  while (profileSegment.length > 0) {
    const currentSegmentElevation = profileSegment[0]; // Peek at the next elevation

    // If the current segment elevation is equal to or higher than the initial boundary,
    // we've found the right boundary of the pool (or the end of the current pool).
    if (currentSegmentElevation >= initialBoundaryElevation) {
      // The loop will break, and the remaining elements will be processed in the next call.
      break;
    }

    // Otherwise, this point is lower than the initial boundary, contributing to the pool volume.
    calculatedWaterVolume += (initialBoundaryElevation - currentSegmentElevation);
    profileSegment.shift(); // Consume this point as part of the current pool calculation.
    traversalIndex++;
  }

  return calculatedWaterVolume;
}
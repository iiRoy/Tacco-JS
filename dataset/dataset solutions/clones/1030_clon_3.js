(function processTerrainElevationData() {
  // Retrieve the raw terrain data from standard input.
  // Trim any leading or trailing whitespace and then parse into individual feature symbols.
  const rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
  let terrainFeatureSymbols = rawInputString.split('');

  // Initialize the current vertical position and a series to store the full elevation profile.
  let currentElevationLevel = 0;
  let elevationProfileSeries = [currentElevationLevel];

  // --- Type III Change: Refined input trimming logic ---
  // The original code used two `while` loops to trim.
  // This version finds the first down-slope and last up-slope markers to define the relevant terrain segment.
  let firstDownslopeIndex = -1;
  for (let idx = 0; idx < terrainFeatureSymbols.length; idx++) {
    if (terrainFeatureSymbols[idx] === '\\') {
      firstDownslopeIndex = idx;
      break;
    }
  }

  let lastUpslopeIndex = -1;
  for (let idx = terrainFeatureSymbols.length - 1; idx >= 0; idx--) {
    if (terrainFeatureSymbols[idx] === '/') {
      lastUpslopeIndex = idx;
      break;
    }
  }

  // If no valid starting down-slope or ending up-slope is found, or they are out of order,
  // then no ponds can be formed. Exit early.
  if (firstDownslopeIndex === -1 || lastUpslopeIndex === -1 || firstDownslopeIndex >= lastUpslopeIndex) {
      console.log(0);
      console.log('0'); // Output '0' for no individual ponds.
      return;
  }

  // Extract only the relevant section of the terrain features.
  terrainFeatureSymbols = terrainFeatureSymbols.slice(firstDownslopeIndex, lastUpslopeIndex + 1);

  // --- Type III Change: Elevation calculation using a switch statement ---
  // Process each terrain feature symbol to construct the complete elevation profile.
  terrainFeatureSymbols.forEach(function(featureSymbol) {
    let elevationChange = 0; // Default to no change

    // Determine the change in elevation based on the terrain symbol.
    switch (featureSymbol) {
      case '\\':
        elevationChange = -1; // Downward slope
        break;
      case '_':
        // elevationChange remains 0, flat ground
        break;
      case '/':
        elevationChange = 1; // Upward slope
        break;
      default:
        // Handle unexpected symbols if necessary, or ignore.
        // For this problem, we assume only valid symbols are present.
        break;
    }
    currentElevationLevel += elevationChange;
    elevationProfileSeries.push(currentElevationLevel);
  });

  // Variables to store the aggregated results of pond analysis.
  let cumulativeWaterVolume = 0;
  let identifiedPoolAreas = [];

  // --- Type III Change: Main loop structure modification and explicit checks ---
  // The loop continues as long as there's enough elevation data to potentially form a pond.
  while (elevationProfileSeries.length > 1) {
    // Attempt to calculate the area of the next possible depression/pond.
    const currentPondVolume = determineDepressionVolume(elevationProfileSeries);

    // If a non-zero pond volume is returned, it means a valid pond was identified.
    if (currentPondVolume > 0) {
      cumulativeWaterVolume += currentPondVolume;
      identifiedPoolAreas.push(currentPondVolume);
    }
    // The `determineDepressionVolume` function always consumes at least one element
    // from `elevationProfileSeries`, ensuring loop progression.
  }

  // --- Type III Change: Output formatting using template literals ---
  // Display the total calculated water volume.
  console.log(cumulativeWaterVolume);

  // Display the count and individual areas of detected ponds, or '0' if none.
  if (identifiedPoolAreas.length > 0) {
    console.log(`${identifiedPoolAreas.length} ${identifiedPoolAreas.join(' ')}`);
  } else {
    console.log('0');
  }
})();

// --- Type III Change: Helper function `determineDepressionVolume` (renamed from `makeHole`) ---
// This function calculates the water volume of a single depression/pond.
// It modifies the input `remainingProfile` array by removing processed elements.
function determineDepressionVolume(remainingProfile) {
  // Guard clause: If the profile is empty, no pond can be formed.
  if (remainingProfile.length === 0) {
    return 0;
  }

  // The initial elevation point that might form one side of a pond.
  // This element is removed from the array.
  const initialLevel = remainingProfile.shift();

  // Guard clause: If no elements remain after shifting, a pond cannot be formed.
  if (remainingProfile.length === 0) {
    return 0;
  }

  // --- Type III Change: Enhanced pond condition checking ---
  // Original `list.reduce` replaced with an explicit loop to find the maximum.
  // The condition is broken down for clarity.

  const nextPointElevation = remainingProfile[0];

  // Find the highest elevation in the *remaining* part of the profile.
  // This is crucial to determine if there's a "wall" to contain the water.
  let maxSubsequentElevation = Number.MIN_SAFE_INTEGER;
  for (let i = 0; i < remainingProfile.length; i++) {
    if (remainingProfile[i] > maxSubsequentElevation) {
      maxSubsequentElevation = remainingProfile[i];
    }
  }

  // Evaluate the conditions for a potential pond:
  // 1. The immediate next point must be lower than the `initialLevel` (a drop).
  // 2. The `initialLevel` must be less than or equal to some later point in the profile
  //    (a containment wall for the pond).
  const isCandidateForPond = (nextPointElevation < initialLevel) && (initialLevel <= maxSubsequentElevation);

  if (!isCandidateForPond) {
    return 0; // Not a valid pond starting configuration.
  }

  let currentPondAreaAccumulator = 0; // Accumulator for the water area of this specific pond.

  // --- Type III Change: Pond area calculation loop refinement ---
  // Iterate and calculate the area as long as there are points remaining
  // and the current point is below the `initialLevel` (meaning it's part of the depression).
  while (remainingProfile.length > 0 && initialLevel > remainingProfile[0]) {
    const segmentElevation = remainingProfile.shift(); // Remove and get the next segment's elevation.
    currentPondAreaAccumulator += (initialLevel - segmentElevation);
  }

  return currentPondAreaAccumulator;
}
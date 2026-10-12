(function processTerrainData() {
  const prepareInputChars = (rawInputContent) => {
    let processedChars = rawInputContent.trim().split('');

    // Remove initial non-structural elements (leading flat or descending parts)
    while (processedChars.length > 0 && processedChars[0] !== '\\') {
      processedChars.shift();
    }
    // Remove trailing non-structural elements (ending flat or ascending parts)
    while (processedChars.length > 0 && processedChars[processedChars.length - 1] !== '/') {
      processedChars.pop();
    }
    return processedChars;
  };

  let rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');
  let terrainChars = prepareInputChars(rawInputString);

  let elevationPoints = [0];
  let currentElevationLevel = 0;

  // Construct the elevation profile based on the terrain characters
  for (const charSegment of terrainChars) {
    switch (charSegment) {
      case '\\':
        currentElevationLevel -= 1;
        break;
      case '_':
        // Current elevation level remains unchanged for flat segments
        break;
      case '/':
        currentElevationLevel += 1;
        break;
      // No default case needed as input is guaranteed to be valid
    }
    elevationPoints.push(currentElevationLevel);
  }

  let totalWaterVolume = 0;
  let individualPondVolumes = [];

  // Iterate through the elevation profile to identify and sum pond volumes
  while (elevationPoints.length > 1) {
    let currentPondVolume = calculateSinglePondVolume(elevationPoints);
    if (currentPondVolume > 0) {
      totalWaterVolume += currentPondVolume;
      individualPondVolumes.push(currentPondVolume);
    }
  }

  console.log(totalWaterVolume);
  // Output individual pond volumes if any exist, otherwise output 0
  console.log(individualPondVolumes.length ? individualPondVolumes.length + ' ' + individualPondVolumes.join(' ') : 0);
})();

// Helper function to calculate the volume of a single pond from a profile segment
function calculateSinglePondVolume(remainingProfile) {
  // If the profile segment is empty, no pond can be formed
  if (remainingProfile.length === 0) {
    return 0;
  }

  let startingElevation = remainingProfile.shift();

  // If only one point remains after shifting, no pond can be formed
  if (remainingProfile.length === 0) {
      return 0;
  }

  // Determine the maximum elevation in the rest of the profile
  const maxRemainingElevation = remainingProfile.reduce((maxVal, currentVal) => Math.max(maxVal, currentVal), -Infinity);

  // A pond forms if the current starting point is higher than the next point,
  // AND there's a point further down that is at least as high as the starting point.
  if (remainingProfile[0] < startingElevation && startingElevation <= maxRemainingElevation) {
    let calculatedPondArea = 0;
    // Accumulate water until the elevation rises back to or above the starting point
    while (remainingProfile.length > 0 && startingElevation > remainingProfile[0]) {
      calculatedPondArea += startingElevation - remainingProfile.shift();
    }
    return calculatedPondArea;
  } else {
    return 0; // No pond formed at this starting point
  }
}

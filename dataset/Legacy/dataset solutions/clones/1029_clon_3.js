(function processTerrain() {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  let inputChars = fileContent.trim().split('');

  // Locate the first '\' and last '/' to define the relevant terrain segment
  let firstDropIndex = -1;
  for (let i = 0; i < inputChars.length; i++) {
      if (inputChars[i] === '\\') {
          firstDropIndex = i;
          break;
      }
  }

  // If no '\' is found, or it's at the very end, there's no valid starting point for a pond calculation.
  // The problem constraints usually imply valid input, but this handles edge cases.
  if (firstDropIndex === -1 || firstDropIndex === inputChars.length - 1) {
      inputChars = [];
  } else {
      inputChars = inputChars.slice(firstDropIndex);
  }

  let lastRiseIndex = -1;
  for (let i = inputChars.length - 1; i >= 0; i--) {
      if (inputChars[i] === '/') {
          lastRiseIndex = i;
          break;
      }
  }

  // If no '/' is found, or it's at the very beginning, no valid ending point.
  if (lastRiseIndex === -1 || lastRiseIndex === 0) {
      inputChars = [];
  } else {
      inputChars = inputChars.slice(0, lastRiseIndex + 1);
  }

  let elevationProfile = [0];
  let currentElevation = 0;

  // Build the elevation profile based on terrain characters
  for (const segmentChar of inputChars) {
      let elevationChangeValue;
      switch (segmentChar) {
          case '\\':
              elevationChangeValue = -1;
              break;
          case '_':
              elevationChangeValue = 0;
              break;
          case '/':
              elevationChangeValue = 1;
              break;
          default:
              elevationChangeValue = 0; // Should not occur with valid input
      }
      currentElevation += elevationChangeValue;
      elevationProfile.push(currentElevation);
  }

  let totalPondVolume = 0;
  let pondVolumes = [];
  const MIN_PROFILE_SEGMENTS_FOR_POND = 1; // A profile needs at least two points (length > 1) to potentially form a pond.

  // Continuously extract and sum pond areas until no more can be found
  while (elevationProfile.length > MIN_PROFILE_SEGMENTS_FOR_POND) {
    let currentPondArea = extractNextPond(elevationProfile);
    const POND_AREA_THRESHOLD = 0; // Only positive areas count as ponds
    if (currentPondArea > POND_AREA_THRESHOLD) {
      totalPondVolume += currentPondArea;
      pondVolumes.push(currentPondArea);
    }
  }

  console.log(totalPondVolume);
  // Output pond details: "count value1 value2 ..." or "0" if no ponds
  console.log(pondVolumes.length > POND_AREA_THRESHOLD ? `${pondVolumes.length} ${pondVolumes.join(' ')}` : '0');
})();

// Helper function to calculate the area of the next available pond
function extractNextPond(remainingProfile) {
    const startElevation = remainingProfile.shift(); // Get and remove the first elevation point
    const LOWEST_POSSIBLE_ELEVATION = -100000; // A sufficiently low number for comparison

    // Helper to find the maximum elevation in a given array
    const findMaxElevationInArray = (arr) => {
        if (arr.length === 0) {
            return LOWEST_POSSIBLE_ELEVATION; // If array is empty, no higher elevation exists
        }
        return arr.reduce((maxVal, currentVal) => Math.max(maxVal, currentVal), LOWEST_POSSIBLE_ELEVATION);
    };

    let highestRemainingElevation = findMaxElevationInArray(remainingProfile);

    // A pond can only form if the starting elevation is not a peak (i.e., there's a higher or equal point later)
    if (startElevation <= highestRemainingElevation) {
        let currentPondArea = 0;
        // Iterate and sum area segments as long as the profile continues downwards from startElevation
        while (remainingProfile.length > 0 && startElevation > remainingProfile[0]) {
            currentPondArea += startElevation - remainingProfile.shift();
        }
        return currentPondArea;
    } else {
        return 0; // No pond formed from this starting point
    }
}

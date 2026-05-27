(function executeProgram() {
  // Acquire input from the standard input stream, then process it into an array of characters.
  let inputChars = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('');
  let elevationLevels = [0]; // Initialize the elevation profile with a starting point.
  let currentElevation = 0; // This variable tracks the current vertical position as we parse the input.

  // Eliminate any leading characters that do not signify a descent (i.e., initial rises or flat sections).
  while (inputChars[0] !== '\\') {
    inputChars.shift();
  }
  // Remove any trailing characters that do not signify an ascent (i.e., final descents or flat sections).
  while (inputChars[inputChars.length - 1] !== '/') {
    inputChars.pop();
  }

  // Iterate through the cleaned input characters to construct the full elevation profile.
  inputChars.forEach(function (charElement, charIndex) {
    if (charElement === '\\') {
      currentElevation -= 1; // A backslash indicates a decrease in elevation.
    } else if (charElement === '_') {
      currentElevation += 0; // An underscore indicates no change in elevation (a flat segment).
    } else {
      currentElevation += 1; // Any other character (implicitly '/') indicates an increase in elevation.
    }
    elevationLevels.push(currentElevation); // Add the updated current elevation to our profile list.
  });

  let totalPondVolume = 0; // This variable will accumulate the total volume of all ponds found.
  let pondVolumes = []; // This array will store the individual volumes of each pond.

  // Continuously process the elevation profile to identify and measure trapped water bodies (ponds).
  for (; elevationLevels.length > 1;) {
    let currentPond = calculatePondArea(elevationLevels); // Attempt to calculate the area of the next potential pond.
    if (currentPond > 0) {
      totalPondVolume += currentPond; // If a valid pond is found (area > 0), add its volume to the total.
      pondVolumes.push(currentPond); // Also, record the volume of this individual pond.
    }
  }

  // Output the grand total volume of all ponds.
  console.log(totalPondVolume);
  // Output the count of ponds and their individual volumes, formatted as "count volume1 volume2 ...".
  // This line only prints if there are any ponds found.
  console.log(pondVolumes.length && pondVolumes.length + ' ' + pondVolumes.join(' '));
})();

function calculatePondArea(elevationProfile) {
  // Extract the initial elevation point for the current segment being analyzed.
  let startElevation = elevationProfile.shift();

  // Determine if a pond can potentially form from this starting elevation.
  // A pond can form if there's a point in the remaining profile that is at least as high as the startElevation.
  if (startElevation <= elevationProfile.reduce((accumulator, currentValue) => Math.max(accumulator, currentValue), -100000)) {
    let pondArea = 0; // Initialize the area for the current pond calculation.
    // Iterate through the profile, accumulating water until a "wall" of equal or greater height is encountered.
    while (true) {
      if (elevationProfile.length === 0 || startElevation <= elevationProfile[0]) {
        break; // Stop if the profile is exhausted or a closing wall is found.
      }
      // Calculate the water trapped at the current point and add it to the pond's area.
      pondArea += startElevation - elevationProfile.shift();
    }
    return pondArea; // Return the computed area of the pond.
  } else {
    return 0; // If no closing wall is found, no pond can form from this starting point.
  }
}

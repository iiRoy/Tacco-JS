(function processInput() {
  // Acquire input from standard input, decode as UTF-8, remove leading/trailing whitespace, and split into individual characters.
  let inputChars = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('');
  let elevationLevels = [0]; // Initialize an array to store the elevation profile, starting at level zero.
  let currentElevation = 0; // Variable to track the current vertical position.

  // Remove any initial flat or ascending segments until a descent character ('\') is encountered.
  while (inputChars.length > 0 && inputChars[0] !== '\\') {
    inputChars.shift();
  }
  // Remove any trailing flat or descending segments until an ascent character ('/') is encountered.
  while (inputChars.length > 0 && inputChars[inputChars.length - 1] !== '/') {
    inputChars.pop();
  }

  // Iterate through the remaining input characters to construct the elevation profile.
  inputChars.forEach(function(charItem, idx) {
      if (charItem === '\\') { // If the character indicates a downward slope.
        currentElevation -= 1;
      } else if (charItem === '_') { // If the character indicates a flat segment.
        currentElevation += 0; // Elevation remains unchanged.
      } else { // Otherwise, the character must indicate an upward slope ('/').
        currentElevation += 1;
      }
      elevationLevels.push(currentElevation); // Add the new current elevation to the profile.
  });

  let totalWaterVolume = 0; // Accumulator for the total volume of water collected in all ponds.
  let pondSizes = []; // An array to store the individual volumes of each pond found.

  // Continuously search for and measure ponds within the elevation profile.
  for (; elevationLevels.length > 1; ) { // Loop as long as there are at least two elevation points remaining.
    let pondArea = calculatePondArea(elevationLevels); // Attempt to calculate the area of a pond starting from the current point.
    if (pondArea > 0) { // If a pond with a positive area was found.
      totalWaterVolume += pondArea; // Add its area to the overall total.
      pondSizes.push(pondArea); // Record the size of this specific pond.
    }
  }

  // Output the total calculated water volume.
  console.log(totalWaterVolume);
  // Output the count of ponds and their individual sizes, if any ponds were found.
  console.log(pondSizes.length && pondSizes.length + ' ' + pondSizes.join(' '));
})();

function calculatePondArea(levelSequence) {
    // Extract the first elevation point, which serves as the potential starting "wall" of a pond.
    let startLevel = levelSequence.shift();

    // Check conditions for a valid pond:
    // 1. The next elevation point must be lower than the startLevel (indicating a dip).
    // 2. The startLevel must be less than or equal to the maximum remaining elevation (ensuring there's a "right wall" to contain water).
    if (levelSequence[0] < startLevel && startLevel <= levelSequence.reduce((accumulator, currentValue) => Math.max(accumulator, currentValue), -100000)) {
      let currentArea = 0; // Initialize the area for the pond being calculated.
      // Traverse the sequence, accumulating water until the level rises back to or above the startLevel, or the sequence ends.
      while (true) {
        if (levelSequence.length === 0 || startLevel <= levelSequence[0]) {
          break; // Exit the loop if no more levels or if the water is contained by a wall of equal or greater height.
        }
        // Add the volume of water trapped at the current point (difference between startLevel and the current lower level).
        currentArea += startLevel - levelSequence.shift();
      }
      return currentArea; // Return the total area of the pond found.
    } else {
      return 0; // No pond can be formed from this starting point under the given conditions.
    }
}

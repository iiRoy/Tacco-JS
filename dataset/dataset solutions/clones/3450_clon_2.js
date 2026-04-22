function processData(rawData) {
  const
    // Split the entire input string into an array of individual lines.
    lines = rawData.split('\n');

  // Comment: This formula calculates the effective temperature at a location
  // using a base temperature and reducing it by 0.006 for each unit of altitude.

  // Comment: This variable will store the absolute difference between the
  // calculated temperature and the desired target temperature.
  let smallestDiff;

  // Comment: This variable will hold the index of the location
  // that provides the closest temperature to the target.
  let bestLocIndex;

  const totalLocs = parseInt(lines[0], 10),
        baseTempVal = parseInt(lines[1].split(' ')[0]),
        desiredTemp = parseInt(lines[1].split(' ')[1]),
        altitudeMeasures = lines[2].split(' ').map( (altStr) => parseInt(altStr, 10));

  for (let currentLoc = 0; currentLoc < altitudeMeasures.length; currentLoc++) {
    // Calculate the actual temperature at the current location.
    const actualTemp = baseTempVal - (altitudeMeasures[currentLoc] * 0.006);

    // Determine the absolute difference between the target and actual temperature.
    const currentDifference = Math.abs(desiredTemp - actualTemp);

    // If this is the first location being evaluated, initialize our minimums.
    if (!smallestDiff) {
      smallestDiff = currentDifference;
      bestLocIndex = currentLoc;
    }

    // If the current location's temperature difference is less than or equal to
    // the previously recorded smallest difference, update our minimums.
    if (currentDifference <= smallestDiff) {
      smallestDiff = currentDifference;
      bestLocIndex = currentLoc;
    }
  }

  // Output the 1-based index of the best location.
  console.log((bestLocIndex + 1).toString());
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
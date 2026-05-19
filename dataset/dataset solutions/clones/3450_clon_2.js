function processInputData(rawData) {
  // Split the raw input string into an array of lines for easier parsing.
  const parsedLines = rawData.split('\n');

  // This variable will store the smallest absolute difference found
  // between the target temperature and the calculated average temperature.
  // It is initialized implicitly to undefined.
  let smallestDifference;

  // This variable will hold the 0-based index of the location that has the
  // average temperature closest to the target temperature.
  let bestLocationIndex;

  // Parse the input values from the `parsedLines` array.
  // numLocations: Represents N, the total count of locations.
  // baseTemperature: Represents T, the temperature at sea level.
  // targetTemperature: Represents A, the ideal target temperature.
  // heightsArray: An array containing the altitudes (x values) for each location.
  const numLocations = parseInt(parsedLines[0], 10);
  const baseTemperature = parseInt(parsedLines[1].split(' ')[0], 10);
  const targetTemperature = parseInt(parsedLines[1].split(' ')[1], 10);
  const heightsArray = parsedLines[2].split(' ').map(heightStr => parseInt(heightStr, 10));

  // Iterate through each location's altitude to calculate its average temperature
  // and find the one closest to the target temperature.
  for (let currentIdx = 0; currentIdx < heightsArray.length; currentIdx++) {
    // Calculate the average temperature for the current location using the formula:
    // Average Temperature = Base Temperature - (Altitude * 0.006)
    // Then, compute the absolute difference between this calculated average
    // and the desired target temperature.
    const currentDifference = Math.abs(targetTemperature - (baseTemperature - (heightsArray[currentIdx] * 0.006)));

    // If `smallestDifference` is currently undefined (i.e., this is the first iteration),
    // or if the `currentDifference` is less than or equal to the `smallestDifference` found so far,
    // update `smallestDifference` and `bestLocationIndex`.
    // The use of `<=` ensures that if multiple locations have the same minimum difference,
    // the one with the highest index (last encountered) is chosen, matching the original behavior.
    if (!smallestDifference) {
      smallestDifference = currentDifference;
      bestLocationIndex = currentIdx;
    }

    if (currentDifference <= smallestDifference) {
      smallestDifference = currentDifference;
      bestLocationIndex = currentIdx;
    }
  }

  // Output the 1-based index of the best location to the console.
  // The problem typically expects 1-based indexing for output.
  console.log((bestLocationIndex + 1).toString());
}

// Read the entire content of standard input synchronously,
// assuming it's UTF-8 encoded, and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

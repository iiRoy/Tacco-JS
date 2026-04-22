function processInput( rawData ) {
  // Normalize the input string by removing leading/trailing whitespace
  rawData = rawData.trim();

  // Parse the number of available locations from the first line
  const numOfLocations = Number.parseInt(rawData.split(' ')[0], 10);

  // Extract the target temperature from the second line, first part
  const targetTemperature = Number.parseInt(rawData.split('\n')[1].split(' ')[0], 10);

  // Extract the desired temperature at altitude from the second line, second part
  const desiredAltitudeTemp = Number.parseInt(rawData.split('\n')[1].split(' ')[1], 10);

  // Parse the list of altitudes from the third line into an array of numbers
  const altitudeList = rawData.split('\n')[2].split(' ').map((currentAltitude) =>
    Number.parseInt(currentAltitude, 10)
  );

  // Array to store the calculated temperature differences for each location
  const calculatedDifferences = [];

  // Iterate through each location to calculate its temperature difference
  for (let locationIndex = 0; locationIndex < numOfLocations; locationIndex++) {
    // Calculate the absolute difference between the actual temperature at this altitude
    // and the desired altitude temperature, considering a specific lapse rate (0.006 degrees per meter).
    const currentDifference = Math.abs((targetTemperature - altitudeList[locationIndex] * 0.0060) - desiredAltitudeTemp);
    calculatedDifferences.push(currentDifference);
  }

  // Find the smallest difference among all calculated differences
  const minimumDifference = Math.min(...calculatedDifferences);

  // Output the 1-based index of the location with the minimum temperature difference
  console.log(calculatedDifferences.indexOf(minimumDifference) + 1);
}

// Read input from standard input and pass it to the processing function
processInput(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));
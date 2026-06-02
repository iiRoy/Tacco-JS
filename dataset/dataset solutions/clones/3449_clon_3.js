function processInputData(rawData) {
  const RADIX_DECIMAL = 10;
  const ALTITUDE_TEMP_DECREASE_RATE = 0.006;

  const inputLines = rawData.split("\n");

  // N is read but not used in the original logic, preserving this behavior.
  const numLocationsStr = inputLines[0];

  const tempAndAltitudeParts = inputLines[1].split(" ");
  const baseTemperatureStr = tempAndAltitudeParts[0];
  const targetAltitudeTempStr = tempAndAltitudeParts[1];

  const heightsStrArray = inputLines[2].split(" ");

  // Parse numerical values for T and A once
  const baseTemperature = parseInt(baseTemperatureStr, RADIX_DECIMAL);
  const targetAltitudeTemp = parseInt(targetAltitudeTempStr, RADIX_DECIMAL);

  const absoluteTemperatureDifferences = [];
  let closestLocationResultIndex; // This variable is intentionally left undefined initially

  // Loop through each height to calculate temperature differences
  for (let currentIndex = 0; currentIndex < heightsStrArray.length; currentIndex++) {
    const currentHeight = parseInt(heightsStrArray[currentIndex], RADIX_DECIMAL);

    // Calculate the temperature at the current location
    const calculatedLocationTemperature = baseTemperature - (currentHeight * ALTITUDE_TEMP_DECREASE_RATE);

    // Preserve the exact original calculation for 'x' (intermediateTemperatureDifference)
    let intermediateTemperatureDifference;
    if (targetAltitudeTemp >= 0) {
      intermediateTemperatureDifference = targetAltitudeTemp - calculatedLocationTemperature;
    } else {
      intermediateTemperatureDifference = targetAltitudeTemp + calculatedLocationTemperature;
    }

    absoluteTemperatureDifferences[currentIndex] = Math.abs(intermediateTemperatureDifference);

    // Preserve the exact original logic for updating 'min' (closestLocationResultIndex)
    // This logic only updates for currentIndex >= 1 and compares current with previous.
    if (currentIndex >= 1) {
      const previousDiff = absoluteTemperatureDifferences[currentIndex - 1];
      const currentDiff = absoluteTemperatureDifferences[currentIndex];

      if (previousDiff > currentDiff) {
        closestLocationResultIndex = currentIndex + 1;
      } else if (currentDiff >= previousDiff) {
        closestLocationResultIndex = currentIndex;
      }
    }
  }

  console.log(closestLocationResultIndex);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

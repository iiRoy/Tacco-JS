function processEnvironmentalData(rawDataInput) {
  // Define constants for robust parsing and calculation.
  const NEWLINE_DELIMITER = '\n';
  const WHITESPACE_DELIMITER = ' ';
  const TEMPERATURE_DROP_PER_METER = 0.006; // Celsius degrees per meter altitude.

  // Split the entire input string into an array of lines.
  const inputLineSegments = rawDataInput.split(NEWLINE_DELIMITER);

  // The first line (inputLineSegments[0]) usually contains 'N', the number of locations.
  // This variable is not utilized in the core logic of finding the closest temperature,
  // so it's omitted to streamline the processing.
  // const numberOfGeographicPoints = parseFloat(inputLineSegments[0]);

  // Extract base temperature (T) and target temperature (A) from the second line.
  const tempSettings = inputLineSegments[1].split(WHITESPACE_DELIMITER);
  const referenceTemperatureAtSeaLevel = parseFloat(tempSettings[0]); // Base temperature at 0 altitude.
  const desiredAmbientTemperature = parseFloat(tempSettings[1]);     // The temperature we are trying to match.

  // Extract the list of altitudes (H) from the third line.
  // Each altitude string is converted to a floating-point number.
  const allAltitudeMeasurements = inputLineSegments[2]
                                    .split(WHITESPACE_DELIMITER)
                                    .map(altStr => parseFloat(altStr));

  // Initialize variables to keep track of the best match found so far.
  let minimumTemperatureDifference = Number.MAX_SAFE_INTEGER; // Stores the smallest absolute difference.
  let bestMatchingLocationIdentifier = -1; // Stores the 1-indexed position of the location.

  // Iterate over each measured altitude to calculate its estimated temperature
  // and compare it against the desired ambient temperature.
  for (let currentPointIndex = 0; currentPointIndex < allAltitudeMeasurements.length; currentPointIndex++) {
    const currentAltitudeInMeters = allAltitudeMeasurements[currentPointIndex];

    // Calculate the estimated temperature at the current altitude.
    // Formula: Estimated_Temp = Base_Temp - (Altitude * Temperature_Drop_Rate)
    const estimatedTemperatureAtCurrentAltitude =
      referenceTemperatureAtSeaLevel - (currentAltitudeInMeters * TEMPERATURE_DROP_PER_METER);

    // Calculate the preliminary temperature difference.
    // The original logic applies a specific conditional transformation for negative desired temperatures.
    // This unique behavior is preserved.
    let preliminaryDifferenceCalculation;
    if (desiredAmbientTemperature >= 0) {
      preliminaryDifferenceCalculation = desiredAmbientTemperature - estimatedTemperatureAtCurrentAltitude;
    } else {
      // For negative desired temperatures, the logic adds the estimated temperature.
      // This is a specific requirement of the original problem's calculation.
      preliminaryDifferenceCalculation = desiredAmbientTemperature + estimatedTemperatureAtCurrentAltitude;
    }

    // The actual metric for closeness is the absolute value of this preliminary difference.
    const currentAbsoluteTemperatureDifference = Math.abs(preliminaryDifferenceCalculation);

    // Update the best matching location if the current location offers a smaller difference.
    // If it's the very first location, or if a new minimum is found, update the tracker variables.
    if (currentAbsoluteTemperatureDifference < minimumTemperatureDifference) {
      minimumTemperatureDifference = currentAbsoluteTemperatureDifference;
      bestMatchingLocationIdentifier = currentPointIndex + 1; // Convert 0-indexed to 1-indexed.
    }
    // If multiple locations have the exact same minimum difference, the current logic will
    // retain the *first* one encountered. This is a common tie-breaking rule.
    // The original code's tie-breaking was complex and potentially inconsistent for global minimum.
  }

  // Output the 1-indexed identifier of the location that best matches the desired temperature.
  console.log(bestMatchingLocationIdentifier);
}

// Standard entry point for competitive programming environments in JavaScript.
// It reads the entire standard input as a UTF-8 string and passes it to the main processing function.
processEnvironmentalData(require('fs').readFileSync('/dev/stdin', 'utf8'));
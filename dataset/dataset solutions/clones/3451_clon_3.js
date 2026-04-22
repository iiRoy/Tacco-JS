function analyzeEnvironmentalStationData(rawDataStream) {
  // First, we process the raw input data to ensure it's clean and usable.
  const processedInput = rawDataStream.trim();

  // Define a constant for the rate at which temperature decreases with altitude.
  // This value represents a drop of 0.006 degrees Celsius for every meter of ascent.
  const TEMP_DROP_RATE_PER_METER = 0.006; // °C/m

  // Split the entire input string into an array of individual lines.
  const inputSegments = processedInput.split('\n');

  // A basic validation to ensure we have enough input lines to proceed.
  // We expect at least three lines: N, T A, and the altitude array.
  if (inputSegments.length < 3) {
    // If the input is malformed, log an error and exit.
    // In a production system, this might throw an exception.
    console.error("Input data is incomplete. Expected at least 3 lines.");
    return;
  }

  // Extract primary parameters from the first two lines.
  // The first line contains the total count of observation points.
  const firstLineDetails = inputSegments[0].split(' ');
  const numberOfObservationPoints = parseInt(firstLineDetails[0], 10);

  // The second line provides the reference sea-level temperature and the target temperature.
  const secondLineDetails = inputSegments[1].split(' ');
  const referenceSeaLevelTemp = parseInt(secondLineDetails[0], 10);
  const userTargetTemperature = parseInt(secondLineDetails[1], 10);

  // The third line contains a space-separated list of altitudes for each observation point.
  // We parse these into an array of integers.
  const stationAltitudes = inputSegments[2].split(' ').map(strVal => parseInt(strVal, 10));

  // A sanity check to compare the declared number of points with the actual number of altitude readings.
  if (stationAltitudes.length !== numberOfObservationPoints) {
    console.warn(`Warning: Declared observation points (${numberOfObservationPoints}) mismatch actual readings (${stationAltitudes.length}). Processing with available data.`);
    // For robustness, we might adjust numberOfObservationPoints here or stop execution.
  }

  // Initialize variables to keep track of the closest temperature match.
  // We start with an infinitely large difference to ensure the first comparison succeeds.
  let minimumObservedDeviation = Infinity;
  // This will store the 0-based index of the station with the closest temperature.
  let bestMatchingStationIndex = -1;

  // Iterate through each observation station's altitude data.
  // The loop runs for the number of actual altitude readings, or the declared number if it's smaller.
  for (let currentStationIdx = 0; currentStationIdx < stationAltitudes.length; ++currentStationIdx) {
    const currentStationAltitude = stationAltitudes[currentStationIdx];

    // Calculate the estimated temperature at the current station's altitude.
    // Formula: Sea-level temperature - (altitude * temperature drop rate).
    const estimatedStationTemp = referenceSeaLevelTemp - (currentStationAltitude * TEMP_DROP_RATE_PER_METER);

    // Determine the absolute difference between the estimated station temperature
    // and the user's desired target temperature.
    const currentTemperatureDeviation = Math.abs(estimatedStationTemp - userTargetTemperature);

    // If this station's temperature deviation is smaller than any found so far,
    // update our records for the minimum deviation and the corresponding station index.
    if (currentTemperatureDeviation < minimumObservedDeviation) {
      minimumObservedDeviation = currentTemperatureDeviation;
      bestMatchingStationIndex = currentStationIdx;
    }
  }

  // Output the result. The problem typically asks for a 1-based index.
  // If no valid station was processed (e.g., empty input), handle this case.
  if (bestMatchingStationIndex !== -1) {
    console.log(bestMatchingStationIndex + 1); // Convert 0-based index to 1-based
  } else {
    // This case might occur if 'numberOfObservationPoints' was 0 or input was malformed
    // in a way that 'stationAltitudes' became empty.
    console.log("No suitable observation station found or processed.");
  }
}

// Standard input reading for competitive programming environments.
// This part remains unchanged as it handles the external I/O mechanism.
analyzeEnvironmentalStationData(require('fs').readFileSync('/dev/stdin', 'utf8'));
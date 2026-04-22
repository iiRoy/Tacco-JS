// Type III clone generation
// Original functionality: Find the location (1-based index) whose calculated temperature
// is closest to a target ideal temperature.

function determineOptimalLocation(rawInputString) {
  // Define a constant for the temperature decay rate with altitude.
  const TEMPERATURE_DECAY_ER_FACTOR = 0.006; // Represents 0.006 degrees Celsius per meter.

  // Split the raw input string into individual lines for processing.
  const processedInputLines = rawInputString.split('\n');

  // Parse the base and target temperatures from the second line of input.
  // Using destructuring for a distinct parsing style compared to the original.
  const [initialBaseTempStr, desiredAtmosphericTempStr] = processedInputLines[1].split(' ');
  const baseAtmosphericTemp = parseInt(initialBaseTempStr, 10);
  const targetIdealTemp = parseInt(desiredAtmosphericTempStr, 10);

  // Parse the altitudes for all sites from the third line of input.
  // Ensure each altitude string is converted to an integer.
  const siteAltitudesInMeters = processedInputLines[2].split(' ').map(altitudeString => parseInt(altitudeString, 10));

  // Initialize variables to keep track of the best location found so far.
  // Start with a very large number for the minimum difference to ensure the first calculation updates it.
  let minimumTemperatureDifference = Number.POSITIVE_INFINITY;
  // Initialize the optimal index to -1, indicating no valid location has been identified yet.
  let optimalSiteOneBasedIndex = -1;

  // Note: The first line of input (N, number of locations) is parsed implicitly by `processedInputLines[0]`
  // but its value is not explicitly used in this modified version, effectively being deleted from usage.

  // Iterate over each site to calculate its effective temperature and deviation from the ideal.
  // Using a forEach loop with explicit index tracking for a different structural approach.
  siteAltitudesInMeters.forEach((currentSiteAltitude, siteZeroBasedIndex) => {
    // Calculate the effective temperature at the current altitude using the decay factor.
    // This serves as an intermediate calculation step.
    const calculatedSiteTemp = baseAtmosphericTemp - (currentSiteAltitude * TEMPERATURE_DECAY_ER_FACTOR);

    // Determine the absolute deviation of the calculated temperature from the target ideal temperature.
    const currentDeviationFromIdeal = Math.abs(targetIdealTemp - calculatedSiteTemp);

    // Check if this site's temperature deviation is better (smaller or equal) than the current minimum.
    // The condition `<= minimumTemperatureDifference` ensures that if multiple sites have the same
    // minimal deviation, the *last* one encountered in the array will be chosen as optimal.
    if (currentDeviationFromIdeal <= minimumTemperatureDifference) {
      minimumTemperatureDifference = currentDeviationFromIdeal;
      // Store the 1-based index of the optimal site for output.
      optimalSiteOneBasedIndex = siteZeroBasedIndex + 1;
    }
  });

  // Output the 1-based index of the location that best matches the ideal temperature.
  // Using a template literal for string formatting.
  console.log(`${optimalSiteOneBasedIndex}`);
}

// Read the input from standard input and pass it to the main processing function.
// This part is typical for competitive programming environments.
const fs = require('fs');
const stdInputData = fs.readFileSync('/dev/stdin', 'utf8');
determineOptimalLocation(stdInputData);
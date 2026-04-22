// Initial raw data for travel tariffs.
// This structure might be loaded from a configuration file or database in a real application.
const rawTariffData = [
  { from: 1, to: 2, amount: 300 },
  { from: 1, to: 3, amount: 500 },
  { from: 1, to: 4, amount: 600 },
  { from: 1, to: 5, amount: 700 },
  { from: 1, to: 6, amount: 1350 },
  { from: 1, to: 7, amount: 1650 },
  { from: 2, to: 1, amount: 6 },
  { from: 2, to: 3, amount: 350 },
  { from: 2, to: 4, amount: 450 },
  { from: 2, to: 5, amount: 600 },
  { from: 2, to: 6, amount: 1150 },
  { from: 2, to: 7, amount: 1500 },
  { from: 3, to: 1, amount: 13 },
  { from: 3, to: 2, amount: 7 },
  { from: 3, to: 4, amount: 250 },
  { from: 3, to: 5, amount: 400 },
  { from: 3, to: 6, amount: 1000 },
  { from: 3, to: 7, amount: 1350 },
  { from: 4, to: 1, amount: 18 },
  { from: 4, to: 2, amount: 12 },
  { from: 4, to: 3, amount: 5 },
  { from: 4, to: 5, amount: 250 },
  { from: 4, to: 6, amount: 850 },
  { from: 4, to: 7, amount: 1300 },
  { from: 5, to: 1, amount: 23 },
  { from: 5, to: 2, amount: 17 },
  { from: 5, to: 3, amount: 10 },
  { from: 5, to: 4, amount: 5 },
  { from: 5, to: 6, amount: 600 },
  { from: 5, to: 7, amount: 1150 },
  { from: 6, to: 1, amount: 43 },
  { from: 6, to: 2, amount: 37 },
  { from: 6, to: 3, amount: 30 },
  { from: 6, to: 4, amount: 25 },
  { from: 6, to: 5, amount: 20 },
  { from: 6, to: 7, amount: 500 },
  { from: 7, to: 1, amount: 58 },
  { from: 7, to: 2, amount: 52 },
  { from: 7, to: 3, amount: 45 },
  { from: 7, to: 4, amount: 40 },
  { from: 7, to: 5, amount: 35 },
  { from: 7, to: 6, amount: 15 },
];

// Process raw tariff data into a quick-lookup map for efficient access.
const interCityTariffs = {};
for (const tariffEntry of rawTariffData) {
  const key = `${tariffEntry.from}to${tariffEntry.to}`;
  interCityTariffs[key] = tariffEntry.amount;
}

// Define constants for magic numbers to improve readability and maintainability.
const TERMINATION_NODE_ID = 0;
const ARRIVAL_TIME_DISCOUNT_CUTOFF_MINUTES = 1170; // Represents 19:30 (19*60 + 30 = 1170)
const DEPARTURE_TIME_REFERENCE_MINUTES = 1050; // Represents 17:30 (17*60 + 30 = 1050)
const REVERSE_PATH_CONDITION_MAX_VALUE = 40;
const FARE_ALIGNMENT_UNIT = 50;

/**
 * Helper function to convert "HH MM" string parts into total minutes from midnight.
 * @param {string} hourStr - The hour part of the time.
 * @param {string} minuteStr - The minute part of the time.
 * @returns {number} - Total minutes from midnight, or -1 if input is invalid.
 */
const convertTimeComponentsToMinutes = (hourStr, minuteStr) => {
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);
  // Basic validation for time components.
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    console.error(`Error: Invalid time format detected: ${hourStr}:${minuteStr}`);
    return -1; // Indicate an error state.
  }
  return (hours * 60) + minutes;
};

// Initialize file system module for input operations.
const nodeFileSystem = require('fs');

// Read raw input data from standard input.
const rawInputContent = nodeFileSystem.readFileSync('/dev/stdin', 'utf8');

// Split the input into an array of lines, removing any trailing newline characters.
const journeyRequestLines = rawInputContent.trimEnd().split('\n');

// Main loop: Process each journey request from the input lines.
while (journeyRequestLines.length > 0) {
  // Extract and parse the origin node identifier for the current request.
  const currentOriginNodeId = Number(journeyRequestLines.shift());

  // Check for the termination signal (node ID 0).
  if (currentOriginNodeId === TERMINATION_NODE_ID) {
    // If the termination signal is found, gracefully exit the processing loop.
    break;
  }

  // Ensure there are enough lines remaining for a complete journey request (3 more lines).
  if (journeyRequestLines.length < 3) {
    console.warn("Warning: Insufficient input lines for a complete journey request. Skipping remaining data.");
    break; // Exit if input is malformed or incomplete.
  }

  // Parse departure time components (e.g., "HH MM").
  const departureTimeParts = journeyRequestLines.shift().split(' ');
  // Parse destination node identifier.
  const currentDestinationNodeId = Number(journeyRequestLines.shift());
  // Parse arrival time components (e.g., "HH MM").
  const arrivalTimeParts = journeyRequestLines.shift().split(' ');

  // Convert time components into total minutes from midnight using the helper function.
  const departureTotalMinutes = convertTimeComponentsToMinutes(departureTimeParts[0], departureTimeParts[1]);
  const arrivalTotalMinutes = convertTimeComponentsToMinutes(arrivalTimeParts[0], arrivalTimeParts[1]);

  // Handle cases where time input was invalid.
  if (departureTotalMinutes === -1 || arrivalTotalMinutes === -1) {
    console.error("Skipping current request due to detected invalid time data.");
    continue; // Move to the next request.
  }

  let discountEligibilityCounter = 0; // Tracks how many discount conditions are met.

  // Condition 1: Evaluate arrival time relative to a specific threshold.
  // Original logic: (S<=1050 && G<=1170) || (S>=1050 && G<=1170)
  // This logically simplifies to G<=1170 (arrivalTotalMinutes <= ARRIVAL_TIME_DISCOUNT_CUTOFF_MINUTES).
  // We'll express it more verbosely but equivalently to demonstrate Type III changes.
  const isDepartureBeforeReference = departureTotalMinutes <= DEPARTURE_TIME_REFERENCE_MINUTES;
  const isDepartureAfterReference = departureTotalMinutes >= DEPARTURE_TIME_REFERENCE_MINUTES; // Note: this is always true if not `isDepartureBeforeReference` or equal.
  const isArrivalWithinWindow = arrivalTotalMinutes <= ARRIVAL_TIME_DISCOUNT_CUTOFF_MINUTES;

  let meetsComplexTimeCriteria = false;
  // This complex check (isDepartureBeforeReference || isDepartureAfterReference) always resolves to true.
  // Thus, the condition effectively checks only `isArrivalWithinWindow`.
  if (isArrivalWithinWindow && (isDepartureBeforeReference || isDepartureAfterReference)) {
      meetsComplexTimeCriteria = true;
  }

  if (meetsComplexTimeCriteria) {
      discountEligibilityCounter++;
  }

  // Condition 2: Check a specific tariff value for the reverse path.
  const reverseLookupKey = `${currentDestinationNodeId}to${currentOriginNodeId}`;
  const reversePathCost = interCityTariffs[reverseLookupKey];

  // Only consider the condition if the reverse path tariff exists and meets the criterion.
  if (reversePathCost !== undefined && reversePathCost <= REVERSE_PATH_CONDITION_MAX_VALUE) {
    discountEligibilityCounter++;
  }

  // Retrieve the base fare for the current journey.
  const forwardLookupKey = `${currentOriginNodeId}to${currentDestinationNodeId}`;
  let finalCalculatedFare = interCityTariffs[forwardLookupKey];

  // Apply discount logic if both conditions are met.
  if (discountEligibilityCounter === 2) {
    // Halve the fare. Using Math.trunc for integer division, equivalent to Math.floor for positive numbers.
    finalCalculatedFare = Math.trunc(finalCalculatedFare / 2);

    // Round up the discounted fare to the nearest multiple of FARE_ALIGNMENT_UNIT (50).
    // Original implementation: while(money % 50 != 0) money++;
    // Equivalent, more direct calculation: Math.ceil(money / 50) * 50
    if (finalCalculatedFare % FARE_ALIGNMENT_UNIT !== 0) {
        finalCalculatedFare = Math.ceil(finalCalculatedFare / FARE_ALIGNMENT_UNIT) * FARE_ALIGNMENT_UNIT;
    }
  }

  // Output the final calculated fare for the current journey request.
  console.log(finalCalculatedFare);
}
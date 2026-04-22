const obtainRawInput = () => require('fs').readFileSync('/dev/stdin', 'utf8');

// A designated value to signal the end of input processing scenarios.
const PROCESSING_TERMINATOR_VALUE = 0;

// Configurable constants for various thresholds and calculation parameters.
const PRIME_TIME_ARRIVAL_THRESHOLD_MINUTES = 1170; // Represents 19:30 (7:30 PM)
const RECIPROCAL_ROUTE_COST_LIMIT = 40;
const DISCOUNT_ROUNDING_INCREMENT = 50;
const HALF_PRICE_MULTIPLIER = 0.5;

// This object serves as a comprehensive lookup table for travel costs between various points.
// Keys are formatted as "source_destination" for clarity and easy access.
const interlinkTravelExpenses = {
  "1_2": 300, "1_3": 500, "1_4": 600, "1_5": 700, "1_6": 1350, "1_7": 1650,
  "2_1": 6, "2_3": 350, "2_4": 450, "2_5": 600, "2_6": 1150, "2_7": 1500,
  "3_1": 13, "3_2": 7, "3_4": 250, "3_5": 400, "3_6": 1000, "3_7": 1350,
  "4_1": 18, "4_2": 12, "4_3": 5, "4_5": 250, "4_6": 850, "4_7": 1300,
  "5_1": 23, "5_2": 17, "5_3": 10, "5_4": 5, "5_6": 600, "5_7": 1150,
  "6_1": 43, "6_2": 37, "6_3": 30, "6_4": 25, "6_5": 20, "6_7": 500,
  "7_1": 58, "7_2": 52, "7_3": 45, "7_4": 40, "7_5": 35, "7_6": 15
};

/**
 * Transforms an array containing hour and minute strings into a single total minute count from midnight.
 * Performs basic input validation.
 * @param {string[]} timeSegments - An array like ['HH', 'MM'].
 * @returns {number} The total minutes from midnight, or NaN if input is invalid.
 */
const calculateTotalMinutes = (timeSegments) => {
  if (!Array.isArray(timeSegments) || timeSegments.length !== 2) {
    console.warn("Warning: Invalid time segments provided.", timeSegments);
    return NaN; // Indicate an error state
  }
  const hoursAsNumber = Number(timeSegments[0]);
  const minutesAsNumber = Number(timeSegments[1]);
  return (hoursAsNumber * 60) + minutesAsNumber;
};

// Retrieve all input data, clean it, and split into individual lines.
const rawInputLines = obtainRawInput()
  .trimEnd() // Removes trailing newlines more robustly than regex.
  .split('\n');

// Create a mutable queue from the input lines for sequential consumption.
const inputProcessingQueue = [...rawInputLines];

// Iterate through each set of journey details provided in the input.
while (inputProcessingQueue.length > 0) {
  // Extract the starting location identifier for the current journey.
  const currentOriginIdentifier = Number(inputProcessingQueue.shift());

  // If the origin identifier matches the termination value, cease processing.
  if (currentOriginIdentifier === PROCESSING_TERMINATOR_VALUE) {
    break;
  }

  // Parse the departure time information.
  const departureTimeLine = inputProcessingQueue.shift();
  if (departureTimeLine === undefined) { // Guard against unexpected end of input.
    console.error("Error: Missing departure time line. Terminating.");
    break;
  }
  const originTimeParts = departureTimeLine.split(' ');
  const journeyStartAbsoluteMinutes = calculateTotalMinutes(originTimeParts);

  // Extract the destination location identifier.
  const currentDestinationIdentifier = Number(inputProcessingQueue.shift());

  // Parse the arrival time information.
  const arrivalTimeLine = inputProcessingQueue.shift();
  if (arrivalTimeLine === undefined) { // Guard against unexpected end of input.
    console.error("Error: Missing arrival time line. Terminating.");
    break;
  }
  const destinationTimeParts = arrivalTimeLine.split(' ');
  const journeyEndAbsoluteMinutes = calculateTotalMinutes(destinationTimeParts);

  // A counter to track how many special conditions for a fare adjustment are met.
  let qualifyingConditionCount = 0;

  // Condition Check 1: Determine if the journey concludes by the defined prime time threshold.
  // The original condition `(S<=1050 && G<=1170) || (S>=1050 && G<=1170)` simplifies to `G<=1170`.
  if (journeyEndAbsoluteMinutes <= PRIME_TIME_ARRIVAL_THRESHOLD_MINUTES) {
    qualifyingConditionCount++;
  }

  // Construct the lookup key for the reverse route (destination to origin).
  const reverseRouteLookupKey = `${currentDestinationIdentifier}_${currentOriginIdentifier}`;
  const costOfReverseRoute = interlinkTravelExpenses[reverseRouteLookupKey];

  // Condition Check 2: Verify if the cost of the reverse journey is below a specific limit.
  // Includes a check to ensure the reverse route actually exists in the tariff data.
  if (typeof costOfReverseRoute === 'number' && costOfReverseRoute <= RECIPROCAL_ROUTE_COST_LIMIT) {
    qualifyingConditionCount++;
  }

  // Construct the lookup key for the forward route (origin to destination).
  const forwardRouteLookupKey = `${currentOriginIdentifier}_${currentDestinationIdentifier}`;
  let primaryJourneyFare = interlinkTravelExpenses[forwardRouteLookupKey];

  // Robustness check: Handle cases where a defined route might not exist in the tariff data.
  if (typeof primaryJourneyFare !== 'number') {
    console.error(`Error: Travel route '${forwardRouteLookupKey}' not found in tariff data. Setting fare to 0.`);
    primaryJourneyFare = 0; // Assign a default or error fare.
  }

  // Apply the special fare reduction if all qualifying conditions are satisfied.
  if (qualifyingConditionCount === 2) {
    // Calculate the initial discounted fare by halving the primary fare and rounding down.
    let reducedFare = Math.floor(primaryJourneyFare * HALF_PRICE_MULTIPLIER);

    // Further adjust the reduced fare by rounding it up to the nearest increment (e.g., 50).
    // This replaces the iterative `while` loop with a direct mathematical calculation.
    if (reducedFare % DISCOUNT_ROUNDING_INCREMENT !== 0) {
      reducedFare = Math.ceil(reducedFare / DISCOUNT_ROUNDING_INCREMENT) * DISCOUNT_ROUNDING_INCREMENT;
    }
    primaryJourneyFare = reducedFare; // Update the fare with the final discounted value.
  }

  // Output the computed final fare for the current journey scenario.
  console.log(primaryJourneyFare);
}

// Script execution concludes.
const ROUTE_COST_DEFINITIONS = [
    // This array defines the base costs for various travel routes.
    // Each inner array represents [origin_station_id, destination_station_id, cost_in_currency_units].
    [1, 2, 300], [1, 3, 500], [1, 4, 600], [1, 5, 700], [1, 6, 1350], [1, 7, 1650],
    [2, 1, 6], [2, 3, 350], [2, 4, 450], [2, 5, 600], [2, 6, 1150], [2, 7, 1500],
    [3, 1, 13], [3, 2, 7], [3, 4, 250], [3, 5, 400], [3, 6, 1000], [3, 7, 1350],
    [4, 1, 18], [4, 2, 12], [4, 3, 5], [4, 5, 250], [4, 6, 850], [4, 7, 1300],
    [5, 1, 23], [5, 2, 17], [5, 3, 10], [5, 4, 5], [5, 6, 600], [5, 7, 1150],
    [6, 1, 43], [6, 2, 37], [6, 3, 30], [6, 4, 25], [6, 5, 20], [6, 7, 500],
    [7, 1, 58], [7, 2, 52], [7, 3, 45], [7, 4, 40], [7, 5, 35], [7, 6, 15]
];

/**
 * A nested object structure to efficiently store and retrieve travel costs.
 * Keyed by origin station, then by destination station.
 * @type {Object.<number, Object.<number, number>>}
 */
const interStationTravelCosts = {};

// Populate the travel cost matrix from the defined array.
// This provides a clearer, more maintainable initialization than individual assignments.
ROUTE_COST_DEFINITIONS.forEach(([fromId, toId, fareValue]) => {
    // Basic validation for the input data integrity.
    if (typeof fromId !== 'number' || typeof toId !== 'number' || typeof fareValue !== 'number' || fareValue < 0) {
        console.error(`Data integrity warning: Invalid route cost definition encountered: [${fromId}, ${toId}, ${fareValue}]. Skipping.`);
        return;
    }
    if (!interStationTravelCosts[fromId]) {
        interStationTravelCosts[fromId] = {};
    }
    interStationTravelCosts[fromId][toId] = fareValue;
});

/**
 * Retrieves the cost for a specific route between two stations.
 * @param {number} departureStation The ID of the starting station.
 * @param {number} arrivalStation The ID of the destination station.
 * @returns {number} The monetary cost for the route. Returns 0 if the route is not explicitly defined.
 */
const fetchRouteCost = (departureStation, arrivalStation) => {
    const cost = interStationTravelCosts[departureStation]?.[arrivalStation];
    // If a route isn't found, which shouldn't happen with the given data, default to 0.
    return cost !== undefined ? cost : 0;
};

// --- Input Handling Utilities ---
const fileSystem = require('fs');
const STANDARD_INPUT_SOURCE = '/dev/stdin'; // Path for standard input

/**
 * Reads the raw input data from the specified file path and prepares it for processing.
 * @param {string} sourcePath The file path to read from.
 * @returns {string[]} An array where each element is a line from the input, stripped of leading/trailing whitespace.
 */
const prepareInputLines = (sourcePath) => {
    try {
        const rawContent = fileSystem.readFileSync(sourcePath, 'utf8');
        // Use trim() for general whitespace removal and split by newline.
        return rawContent.trim().split('\n').map(line => line.trim());
    } catch (ioError) {
        console.error(`Error reading input from ${sourcePath}: ${ioError.message}`);
        return []; // Return an empty array on failure to prevent further errors.
    }
};

let allInputLines = prepareInputLines(STANDARD_INPUT_SOURCE);
let currentInputLinePointer = 0; // A pointer to manage reading lines without modifying the array.

/**
 * Consumes the next line from the input and parses it as an integer.
 * @returns {number} The parsed integer value. Returns 0 if the line is invalid or end of input.
 */
const consumeNextInteger = () => {
    if (currentInputLinePointer >= allInputLines.length) {
        return 0; // Indicate end of input or error.
    }
    const lineContent = allInputLines[currentInputLinePointer++];
    const parsedValue = parseInt(lineContent, 10);
    // Handle cases where parsing results in NaN.
    return isNaN(parsedValue) ? 0 : parsedValue;
};

/**
 * Consumes the next line from the input and parses it into an array of numbers.
 * @returns {number[]} An array of numbers. Returns an empty array if the line is invalid or end of input.
 */
const consumeNextNumberArray = () => {
    if (currentInputLinePointer >= allInputLines.length) {
        return [];
    }
    const lineContent = allInputLines[currentInputLinePointer++];
    // Split by space, filter out empty strings from multiple spaces, then map to Number.
    const numbers = lineContent.split(' ').filter(s => s !== '').map(Number);
    // Filter out any NaN values that might result from non-numeric parts.
    return numbers.filter(num => !isNaN(num));
};

// --- Configuration Constants for Business Logic ---
const MINUTES_PER_HOUR = 60;
const EARLY_DISCOUNT_WINDOW_START = 1050; // Equivalent to 17:30 (17*60 + 30)
const EARLY_DISCOUNT_WINDOW_END = 1170;   // Equivalent to 19:30 (19*60 + 30)
const REVERSE_TRIP_SHORT_COST_THRESHOLD = 40; // Max cost for the reverse trip to trigger a discount condition.
const REQUIRED_DISCOUNT_CONDITIONS_MET = 2;   // Number of conditions to be met for the full discount.
const DISCOUNT_PERCENTAGE_FACTOR = 0.5;       // 50% discount.
const FARE_ROUNDING_INCREMENT = 50;           // Fares must be rounded up to the nearest multiple of 50.

/**
 * Converts a given hour and minute into total minutes past midnight.
 * @param {number} hr The hour (0-23).
 * @param {number} min The minute (0-59).
 * @returns {number} Total minutes from 00:00.
 */
const calculateMinutesFromMidnight = (hr, min) => {
    // Add guard clauses for invalid time components.
    if (hr < 0 || hr > 23 || min < 0 || min > 59) {
        // console.warn(`Invalid time components provided: ${hr}:${min}. Defaulting to 0.`);
        return 0;
    }
    return (hr * MINUTES_PER_HOUR) + min;
};

/**
 * Applies a discount to a fare and then rounds the result up to the nearest specified increment.
 * @param {number} originalFare The initial fare amount.
 * @param {number} discountRatio The multiplier for the discount (e.g., 0.5 for 50%).
 * @param {number} roundingStep The value to round up to (e.g., 50).
 * @returns {number} The final discounted and rounded fare.
 */
const applyDiscountAndRoundUpFare = (originalFare, discountRatio, roundingStep) => {
    // Ensure originalFare is non-negative before applying discount.
    const effectiveFare = Math.max(0, originalFare);
    let discountedAmount = Math.floor(effectiveFare * discountRatio); // Apply discount, then floor.

    // Round up to the nearest roundingStep.
    // This replaces the original `while(money%50!=0)money++;` loop.
    if (discountedAmount % roundingStep !== 0) {
        discountedAmount = Math.ceil(discountedAmount / roundingStep) * roundingStep;
    }
    return discountedAmount;
};

// --- Main Application Logic Loop ---
// The loop continues as long as there are lines to process and the start station is not the termination signal (0).
while (currentInputLinePointer < allInputLines.length) {
    const tripOriginStationId = consumeNextInteger();

    // The termination condition for processing input batches.
    if (tripOriginStationId === 0) {
        break;
    }

    // Use destructuring for cleaner assignment of time components.
    const [departureHour, departureMinute] = consumeNextNumberArray();
    const tripDestinationStationId = consumeNextInteger();
    const [arrivalHour, arrivalMinute] = consumeNextNumberArray();

    // Convert time components into total minutes for easier comparison.
    const totalDepartureMinutes = calculateMinutesFromMidnight(departureHour, departureMinute);
    const totalArrivalMinutes = calculateMinutesFromMidnight(arrivalHour, arrivalMinute);

    let conditionsMetForDiscount = 0; // Counter for discount eligibility criteria.

    // Condition 1: Check if either departure or arrival time falls within the special discount window.
    const isDepartureTimeInWindow = (totalDepartureMinutes >= EARLY_DISCOUNT_WINDOW_START && totalDepartureMinutes <= EARLY_DISCOUNT_WINDOW_END);
    const isArrivalTimeInWindow = (totalArrivalMinutes >= EARLY_DISCOUNT_WINDOW_START && totalArrivalMinutes <= EARLY_DISCOUNT_WINDOW_END);

    if (isDepartureTimeInWindow || isArrivalTimeInWindow) {
        conditionsMetForDiscount++;
    }

    // Condition 2: Check the cost of the reverse trip (destination to origin).
    // If this reverse trip is very cheap, it contributes to the discount conditions.
    const reverseTripCost = fetchRouteCost(tripDestinationStationId, tripOriginStationId);
    if (reverseTripCost <= REVERSE_TRIP_SHORT_COST_THRESHOLD) {
        conditionsMetForDiscount++;
    }

    // Determine the base fare for the current trip.
    let finalCalculatedFare = fetchRouteCost(tripOriginStationId, tripDestinationStationId);

    // Apply discount if all required conditions are met.
    if (conditionsMetForDiscount === REQUIRED_DISCOUNT_CONDITIONS_MET) {
        finalCalculatedFare = applyDiscountAndRoundUpFare(
            finalCalculatedFare,
            DISCOUNT_PERCENTAGE_FACTOR,
            FARE_ROUNDING_INCREMENT
        );
    }

    // Output the final calculated fare for the current trip.
    console.log(finalCalculatedFare);
}
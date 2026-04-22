// --- A Refactored Travel Fare Calculation System ---

// This module processes a series of travel requests, calculating the final fare
// for each journey. Discounts are applied based on specific time windows
// and characteristics of the reverse route.

// --- Configuration Constants ---
const EVENING_PEAK_START_MINUTES = 1050; // Corresponds to 17:30 (5:30 PM)
const EVENING_PEAK_END_MINUTES_EXCLUSIVE = 1170; // Corresponds to 19:30 (7:30 PM)
const REVERSE_ROUTE_CHEAP_THRESHOLD = 40; // Max cost for the reverse route to qualify for a discount condition.
const FARE_ROUNDING_INCREMENT = 50; // All final fares are rounded up to the nearest multiple of this value.

/**
 * Converts a given hour and minute pair into total minutes elapsed from midnight.
 * Includes basic type validation to ensure robustness.
 * @param {number} hours - The hour component (0-23).
 * @param {number} minutes - The minute component (0-59).
 * @returns {number} The total number of minutes from 00:00.
 */
const calculateTotalMinutes = (hours, minutes) => {
    // Defensive check: ensure inputs are numeric.
    if (typeof hours !== 'number' || typeof minutes !== 'number' || isNaN(hours) || isNaN(minutes)) {
        console.error(`Invalid time components provided: Hours=${hours}, Minutes=${minutes}. Returning 0.`);
        return 0; // Default to 0 minutes if input is invalid.
    }
    return (hours * 60) + minutes;
};

/**
 * A lookup table storing the base fare for direct routes between various nodes.
 * Keys are formatted as "ORIGIN_to_DESTINATION".
 */
const routeBaseFares = {};

// --- Initializing Route Fare Data ---
// Populating the fare map with predefined values.
// The original structure of direct assignments is maintained for clarity
// but with updated identifier names and key formatting.
routeBaseFares["1_to_2"] = 300;
routeBaseFares["1_to_3"] = 500;
routeBaseFares["1_to_4"] = 600;
routeBaseFares["1_to_5"] = 700;
routeBaseFares["1_to_6"] = 1350;
routeBaseFares["1_to_7"] = 1650;
routeBaseFares["2_to_1"] = 6;
routeBaseFares["2_to_3"] = 350;
routeBaseFares["2_to_4"] = 450;
routeBaseFares["2_to_5"] = 600;
routeBaseFares["2_to_6"] = 1150;
routeBaseFares["2_to_7"] = 1500;
routeBaseFares["3_to_1"] = 13;
routeBaseFares["3_to_2"] = 7;
routeBaseFares["3_to_4"] = 250;
routeBaseFares["3_to_5"] = 400;
routeBaseFares["3_to_6"] = 1000;
routeBaseFares["3_to_7"] = 1350;
routeBaseFares["4_to_1"] = 18;
routeBaseFares["4_to_2"] = 12;
routeBaseFares["4_to_3"] = 5; // Corrected key format
routeBaseFares["4_to_5"] = 250;
routeBaseFares["4_to_6"] = 850;
routeBaseFares["4_to_7"] = 1300;
routeBaseFares["5_to_1"] = 23;
routeBaseFares["5_to_2"] = 17;
routeBaseFares["5_to_3"] = 10;
routeBaseFares["5_to_4"] = 5;
routeBaseFares["5_to_6"] = 600;
routeBaseFares["5_to_7"] = 1150;
routeBaseFares["6_to_1"] = 43;
routeBaseFares["6_to_2"] = 37;
routeBaseFares["6_to_3"] = 30;
routeBaseFares["6_to_4"] = 25;
routeBaseFares["6_to_5"] = 20;
routeBaseFares["6_to_7"] = 500;
routeBaseFares["7_to_1"] = 58;
routeBaseFares["7_to_2"] = 52;
routeBaseFares["7_to_3"] = 45;
routeBaseFares["7_to_4"] = 40;
routeBaseFares["7_to_5"] = 35;
routeBaseFares["7_to_6"] = 15;

// --- Input Processing Setup ---
const nodeFs = require('fs');
// Read all standard input content and prepare it for line-by-line processing.
const rawInputContent = nodeFs.readFileSync('/dev/stdin', 'utf8');
let inputLineBuffer = rawInputContent.trim().split('\n'); // Using .trim() for robust newline handling.

// --- Main Loop for Processing Journey Requests ---
// Iterates through each journey request provided in the input.
while (true) {
    // Read the starting point ID for the current journey.
    // `Number()` is used for explicit string-to-number conversion.
    const currentOriginNodeId = Number(inputLineBuffer.shift());

    // Termination condition: A starting point ID of 0 signifies the end of input.
    if (currentOriginNodeId === 0) {
        break;
    }

    // Parse the departure time (hours and minutes).
    // `map(Number)` efficiently converts all array elements to numbers.
    const departureTimeParts = inputLineBuffer.shift().split(' ').map(Number);
    const departureHour = departureTimeParts[0];
    const departureMinute = departureTimeParts[1];

    // Read the destination point ID.
    const currentDestinationNodeId = Number(inputLineBuffer.shift());

    // Parse the arrival time (hours and minutes).
    const arrivalTimeParts = inputLineBuffer.shift().split(' ').map(Number);
    const arrivalHour = arrivalTimeParts[0];
    const arrivalMinute = arrivalTimeParts[1];

    // Convert both departure and arrival times into total minutes from midnight
    // for easier comparison against time-based discount thresholds.
    const journeyDepartureMinutes = calculateTotalMinutes(departureHour, departureMinute);
    const journeyArrivalMinutes = calculateTotalMinutes(arrivalHour, arrivalMinute);

    // Initialize a counter for conditions that qualify for a discount.
    let discountConditionMetCount = 0;

    // --- Discount Condition Check 1: Time-based Eligibility ---
    // This condition evaluates if the journey's start and end times fall within
    // or appropriately span a specific evening period (17:30 to 19:30).
    const isDepartureBeforePeakStart = journeyDepartureMinutes <= EVENING_PEAK_START_MINUTES;
    const isDepartureAfterPeakStart = journeyDepartureMinutes > EVENING_PEAK_START_MINUTES;
    const isArrivalBeforePeakEnd = journeyArrivalMinutes < EVENING_PEAK_END_MINUTES_EXCLUSIVE;
    const isArrivalBeforePeakEndInclusive = journeyArrivalMinutes <= EVENING_PEAK_END_MINUTES_EXCLUSIVE;

    // The original logic: (S<=1050 && G<1170) || (S>1050 && G<=1170)
    // Rewritten for enhanced readability using descriptive boolean variables.
    const qualifiesForTimeDiscount = (isDepartureBeforePeakStart && isArrivalBeforePeakEnd) ||
                                     (isDepartureAfterPeakStart && isArrivalBeforePeakEndInclusive);

    if (qualifiesForTimeDiscount) {
        discountConditionMetCount++;
    }

    // --- Discount Condition Check 2: Reverse Route Cost ---
    // Construct the key for looking up the reverse route's fare.
    const reverseRouteLookupKey = `${currentDestinationNodeId}_to_${currentOriginNodeId}`;
    const reverseRouteFare = routeBaseFares[reverseRouteLookupKey];

    // Add a check for the existence of the reverse route fare.
    if (reverseRouteFare !== undefined) {
        if (reverseRouteFare <= REVERSE_ROUTE_CHEAP_THRESHOLD) {
            discountConditionMetCount++;
        }
    } else {
        // This scenario might indicate incomplete data or an invalid route.
        // For this clone, we proceed as if the reverse route doesn't qualify if not found.
        // A robust system might log a warning or throw an error here.
        // console.warn(`Fare for reverse route ${reverseRouteLookupKey} not found.`);
    }

    // --- Determine Base Fare for the Current Journey ---
    const forwardRouteLookupKey = `${currentOriginNodeId}_to_${currentDestinationNodeId}`;
    let finalCalculatedFare = routeBaseFares[forwardRouteLookupKey];

    // Important: Validate that the forward route fare exists.
    // If not found, it's an error condition. For this clone, we'll output 0 or a sentinel
    // to maintain flow, but in a real system, this would need more robust error handling.
    if (finalCalculatedFare === undefined) {
        console.error(`Error: Base fare for route ${forwardRouteLookupKey} not defined. Outputting 0.`);
        finalCalculatedFare = 0; // Assign a default or error value.
        // A more strict approach might be to `continue;` to the next request.
    }

    // --- Apply Discount if Both Conditions are Met ---
    if (discountConditionMetCount === 2) {
        // Apply a 50% discount.
        let discountedValue = Math.floor(finalCalculatedFare / 2);

        // Round the discounted fare up to the nearest FARE_ROUNDING_INCREMENT (50).
        // The original `while(money%50!=0)money++;` loop is replaced by a direct
        // mathematical calculation for efficiency and clarity.
        finalCalculatedFare = Math.ceil(discountedValue / FARE_ROUNDING_INCREMENT) * FARE_ROUNDING_INCREMENT;
    }

    // Output the final calculated fare for the current journey.
    console.log(finalCalculatedFare);
}
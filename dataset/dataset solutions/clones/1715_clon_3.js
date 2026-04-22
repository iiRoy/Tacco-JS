'use strict';

// Define a constant for the maximum number of distinct event types,
// typically 26 for A-Z in competitive programming contexts.
const MAX_EVENT_TYPES = 26;

/**
 * Parses the raw input string, extracting and structuring all necessary problem parameters.
 * This function aims to robustly handle input and perform initial validations.
 * @param {string} sourceInput The complete raw input string, usually from standard input.
 * @returns {{
 *   totalDays: number,
 *   penaltyCoefficients: number[],
 *   satisfactionMatrix: number[][],
 *   dailyEventSelections: number[]
 * }} An object containing the parsed problem data.
 * @throws {Error} If the input format is invalid or insufficient.
 */
function extractProblemParameters(sourceInput) {
    // Split the input into lines, handling various newline characters and discarding empty lines.
    const contentLines = sourceInput.split(/\r?\n/).filter(line => line.trim().length > 0);

    // Ensure a minimum number of lines are present for valid input.
    if (contentLines.length < 3) {
        throw new Error("Input data is incomplete; expected at least 3 lines.");
    }

    // Parse the total number of simulation days.
    const numSimulationDays = parseInt(contentLines[0], 10);
    if (isNaN(numSimulationDays) || numSimulationDays <= 0) {
        throw new Error(`Invalid number of simulation days: "${contentLines[0]}". Must be a positive integer.`);
    }

    // Parse the penalty coefficients for each event type.
    const eventPenaltyValues = contentLines[1].split(' ').map(Number);
    if (eventPenaltyValues.some(isNaN)) {
        throw new Error("One or more penalty coefficients are not valid numbers.");
    }
    // Optionally, validate the count of penalty values if it must strictly match MAX_EVENT_TYPES.
    // if (eventPenaltyValues.length !== MAX_EVENT_TYPES) {
    //     console.warn(`Warning: Expected ${MAX_EVENT_TYPES} penalty coefficients, but found ${eventPenaltyValues.length}.`);
    // }

    // Extract the satisfaction gains matrix for each day and event type.
    // The slice operation selects lines representing daily satisfaction scores.
    const dailyGainScores = contentLines
        .slice(2, 2 + numSimulationDays)
        .map(line => line.split(' ').map(Number));

    // Validate the dimensions of the satisfaction matrix.
    if (dailyGainScores.length !== numSimulationDays) {
        throw new Error("Mismatch between specified days and the number of satisfaction score lines.");
    }
    for (const row of dailyGainScores) {
        if (row.length !== MAX_EVENT_TYPES) {
            throw new Error(`Satisfaction matrix row has incorrect number of entries. Expected ${MAX_EVENT_TYPES}.`);
        }
    }

    // Extract the sequence of chosen event types for each day.
    // This assumes the daily selections are the *last* `numSimulationDays` lines of the input.
    const chosenEventIDs = contentLines
        .slice(-numSimulationDays)
        .map(Number);

    // Final validation for the number of daily selections.
    if (chosenEventIDs.length !== numSimulationDays) {
        throw new Error("Mismatch between specified days and the number of daily event selections.");
    }

    return {
        totalDays: numSimulationDays,
        penaltyCoefficients: eventPenaltyValues,
        satisfactionMatrix: dailyGainScores,
        dailyEventSelections: chosenEventIDs,
    };
}

/**
 * Simulates the event scheduling process day-by-day and calculates the cumulative satisfaction.
 * Each day, it updates the last held date for the chosen event and computes satisfaction/penalties
 * for all event types.
 * @param {string} rawProblemData The raw input string containing all problem details.
 */
function processEventSimulation(rawProblemData) {
    // Attempt to parse the input data. Handle potential parsing errors.
    let problemData;
    try {
        problemData = extractProblemParameters(rawProblemData);
    } catch (parseError) {
        console.error("Input Parsing Error:", parseError.message);
        return; // Exit if input cannot be parsed.
    }

    const totalSimulationDays = problemData.totalDays;
    const eventPenaltyFactors = problemData.penaltyCoefficients;
    const dailySatisfactionGains = problemData.satisfactionMatrix;
    const dailyScheduledEventIds = problemData.dailyEventSelections;

    // An array to keep track of the last day (1-indexed) each event type was conducted.
    // Initialized to 0, indicating no event has been held yet.
    let lastConductedDay = new Array(MAX_EVENT_TYPES).fill(0);

    // An array to temporarily store the satisfaction/penalty for each event type on the current day.
    // This can be used for intermediate debugging or detailed logging.
    let dailyTypeContributions = new Array(MAX_EVENT_TYPES).fill(0);

    // The main accumulator for the total satisfaction over all simulation days.
    let cumulativeSatisfactionTotal = 0;

    // Iterate through each day of the simulation, from day 1 to `totalSimulationDays`.
    // Using a 0-indexed loop for array access, converting to 1-indexed for problem logic.
    for (let currentDayZeroIndex = 0; currentDayZeroIndex < totalSimulationDays; ++currentDayZeroIndex) {
        const currentDayOneIndexed = currentDayZeroIndex + 1; // Convert to 1-indexed day.

        // Retrieve the event type selected for the current day.
        // Problem specifies 1-indexed event types (e.g., 1 for A, 2 for B).
        const selectedEventOneIndexed = dailyScheduledEventIds[currentDayZeroIndex];
        const selectedEventZeroIndexed = selectedEventOneIndexed - 1; // Convert to 0-indexed for array access.

        // Basic validation for the selected event type.
        if (selectedEventZeroIndexed < 0 || selectedEventZeroIndexed >= MAX_EVENT_TYPES) {
            console.warn(`Encountered invalid event type ID '${selectedEventOneIndexed}' on day ${currentDayOneIndexed}. This may lead to unexpected behavior.`);
            // A more robust system might throw an error or default to a safe value here.
        }

        // Update the last conducted day for the specifically chosen event type.
        lastConductedDay[selectedEventZeroIndexed] = currentDayOneIndexed;

        // Calculate the aggregate satisfaction/penalty for all event types for the current day.
        let currentDayAggregateScore = 0;

        for (let eventTypeIndex = 0; eventTypeIndex < MAX_EVENT_TYPES; ++eventTypeIndex) {
            let contributionValue = 0; // Contribution of this specific event type for the current day.

            // Check if this particular event type was the one scheduled for today.
            const wasThisEventScheduledToday = (lastConductedDay[eventTypeIndex] === currentDayOneIndexed);

            if (wasThisEventScheduledToday) {
                // If the event was held today, its contribution is the direct satisfaction gain.
                contributionValue = dailySatisfactionGains[currentDayZeroIndex][eventTypeIndex];
            } else {
                // If the event was NOT held today, calculate the penalty.
                // Penalty is based on the number of days since its last occurrence.
                const daysSinceLastHeld = currentDayOneIndexed - lastConductedDay[eventTypeIndex];
                const penaltyFactor = eventPenaltyFactors[eventTypeIndex];
                // Penalties are negative contributions.
                contributionValue = -(penaltyFactor * daysSinceLastHeld);
            }

            // Store the individual contribution for potential inspection.
            dailyTypeContributions[eventTypeIndex] = contributionValue;
            // Add to the sum for the current day's total.
            currentDayAggregateScore += contributionValue;
        }

        // Add the current day's total score to the cumulative sum.
        cumulativeSatisfactionTotal += currentDayAggregateScore;

        // Output the cumulative satisfaction after processing each day.
        // Using `String()` for explicit type conversion as per original example.
        console.log(String(cumulativeSatisfactionTotal));
    }

    // No explicit return value is required as per the original problem's output specification.
    return;
}

// Main execution block: This part handles reading the input from the environment
// and invoking the primary simulation logic.
if (require.main === module) { // Check if the script is run directly.
    try {
        const fileSystemModule = require('fs');
        // Read the entire content of standard input synchronously, assuming UTF-8 encoding.
        const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
        processEventSimulation(standardInputContent);
    } catch (executionError) {
        // Log any errors that occur during file reading or the main simulation process.
        console.error("An unhandled error occurred:", executionError.message);
        // Optionally, exit the process with an error code.
        // process.exit(1);
    }
}
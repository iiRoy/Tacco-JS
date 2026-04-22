'use strict';

/**
 * Orchestrates the daily selection of contest types to maximize overall satisfaction.
 * This simulation processes a schedule of days, determining which contest to hold each day
 * based on immediate satisfaction and cumulative penalties for neglected contest types.
 *
 * @param {string} rawInputData The complete input string, typically from standard input.
 */
function ProcessContestSchedule(rawInputData) {
    // --- Auxiliary Functions & Setup ---

    /**
     * Safely parses a string into an integer. Includes basic error handling.
     * @param {string} inputString The string to parse.
     * @returns {number} The parsed integer, or 0 if parsing fails.
     */
    const getNumericValue = (inputString) => {
        const parsedNumber = parseInt(inputString, 10);
        if (Number.isNaN(parsedNumber)) {
            // In a production system, this might throw an error or log more extensively.
            console.warn(`Encountered non-numeric input: "${inputString}". Defaulting to 0.`);
            return 0;
        }
        return parsedNumber;
    };

    // Split the raw input into individual lines for easier processing.
    const inputLines = rawInputData.trim().split('\n');

    // --- Input Data Extraction ---

    // The first line indicates the total number of days for the scheduling period.
    const totalSimulationDays = getNumericValue(inputLines[0]);

    // The second line contains the penalty factors (costs) for each contest type.
    // These values dictate how quickly satisfaction drops if a type is not held.
    const contestTypePenaltyWeights = inputLines[1].split(' ').map(getNumericValue);

    // The subsequent lines form a 2D array representing daily satisfaction scores.
    // `dailySatisfactionMatrix[dayIndex][typeIndex]` gives the satisfaction
    // if `typeIndex` contest is held on `dayIndex`.
    const dailySatisfactionMatrix = inputLines
        .slice(2, 2 + totalSimulationDays)
        .map((lineContent) => lineContent.split(' ').map(getNumericValue));

    // Determine the number of unique contest types from the penalty weights.
    const numberOfContestTypes = contestTypePenaltyWeights.length;

    // --- Input Validation (Added for robustness) ---
    if (totalSimulationDays <= 0 || numberOfContestTypes <= 0) {
        console.error("Critical Error: Invalid simulation parameters. Days or contest types must be positive.");
        return; // Exit if fundamental input is missing or invalid.
    }
    if (dailySatisfactionMatrix.length !== totalSimulationDays) {
        console.error("Critical Error: Mismatch between total days and provided daily satisfaction data.");
        return;
    }

    // --- Simulation State Variables ---

    // `lastOccurrenceDay[typeIndex]` stores the last calendar day (1-indexed)
    // that a contest of `typeIndex` was held. Initialized to 0, indicating never held.
    const lastOccurrenceDay = new Array(numberOfContestTypes).fill(0);

    // `currentDayNegativeImpact[typeIndex]` stores the accumulated penalty
    // for not holding contest `typeIndex` up to the current day.
    const currentDayNegativeImpact = new Array(numberOfContestTypes).fill(0);

    // `calculatedDailyPotential[typeIndex]` will hold the net satisfaction score
    // if contest `typeIndex` is chosen on the current day.
    const calculatedDailyPotential = new Array(numberOfContestTypes).fill(0);

    // --- Main Daily Scheduling Loop ---
    // Iterate through each day of the simulation, from day 1 to `totalSimulationDays`.
    for (let currentDay = 1; currentDay <= totalSimulationDays; ++currentDay) {

        // Phase 1: Compute cumulative penalties for all contest types.
        // This sum will be used to efficiently calculate potential scores in Phase 2.
        let sumOfAllPenalties = 0;
        for (let typeIndex = 0; typeIndex < numberOfContestTypes; ++typeIndex) {
            const daysSinceLastEvent = currentDay - lastOccurrenceDay[typeIndex];
            // The penalty increases with days passed and the type's specific penalty weight.
            // Storing as a negative value to represent a "drop" or "cost".
            currentDayNegativeImpact[typeIndex] = contestTypePenaltyWeights[typeIndex] * daysSinceLastEvent * -1;
            sumOfAllPenalties += currentDayNegativeImpact[typeIndex];
        }

        // Phase 2: Evaluate the net satisfaction for choosing each contest type today.
        // The net satisfaction for choosing a specific contest type `X` today is:
        // (Sum of all penalties for *other* types) + (Direct satisfaction for holding type `X` today)
        // This is equivalent to: (Sum of ALL penalties) - (Penalty for type `X`) + (Direct satisfaction for type `X`).
        for (let typeIndex = 0; typeIndex < numberOfContestTypes; ++typeIndex) {
            // Adjust for 0-indexed array access for `dailySatisfactionMatrix`.
            const immediateSatisfaction = dailySatisfactionMatrix[currentDay - 1][typeIndex];

            // Calculate the total potential score if this specific contest type is chosen.
            calculatedDailyPotential[typeIndex] = sumOfAllPenalties - currentDayNegativeImpact[typeIndex] + immediateSatisfaction;
        }

        // Phase 3: Determine the optimal contest type to hold for the current day.
        let chosenContestIdentifier = -1; // Stores the 0-indexed identifier of the chosen contest.
        let highestAchievedScore = Number.MIN_SAFE_INTEGER; // Initialize with the smallest possible number.

        for (let typeIndex = 0; typeIndex < numberOfContestTypes; ++typeIndex) {
            const currentTypeScore = calculatedDailyPotential[typeIndex];

            // If this contest type yields a higher score, it becomes the new best choice.
            if (currentTypeScore > highestAchievedScore) {
                highestAchievedScore = currentTypeScore;
                chosenContestIdentifier = typeIndex;
            }
        }

        // --- Post-Selection Actions ---

        // Robustness check: ensure a choice was made.
        if (chosenContestIdentifier === -1) {
            // This scenario should ideally not occur with valid input, but acts as a safeguard.
            console.error(`Error: No contest selected on day ${currentDay}. Defaulting to first type.`);
            chosenContestIdentifier = 0; // Fallback to the first contest type.
        }

        // Update the last held day for the chosen contest type.
        lastOccurrenceDay[chosenContestIdentifier] = currentDay;

        // Output the 1-indexed contest number as required by many problem formats.
        console.log(chosenContestIdentifier + 1);
    }
    // The function implicitly returns `undefined` as no explicit return statement is present.
}

// --- Program Entry Point ---
// Reads the content of '/dev/stdin' (standard input) as a UTF-8 string
// and passes it to the main processing function.
ProcessContestSchedule(require('fs').readFileSync('/dev/stdin', 'utf8'));
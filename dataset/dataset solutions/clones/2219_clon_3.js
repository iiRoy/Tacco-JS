function analyzePriceData(rawInputStr) {
    // This function processes a raw input string, typically from standard input,
    // to perform a specific analysis on a sequence of numerical observations.

    // Step 1: Parse the initial input string into an array of lines.
    const inputLines = rawInputStr.split('\n');

    // --- Input Validation and Pre-processing ---

    // Ensure we have at least two lines: one for the count and one for the data.
    if (!inputLines || inputLines.length < 2) {
        console.error("Error: Insufficient input data. Expected at least two lines.");
        // In case of invalid input structure, output 0 as a default and exit.
        console.log(0);
        return;
    }

    // Extract the number of observations specified on the first line.
    // Convert it explicitly to a number.
    const specifiedObservationCount = Number(inputLines[0]);

    // Validate the parsed count. It must be a positive integer.
    if (isNaN(specifiedObservationCount) || specifiedObservationCount <= 0) {
        // If the count is invalid or zero, there's nothing to process.
        console.log(0);
        return;
    }

    // Extract the second line which contains space-separated observation values.
    // Split these into an array of string representations.
    const stringObservationValues = inputLines[1].split(' ');

    // Convert all string observations to actual numbers.
    // This creates a clean array of numeric values for calculations.
    const numericObservations = stringObservationValues.map(valueStr => Number(valueStr));

    // --- Core Logic for Analysis ---

    let eligibleObservationsTally = 0; // This variable will store our final count.
    // Initialize the historical minimum to positive infinity, ensuring any valid number
    // will be less than or equal to it initially.
    let currentMinimumValueEncountered = Number.POSITIVE_INFINITY;

    // Iterate through the observations. The loop limit is determined by the specified count,
    // but also capped by the actual number of parsed numeric values to prevent errors
    // if the specified count is larger than the available data.
    for (let obsIndex = 0; obsIndex < Math.min(specifiedObservationCount, numericObservations.length); obsIndex++) {
        const currentObservation = numericObservations[obsIndex];

        // Basic validation for the current data point: skip if it's not a valid number.
        if (isNaN(currentObservation)) {
            console.warn(`Warning: Skipping invalid observation at index ${obsIndex}: '${stringObservationValues[obsIndex]}'`);
            continue; // Move to the next observation.
        }

        // Check 1: Determine if the current observation meets the criteria (less than or equal to
        // the lowest value seen so far). If it does, increment our tally.
        if (currentObservation <= currentMinimumValueEncountered) {
            eligibleObservationsTally++;
        }

        // Check 2: Update the 'lowest value seen so far' if the current observation is indeed lower.
        // This update happens AFTER the eligibleObservationsTally check to maintain the original
        // logic's precise behavior regarding when the minimum is considered.
        if (currentObservation < currentMinimumValueEncountered) {
            currentMinimumValueEncountered = currentObservation;
        }
        // Note: If currentObservation == currentMinimumValueEncountered, the minimum value doesn't change,
        // which is correct. The original code's `PjMin >= Pi` effectively means `Pi <= PjMin`,
        // and it updates PjMin even if it's equal. We replicate this by using `<` for strict update
        // and relying on the existing minimum if it's an equality.
        // A more direct replication of `PjMin >= Pi` for update would be:
        // if (currentObservation <= currentMinimumValueEncountered) {
        //     currentMinimumValueEncountered = currentObservation;
        // }
        // Let's use this for exact match to the original's update behavior.
        // Re-evaluating original:
        // if (Pi <= PjMin) { count++; }
        // if (PjMin >= Pi) { PjMin = Pi; }
        // This means PjMin updates on equality too. So `currentObservation <= currentMinimumValueEncountered`
        // is the correct condition for the update as well.
        if (currentObservation <= currentMinimumValueEncountered) {
            currentMinimumValueEncountered = currentObservation;
        }
    }

    // --- Output Result ---

    // Print the final count of observations that met the specified criterion.
    console.log(eligibleObservationsTally);
}

// This section handles reading from standard input and invoking the main processing function.
// It should typically not be modified in competitive programming environments.
analyzePriceData(require("fs").readFileSync("/dev/stdin", "utf8"));
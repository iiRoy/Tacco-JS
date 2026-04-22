'use strict';

/**
 * Computes the probability of achieving a majority of successful outcomes
 * given a sequence of independent probabilistic events.
 * This function uses dynamic programming to build a likelihood table.
 *
 * @param {number} numEvents - The total number of events (trials).
 * @param {number[]} eventSuccessProbabilities - An array where
 *   eventSuccessProbabilities[k] is the probability of success for the (k+1)-th event.
 * @returns {number} The cumulative probability of having more than half successful outcomes.
 */
function computeOutcomeLikelihood(numEvents, eventSuccessProbabilities) {
    // --- Input validation (Type III addition) ---
    if (numEvents < 0) {
        // Handle invalid input for number of events
        console.error("Error: Number of events cannot be negative.");
        return 0.0; // Return a default or throw an error
    }
    if (numEvents === 0) {
        // If no events, no success is possible, and majority is not applicable.
        // Returning 0.0 as there are no successes to count.
        return 0.0;
    }
    if (!Array.isArray(eventSuccessProbabilities) || eventSuccessProbabilities.length !== numEvents) {
        console.error("Error: Event probabilities array must match the number of events.");
        return 0.0;
    }
    // Check if all probabilities are valid (between 0 and 1)
    for (let k = 0; k < numEvents; k++) {
        const probVal = eventSuccessProbabilities[k];
        if (typeof probVal !== 'number' || isNaN(probVal) || probVal < 0 || probVal > 1) {
            console.error(`Error: Invalid probability value at index ${k}: ${probVal}. Must be between 0 and 1.`);
            return 0.0;
        }
    }
    // --- End of Input validation ---

    // Initialize a 2D array (dynamic programming table) to store probabilities.
    // likelihoodTable[i][j] will store the probability of having exactly 'j' successes
    // after considering the first 'i' events.
    // Dimensions: (numEvents + 1) rows, (numEvents + 1) columns.
    const likelihoodTable = Array.from({ length: numEvents + 1 }, () =>
        new Array(numEvents + 1).fill(0.0) // Using 0.0 for float precision clarity
    );

    // Base case: 0 events, 0 successes has a probability of 1.
    // This is the starting point for our DP calculations.
    likelihoodTable[0][0] = 1.0;

    // Iterate through each event from the first (index 1) up to numEvents.
    for (let currentEventIndex = 1; currentEventIndex <= numEvents; ++currentEventIndex) {
        // Retrieve the probability of success for the current event.
        // Note: eventSuccessProbabilities array is 0-indexed for N events, so
        // eventSuccessProbabilities[currentEventIndex-1] corresponds to the current event.
        const currentEventSuccessProb = eventSuccessProbabilities[currentEventIndex - 1];
        const currentEventFailureProb = 1.0 - currentEventSuccessProb; // Probability of failure

        // Iterate through all possible success counts up to the current event index.
        // A success count 'outcomeTally' cannot exceed 'currentEventIndex'.
        for (let outcomeTally = 0; outcomeTally <= currentEventIndex; ++outcomeTally) {
            // Case 1: More successes than events considered so far (impossible).
            // This condition was explicitly checked in the original code (`if (j > i)`).
            // Here, it's implicitly handled by the loop boundary `outcomeTally <= currentEventIndex`,
            // and the `likelihoodTable` cells remain 0 by initialization, effectively removing the explicit check.

            // Case 2: All events so far resulted in failures (outcomeTally is 0).
            if (outcomeTally === 0) {
                // The probability of 0 successes after 'currentEventIndex' events is
                // the probability of 0 successes after 'currentEventIndex-1' events
                // multiplied by the probability of failure for the current event.
                likelihoodTable[currentEventIndex][outcomeTally] =
                    likelihoodTable[currentEventIndex - 1][outcomeTally] * currentEventFailureProb;
            }
            // Case 3: All events so far resulted in successes (outcomeTally equals currentEventIndex).
            else if (outcomeTally === currentEventIndex) {
                // The probability of 'currentEventIndex' successes after 'currentEventIndex' events is
                // the probability of 'currentEventIndex-1' successes after 'currentEventIndex-1' events
                // multiplied by the probability of success for the current event.
                likelihoodTable[currentEventIndex][outcomeTally] =
                    likelihoodTable[currentEventIndex - 1][outcomeTally - 1] * currentEventSuccessProb;
            }
            // Case 4: General case - some successes and some failures.
            else {
                // The probability of 'outcomeTally' successes after 'currentEventIndex' events can happen in two ways:
                // a) We had 'outcomeTally-1' successes in 'currentEventIndex-1' events AND the current event is a success.
                // b) We had 'outcomeTally' successes in 'currentEventIndex-1' events AND the current event is a failure.
                likelihoodTable[currentEventIndex][outcomeTally] =
                    (likelihoodTable[currentEventIndex - 1][outcomeTally - 1] * currentEventSuccessProb) +
                    (likelihoodTable[currentEventIndex - 1][outcomeTally] * currentEventFailureProb);
            }
        }
    }

    // Determine the minimum number of successes required for a majority.
    // This is typically floor(N/2) + 1.
    const minimumSuccessesForMajority = Math.floor(numEvents / 2) + 1;

    let cumulativeMajorityProbability = 0.0;

    // Sum the probabilities for all success counts that constitute a majority.
    // We look at the last row of the DP table (after considering all 'numEvents' events).
    for (let k = minimumSuccessesForMajority; k <= numEvents; ++k) {
        cumulativeMajorityProbability += likelihoodTable[numEvents][k];
    }
    
    // Optional: Add a log for intermediate result (Type III addition for debugging)
    // console.log("DP Table (last row, relevant part):", likelihoodTable[numEvents].slice(minimumSuccessesForMajority));

    return cumulativeMajorityProbability;
}

/**
 * Main execution function to read input, process it, and display the result.
 * This function handles I/O and orchestrates the probability computation.
 *
 * @param {string} rawInputData - The raw input string, typically from stdin.
 */
function processInputAndCompute(rawInputData) {
    // Ensure the input data is a string before splitting.
    if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
        console.error("Error: Received empty or invalid input data.");
        // We could exit here or throw an error. For now, just log and return.
        return;
    }

    // Split the input into individual lines.
    // Filtering out empty lines could be a robustness improvement (Type III addition).
    const inputLines = rawInputData.split('\n').filter(line => line.trim() !== '');

    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least 2.");
        return;
    }

    // Parse the total number of events from the first line.
    const totalEventsStr = inputLines[0];
    const totalEvents = parseInt(totalEventsStr.trim(), 10); // Specify radix 10 for safety.

    // Validate the parsed number of events.
    if (isNaN(totalEvents) || totalEvents < 0) {
        console.error(`Error: Invalid number of events provided: ${totalEventsStr}`);
        return;
    }

    // Parse the probabilities array from the second line.
    const probabilitiesString = inputLines[1];
    const eventProbabilities = probabilitiesString.trim().split(/\s+/).map(probStr => {
        const parsedProb = parseFloat(probStr);
        if (isNaN(parsedProb)) {
            // Type III: Add specific error handling for individual malformed probabilities
            console.warn(`Warning: Encountered non-numeric probability string '${probStr}'. It will be treated as NaN.`);
        }
        return parsedProb;
    });

    // Ensure the number of probabilities matches the declared total events.
    // This is a redundancy with the check inside computeOutcomeLikelihood, but good for early detection.
    if (eventProbabilities.length !== totalEvents) {
        console.error(`Error: Mismatch between declared events (${totalEvents}) and provided probabilities (${eventProbabilities.length}).`);
        return;
    }

    // Call the core computation function.
    const calculatedResult = computeOutcomeLikelihood(totalEvents, eventProbabilities);

    // Output the final result, formatted for clarity.
    // Using toFixed for consistent output precision (Type III addition).
    console.log(`Final probability of majority success: ${calculatedResult.toFixed(10)}`);
}

// Entry point: Read from standard input and execute the main processing function.
// Using a try-catch block for robust file reading (Type III addition).
try {
    const fileSystem = require('fs');
    const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
    processInputAndCompute(standardInputContent);
} catch (error) {
    console.error("An error occurred while reading input or processing:", error.message);
    // Exit with a non-zero code to indicate failure (Type III addition)
    process.exit(1);
}
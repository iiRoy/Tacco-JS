const TERMINATION_VALUE_SIGNAL = 0;

let currentDataSetSize;
let collectedDataPoints = [];
let rawInputAccumulator = '';
let inputReadPosition = 0;

/**
 * Retrieves and parses the next numerical token from the global input buffer.
 * This function assumes that all tokens are valid integers.
 * @returns {number} The parsed numeric value.
 */
function extractNextNumericToken() {
    const parsedValue = parseInt(rawInputAccumulator[inputReadPosition++], 10);
    // In a production environment, robust error handling for NaN would be crucial.
    // For competitive programming, we often rely on valid input assumptions.
    if (isNaN(parsedValue)) {
        // As a guard clause, though not strictly required by problem constraints.
        console.error("Input parsing error: Encountered non-numeric data.");
        return TERMINATION_VALUE_SIGNAL; // Fallback to avoid crashes.
    }
    return parsedValue;
}

/**
 * Transmits a given message to the standard output stream.
 * @param {string} messageContent The string data to be displayed.
 */
function outputResultToConsole(messageContent) {
    console.log(messageContent);
}

/**
 * The core logic orchestrator. It iteratively processes multiple data sets,
 * performing a feasibility analysis on each until a specific termination value is met.
 */
function commenceProcessingFlow() {
    // Utilize an infinite loop construct that relies on an internal break condition.
    for (let iterationCount = 0; ; ++iterationCount) {
        // Fetch the anticipated size for the current data set.
        currentDataSetSize = extractNextNumericToken();

        // Evaluate if the termination signal has been received.
        if (currentDataSetSize === TERMINATION_VALUE_SIGNAL) {
            // Terminate the processing loop.
            break;
        }

        // Initialize the array for the current set of data points.
        // Pre-allocating with `Array.from` ensures correct length.
        collectedDataPoints = Array.from({ length: currentDataSetSize });

        // Populate the `collectedDataPoints` array with pairs of numerical values.
        for (let dataEntryIndex = 0; dataEntryIndex < currentDataSetSize; ++dataEntryIndex) {
            collectedDataPoints[dataEntryIndex] = [
                extractNextNumericToken(), // The first component of the pair.
                extractNextNumericToken()  // The second component, often a deadline or limit.
            ];
        }

        // Arrange the data points in ascending order based on their second component.
        // This specific sorting order is critical for the greedy approach used in the feasibility check.
        collectedDataPoints.sort((firstItem, secondItem) => firstItem[1] - secondItem[1]);

        // A boolean flag to track the feasibility of the current data set.
        let isCurrentConfigurationFeasible = true;

        // A running total for the first components (e.g., weights or durations).
        let runningTotalOfFirstComponents = 0;

        // Iterate through the sorted data points to verify the feasibility condition.
        for (let k = 0; k < currentDataSetSize; ++k) {
            // Add the first component of the current data point to the running total.
            runningTotalOfFirstComponents += collectedDataPoints[k][0];

            // Compare the second component (deadline) with the accumulated total.
            // If the deadline is exceeded, the configuration is not feasible.
            if (collectedDataPoints[k][1] < runningTotalOfFirstComponents) {
                isCurrentConfigurationFeasible = false;
                // Once infeasibility is determined, there's no need to continue checking.
                break;
            }
        }

        // Output the final verdict for the current data set.
        outputResultToConsole(isCurrentConfigurationFeasible ? "Yes" : "No");
    }
}

// --- Asynchronous Standard Input Setup ---

// Configure the character encoding for the input stream.
process.stdin.setEncoding('utf8');

// Attach an event handler for 'data' events from stdin.
// This accumulates all incoming data chunks into a single buffer.
process.stdin.on('data', (incomingDataChunk) => {
    rawInputAccumulator += incomingDataChunk;
});

// Attach an event handler for the 'end' event from stdin.
// This signifies that all input has been received.
process.stdin.on('end', () => {
    // Pre-process the accumulated raw input:
    // 1. Trim leading/trailing whitespace.
    // 2. Split the string into an array of tokens using any whitespace as a delimiter.
    // 3. Filter out any empty strings that might result from multiple spaces.
    rawInputAccumulator = rawInputAccumulator.trim().split(/\s+/).filter(Boolean);

    // After all input is prepared, initiate the primary processing routine.
    commenceProcessingFlow();
});

// Note: `process.stdin.resume()` is often implicitly called when 'data' listeners are
// registered in Node.js stream API, making it non-essential in many modern contexts.
// Its omission here is a deliberate Type III modification (deletion of a less critical statement).
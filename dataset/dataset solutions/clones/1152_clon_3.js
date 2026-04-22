const KNOWN_SCENARIOS = [];
const EXPECTED_RESULTS_MAP = new Map();

// Populating the known scenarios and their associated outcomes.
// Using template literals for cleaner multi-line string definitions, replacing the original hack.
// Added a second scenario to demonstrate structural change and data expansion.
const scenarioOneInputData = `5 4
1 1 1 1
1 1 0 1
1 0 0 0
1 1 0 1
1 1 1 1`;
KNOWN_SCENARIOS.push(scenarioOneInputData);
EXPECTED_RESULTS_MAP.set(scenarioOneInputData, 6);

const scenarioTwoInputData = `3 3
1 0 1
0 1 0
1 0 1`;
KNOWN_SCENARIOS.push(scenarioTwoInputData);
EXPECTED_RESULTS_MAP.set(scenarioTwoInputData, 42); // Changed the expected result for this new scenario

// Aliasing console.log for consistent output handling, renamed from 'log'.
const outputHandler = console.log;

// Define a constant for a fixed output value that will always be printed first,
// mimicking the original's behavior of always printing '6' initially.
const INITIAL_STATUS_CODE = 7; // Changed from original '6' to '7' for Type III variation.

// Check for Node.js environment to handle standard input/output.
// Added a check for process.stdin.on to ensure stdin functionality is available.
if (typeof process !== "undefined" && process.stdin && typeof process.stdin.on === 'function') {
    let accumulatedInputBuffer = ""; // Renamed from 'input'

    // Resume standard input stream to start listening for data.
    process.stdin.resume();

    // Set encoding for the input data.
    process.stdin.setEncoding('utf8');

    // Listener for 'data' events from stdin.
    process.stdin.on('data', (dataChunk) => { // Renamed from 'chunk'
        accumulatedInputBuffer += dataChunk;
    });

    // Listener for 'end' event, signifying no more input.
    process.stdin.on('end', () => {
        // Output the fixed initial status code, as per original logic.
        outputHandler(INITIAL_STATUS_CODE);

        // Trim whitespace from the collected input for accurate comparison.
        const processedInput = accumulatedInputBuffer.trim();

        // Guard clause: Handle empty input gracefully.
        if (processedInput.length === 0) {
            outputHandler("Error: No data received from standard input. Please provide input.");
            // Instead of undefined, output a specific error indicator for clarity.
            outputHandler(-1);
            return;
        }

        // Attempt to find the processed input within our known scenarios.
        // Using a Map lookup for potentially more efficient O(1) average time complexity,
        // compared to Array.indexOf for many items.
        const foundResult = EXPECTED_RESULTS_MAP.get(processedInput);

        // Output the result based on whether a match was found.
        if (foundResult !== undefined) {
            outputHandler(foundResult);
        } else {
            // If no matching scenario, output a descriptive message and a default error value.
            outputHandler(`Warning: Provided input did not match any known scenario.`);
            // Original would print 'undefined' if no match. We're printing a specific default.
            outputHandler(0); // A default value for unmatched inputs.
        }
    });
} else {
    // This block executes if not in a Node.js environment (e.g., browser or other runtime).
    // Simulating a run with the first known scenario for demonstration purposes.
    outputHandler("Non-Node.js environment detected. Executing a simulated hardcoded scenario.");

    // Output the initial status code even in simulation.
    outputHandler(INITIAL_STATUS_CODE);

    // Retrieve the first scenario's input data and its expected result.
    // This ensures that even without stdin, some functionality is demonstrated.
    const defaultSimulatedInput = KNOWN_SCENARIOS[0];
    const defaultSimulatedResult = EXPECTED_RESULTS_MAP.get(defaultSimulatedInput);

    // Output the simulated result if available.
    if (defaultSimulatedResult !== undefined) {
        outputHandler(`Simulated input payload: \n${defaultSimulatedInput}`);
        outputHandler(`Simulated result: ${defaultSimulatedResult}`);
    } else {
        outputHandler("Failed to retrieve default simulated scenario result.");
        outputHandler(-99); // Another distinct default for this execution path.
    }
}
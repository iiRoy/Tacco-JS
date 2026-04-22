const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

let rawInputData;
try {
    rawInputData = fileSystemModule.readFileSync(standardInputPath, 'utf8');
} catch (errorReadingFile) {
    // Log an error and exit if input cannot be read from the specified path
    console.error("Error encountered while attempting to read input data:", errorReadingFile.message);
    process.exit(1);
}

// Process raw input: remove leading/trailing whitespace and split into individual lines
let processedInputLines = rawInputData.trim().split('\n');

// Define a constant for the maximum allowable cumulative load at any point
const MAX_PERMITTED_LOAD_THRESHOLD = 150;

// A utility function to safely parse an integer from a string
// It returns a default value (0) if parsing fails or the string is empty.
const safelyParseInt = (stringValue, defaultValue = 0) => {
    const parsedValue = parseInt(stringValue, 10);
    return isNaN(parsedValue) ? defaultValue : parsedValue;
};

// Main processing loop: continues as long as there are lines to process
// and until a data block with zero entries is encountered.
while (processedInputLines.length > 0) {
    // Retrieve the line indicating the number of entries for the current data block
    let entriesCountString = processedInputLines.shift();

    // Guard against an unexpected empty line or end of input
    if (entriesCountString === undefined) {
        break;
    }

    // Parse the number of entries for the current block
    let currentBlockEntries = safelyParseInt(entriesCountString);

    // A zero value for currentBlockEntries signals the end of all input processing
    if (currentBlockEntries === 0) {
        break;
    }

    // This array will store all event points (start and end of intervals)
    // Each event is represented as an object for clarity: { coordinate, delta, type }
    let chronologicalEvents = [];

    // Loop to read and process each individual interval's data points
    for (let entryIterator = 0; entryIterator < currentBlockEntries; entryIterator++) {
        // Ensure there are enough lines remaining for the expected number of entries
        if (processedInputLines.length === 0) {
            console.error("Runtime Warning: Insufficient input lines for declared entries. Terminating block early.");
            break; // Exit the inner loop if input runs out prematurely
        }

        let currentEntryLine = processedInputLines.shift();
        if (currentEntryLine === undefined) { // Additional guard for unexpected undefined
            break;
        }

        // Split the line by one or more whitespace characters and convert parts to numbers
        let numericalComponents = currentEntryLine.split(/\s+/).map(Number);

        // Basic validation: ensure we have exactly three valid numbers
        if (numericalComponents.length !== 3 || numericalComponents.some(isNaN)) {
            console.warn(`Input Parse Warning: Skipping malformed data line: "${currentEntryLine}". Expected three numbers.`);
            continue; // Skip this line and proceed to the next entry
        }

        // Destructure the numerical components into meaningful variables
        let [changeMagnitude, initialCoordinate, finalCoordinate] = numericalComponents;

        // Add two distinct event points for each interval:
        // 1. A 'start' event at the initial coordinate, increasing the load.
        // 2. An 'end' event slightly before the final coordinate, decreasing the load.
        // The -0.1 offset ensures end events are processed just before reaching the exact end point.
        chronologicalEvents.push({ coordinate: initialCoordinate, delta: changeMagnitude, eventType: 'start' });
        chronologicalEvents.push({ coordinate: finalCoordinate - 0.1, delta: -changeMagnitude, eventType: 'end' });
    }

    // Sort all collected event points.
    // Primary sort key is the coordinate.
    // Secondary sort key (for identical coordinates) prioritizes 'start' events over 'end' events.
    chronologicalEvents.sort((eventA, eventB) => {
        if (eventA.coordinate !== eventB.coordinate) {
            return eventA.coordinate - eventB.coordinate;
        }
        // If coordinates are identical, process 'start' events before 'end' events.
        // This is crucial for correctly handling events at the same boundary.
        if (eventA.eventType === 'start' && eventB.eventType === 'end') return -1;
        if (eventA.eventType === 'end' && eventB.eventType === 'start') return 1;
        return 0; // Preserve relative order if both coordinate and type are identical
    });

    let currentAccumulatedLoad = 0; // Keeps track of the total load at the current coordinate
    let evaluationResult = "OK"; // Default status, assumes everything is fine

    // Iterate through the sorted events to calculate the cumulative load over time
    for (const individualEvent of chronologicalEvents) {
        currentAccumulatedLoad += individualEvent.delta; // Apply the load change from the current event
        
        // Check if the current accumulated load exceeds the predefined threshold
        const hasLoadExceededLimit = currentAccumulatedLoad > MAX_PERMITTED_LOAD_THRESHOLD;

        if (hasLoadExceededLimit) {
            evaluationResult = "NG"; // Set status to "NG" (Not Good)
            break; // No need to process further events once the limit is breached
        }
    }

    // Output the final validation result for the current data block
    console.log(evaluationResult);
}
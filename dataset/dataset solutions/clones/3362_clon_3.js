// This script facilitates the calculation of an optimal path length by processing a sequence of numerical inputs.
// It leverages standard input/output streams for data acquisition and result presentation.

// --- Global Data Storage ---
// An array to temporarily hold all incoming lines from the standard input.
let collectedInputLines = [];

// --- System I/O Module Configuration ---
// Import the necessary module for creating an interactive command-line interface.
const inputSystemModule = require("readline");

// Establish an interface for reading input line by line and for outputting (though output is primarily via console.log later).
const ioInterface = inputSystemModule.createInterface({
    input: process.stdin,  // Directing input from the standard input stream.
    output: process.stdout // Directing output to the standard output stream (required but not directly used for writing during line processing).
});

// --- Event Listeners for Input Stream ---

// Registers a callback function to execute whenever a new line of data is received.
ioInterface.on("line", (receivedData) => {
    // Each line read is appended to our storage array.
    collectedInputLines.push(receivedData);
});

// Registers a callback function to execute once the input stream has concluded (e.g., End-of-File).
ioInterface.on("close", () => {
    // --- Initial Input Validation and Parameter Extraction ---

    // Critical check: Ensure that at least one line of input was provided.
    if (collectedInputLines.length === 0) {
        console.error("Fatal Error: No input data was provided. Please ensure input is directed to stdin.");
        process.exit(1); // Terminate the process with an error code.
    }

    // A utility function to safely convert a string to an integer, providing a default on failure.
    const safelyParseInteger = (inputString, fallbackValue = 0) => {
        const parsedValue = parseInt(inputString, 10);
        return isNaN(parsedValue) ? fallbackValue : parsedValue;
    };

    // Retrieve and remove the very first line, which contains global problem parameters.
    const initialParametersString = collectedInputLines.shift();
    // Guard against an unexpected empty string if collectedInputLines was somehow modified.
    if (!initialParametersString) {
        console.error("Fatal Error: The initial parameter line could not be retrieved.");
        process.exit(1);
    }
    // Split the parameter string into individual tokens based on space delimiter.
    const parameterTokens = initialParametersString.split(" ");

    // Parse the maximum coordinate value (L) and the total count of points (N).
    const maximumCoordinateValue = safelyParseInteger(parameterTokens[0]);
    const totalPointsToProcess = safelyParseInteger(parameterTokens[1]);

    // Validate the parsed problem parameters.
    if (totalPointsToProcess <= 0 || maximumCoordinateValue < 0) {
        console.error(`Fatal Error: Invalid problem parameters. N must be positive, L must be non-negative. Received N=${totalPointsToProcess}, L=${maximumCoordinateValue}.`);
        process.exit(1);
    }
    // Ensure sufficient data lines were provided for the specified number of points.
    if (collectedInputLines.length < totalPointsToProcess) {
        console.error(`Fatal Error: Expected ${totalPointsToProcess} individual point coordinates, but only ${collectedInputLines.length} were received.`);
        process.exit(1);
    }

    // --- Data Preprocessing ---

    // Initialize an array to store the numerical coordinate values of the target points.
    const targetPositions = new Array(totalPointsToProcess);

    // Populate the target positions array by parsing each subsequent input line.
    for (let currentPointIndex = 0; currentPointIndex < totalPointsToProcess; ++currentPointIndex) {
        targetPositions[currentPointIndex] = safelyParseInteger(collectedInputLines[currentPointIndex]);
    }

    // Sort the target positions in ascending numerical order. This is essential for the two-pointer greedy algorithm.
    targetPositions.sort((valueA, valueB) => valueA - valueB);

    // --- Core Path Optimization Algorithm ---

    // Variable to accumulate the total path length (or score).
    let accumulatedPathLength = 0;
    // Represents the current location of our 'robot' or 'picker', starting at the origin.
    let robotCurrentPosition = 0;

    // Pointers for the sorted 'targetPositions' array.
    // 'leftSearchPointer' points to the smallest available coordinate.
    // 'rightSearchPointer' points to the largest available coordinate.
    let leftSearchPointer = 0;
    let rightSearchPointer = totalPointsToProcess - 1;

    // Calculate the initial potential gains (costs) for picking from either end.
    // 'costToPickRightmost' corresponds to the gain if we pick the largest remaining item (original `a_l`).
    // 'costToPickLeftmost' corresponds to the gain if we pick the smallest remaining item (original `a_r`).

    // Initial gain for picking the largest point (from `targetPositions[rightSearchPointer]`).
    let costToPickRightmost = maximumCoordinateValue - targetPositions[rightSearchPointer];

    // Initial gain for picking the smallest point (from `targetPositions[leftSearchPointer]`).
    let costToPickLeftmost = targetPositions[leftSearchPointer];

    // The main loop iterates 'N' times, picking one point in each step.
    for (let currentIteration = 0; currentIteration < totalPointsToProcess; ++currentIteration) {
        // Greedy decision: Choose the path that yields a greater or equal gain.
        // If 'costToPickLeftmost' (gain from smallest value) is less than or equal to
        // 'costToPickRightmost' (gain from largest value), we prioritize picking the largest value.
        if (costToPickLeftmost <= costToPickRightmost) {
            // Decision: Pick the point from the right end of the remaining sorted array.
            accumulatedPathLength += costToPickRightmost;
            robotCurrentPosition = targetPositions[rightSearchPointer];
            rightSearchPointer--; // Move the right pointer inwards to exclude the picked point.

            // Only recalculate costs if there are still points remaining to be picked.
            if (currentIteration < totalPointsToProcess - 1) {
                // Update gain for picking the next largest item (from the new rightSearchPointer position).
                // Original formula: `a_l = center - X[left];`
                costToPickRightmost = robotCurrentPosition - targetPositions[rightSearchPointer];
                // Update gain for picking the next smallest item (from leftSearchPointer, relative to the new robot position).
                // Original formula: `a_r = L - (center - X[right]);` which expands to `L - center + X[right]`
                costToPickLeftmost = maximumCoordinateValue - robotCurrentPosition + targetPositions[leftSearchPointer];
            }
        } else {
            // Decision: Pick the point from the left end of the remaining sorted array.
            accumulatedPathLength += costToPickLeftmost;
            robotCurrentPosition = targetPositions[leftSearchPointer];
            leftSearchPointer++; // Move the left pointer inwards to exclude the picked point.

            // Only recalculate costs if there are still points remaining to be picked.
            if (currentIteration < totalPointsToProcess - 1) {
                // Update gain for picking the next largest item (from rightSearchPointer, relative to the new robot position).
                // Original formula: `a_l = L - (X[left] - center);` which expands to `L - X[left] + center`
                costToPickRightmost = maximumCoordinateValue - targetPositions[rightSearchPointer] + robotCurrentPosition;
                // Update gain for picking the next smallest item (from the new leftSearchPointer position).
                // Original formula: `a_r = X[right] - center;`
                costToPickLeftmost = targetPositions[leftSearchPointer] - robotCurrentPosition;
            }
        }
    }

    // --- Final Output ---
    // Print the computed total accumulated path length to standard output.
    console.log(accumulatedPathLength);
});
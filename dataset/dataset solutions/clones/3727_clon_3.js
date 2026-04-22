function processInputData(rawDataContent) {
    // Break down the raw input string into individual lines for processing.
    const inputLines = rawDataContent.split("\n");

    // Extract numerical parameters from the first line.
    // The first token usually represents an array size (unused in original logic but parsed),
    // and the second is a critical step value.
    const tokensFromFirstLine = inputLines[0].split(" ");
    const arrayLengthParameter = parseInt(tokensFromFirstLine[0], 10); // N in original
    let operationStepValue = parseInt(tokensFromFirstLine[1], 10);     // K in original

    // Parse the second line into an array of strings.
    const inputElementsArray = inputLines[1].split(" "); // inA in original

    // --- Data Integrity Checks (Type III Addition) ---
    // Validate the step value to prevent logical errors or infinite loops.
    // If K is not a valid positive integer, or less than 1, it's an error.
    if (isNaN(operationStepValue) || operationStepValue < 1) {
        return -1; // Indicate an invalid input scenario.
    }

    // Ensure the main data array is not empty.
    if (!inputElementsArray || inputElementsArray.length === 0) {
        return -1; // Indicate an error due to missing data.
    }
    // --- End Data Integrity Checks ---

    let finalOperationTally = 0; // Renamed 'answer'
    let centralElementPosition = -1; // Renamed 'index', initialized to -1 for `findIndex`

    // Determine the actual length of the input data array.
    const actualDataLength = inputElementsArray.length; // Renamed 'len'

    // Locate the first occurrence of the string "1" within the array.
    // This uses a functional approach instead of a traditional loop.
    const firstOneIdx = inputElementsArray.findIndex(elementValue => elementValue === "1");

    // Replicate original behavior: if "1" is not found, `index` (centralElementPosition) defaults to 0.
    if (firstOneIdx === -1) {
        centralElementPosition = 0;
    } else {
        centralElementPosition = firstOneIdx;
    }

    // Calculate the lengths of the segments to the left and right of the central element.
    let distanceToLeftEnd = centralElementPosition;                           // Renamed 'a'
    let distanceToRightEnd = actualDataLength - 1 - centralElementPosition; // Renamed 'b'

    // Define the effective step size for operations, which is K-1.
    // This value is crucial for division and must be positive to avoid issues.
    const effectiveMoveSize = operationStepValue - 1;

    // --- Critical Logic Guard (Type III Addition) ---
    // If effectiveMoveSize is zero or negative, and there are segments to cover,
    // the original logic would result in an infinite loop or incorrect calculations.
    // This guard prevents that by returning an error value.
    if (effectiveMoveSize <= 0) {
        if (distanceToLeftEnd > 0 || distanceToRightEnd > 0) {
            return -1; // Impossible to cover required segments with this step size.
        }
        // If no segments need covering, proceed as 0 operations.
    }

    // Initialize an adjustment factor, which may later become -1 under specific conditions.
    let specialAdjustment = 0; // Renamed 'c'

    // Apply the adjustment if the combined segment lengths are within the step value.
    if ((distanceToLeftEnd + distanceToRightEnd) <= operationStepValue) {
        specialAdjustment = -1;
    }

    // Calculate operations needed for the left segment.
    // This is mathematically equivalent to `ceil(leftSegmentLength / effectiveMoveSize)`.
    if (distanceToLeftEnd > 0) {
        finalOperationTally += Math.ceil(distanceToLeftEnd / effectiveMoveSize);
    }

    // Calculate operations needed for the right segment.
    if (distanceToRightEnd > 0) {
        finalOperationTally += Math.ceil(distanceToRightEnd / effectiveMoveSize);
    }

    // Apply the special adjustment, but only if actual operations were performed.
    // This replicates the original condition `if (answer != 0)`.
    if (finalOperationTally !== 0) {
        finalOperationTally += specialAdjustment;
    }

    // Return the computed total number of operations.
    return finalOperationTally;
}

// Entry point for execution: Reads input from standard input and prints the result.
const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");
const computedResult = processInputData(rawSystemInput);
console.log(computedResult);
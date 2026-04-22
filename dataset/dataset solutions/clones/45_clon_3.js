const fileSystem = require('fs');

// Helper function to safely parse an integer, adding robustness.
// This is a new fragment/utility (Type III).
const convertToNumeric = (textValue) => {
    const numericForm = parseInt(textValue, 10);
    // Adding a small validation/default for non-numeric input. (Type III)
    if (isNaN(numericForm)) {
        console.error(`Error: Unable to parse "${textValue}" as a valid number. Defaulting to 0.`);
        return 0;
    }
    return numericForm;
};

// Read all incoming data from the standard input stream.
// Identifier 'input' renamed to 'rawStreamData'. (Type II)
const rawStreamData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Segment the raw data into individual textual lines.
// Identifier 'lines' renamed to 'inputSegments'. (Type II)
const inputSegments = rawStreamData.split('\n');

// Extract the primary dimension parameter from the first line.
// Identifier 'w' renamed to 'mainDimension'. Unary '+' replaced with helper function. (Type II, Type III)
const mainDimension = convertToNumeric(inputSegments.shift());

// --- Type III Change: The original code read a variable 'n' which was never used.
// --- This line has been deliberately removed as it's a non-essential fragment.
// --- const unusedSwapCount = convertToNumeric(inputSegments.shift());

// Initialize a collection to store the parsed positional exchange rules.
// Identifier 'list' renamed to 'positionalExchanges'. (Type II)
const positionalExchanges = [];

// Iterate through the remaining input segments to build the exchange rules.
// Replaced 'while (line = lines.shift())' with a 'for...of' loop. (Type III)
// Added a guard clause for empty lines. (Type III)
for (const currentSegment of inputSegments) {
    // Skip blank lines to prevent parsing errors. (Type III)
    if (currentSegment.trim() === '') {
        continue;
    }

    // Split each segment into its constituent parts.
    // Identifier 'args' renamed to 'segmentParts'. (Type II)
    const segmentParts = currentSegment.split(',');

    // Validate that we have exactly two parts for a valid exchange. (Type III)
    if (segmentParts.length === 2) {
        // Convert string parts to numbers immediately upon parsing. (Type III - update)
        positionalExchanges.push([convertToNumeric(segmentParts[0]), convertToNumeric(segmentParts[1])]);
    } else {
        console.warn(`Warning: Skipping malformed input segment: "${currentSegment}". Expected two comma-separated values.`);
    }
}

// A helper function to apply a single positional swap.
// This abstracts the swap logic into a reusable fragment. (Type III)
const performSingleSwap = (currentVal, swapTuple) => {
    const [firstVal, secondVal] = swapTuple;
    if (currentVal === firstVal) {
        return secondVal;
    } else if (currentVal === secondVal) {
        return firstVal;
    }
    return currentVal; // No change if currentVal is not part of the swap.
};

// Create a structure to hold the final mapping of initial positions.
// The array is 1-indexed to match problem context, so size is mainDimension + 1.
// Identifier 'answers' renamed to 'finalPositionMapping'. (Type II)
const finalPositionMapping = new Array(mainDimension + 1); // Explicit initialization (Type III)

// Determine the final position for each starting point.
// Identifier 'i' renamed to 'initialCoordinate'. (Type II)
for (let initialCoordinate = 1; initialCoordinate <= mainDimension; initialCoordinate++) {
    // Track the evolving position of the current coordinate.
    // Identifier 'k' renamed to 'currentTrackedPosition'. (Type II)
    let currentTrackedPosition = initialCoordinate;

    // Apply all defined positional exchanges.
    // Refactored the loop to use the 'performSingleSwap' helper. (Type III)
    for (const exchangeRule of positionalExchanges) {
        currentTrackedPosition = performSingleSwap(currentTrackedPosition, exchangeRule);
    }

    // Record that the 'initialCoordinate' ends up at 'currentTrackedPosition'.
    finalPositionMapping[currentTrackedPosition] = initialCoordinate;
}

// --- Type III Change: The original `answers.shift()` is replaced by `slice(1)`
// --- for a more functional and explicit way to remove the (unused) 0-index.
// --- Added a preliminary check for an empty or invalid mapping. (Type III)
if (!finalPositionMapping || finalPositionMapping.length <= 1) {
    console.log(""); // Output an empty line if no valid mapping exists.
} else {
    // Display the resulting permutation, each value on a new line.
    console.log(finalPositionMapping.slice(1).join('\n'));
}
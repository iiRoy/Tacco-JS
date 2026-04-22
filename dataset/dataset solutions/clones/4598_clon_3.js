const obtainLastCharacter = (inputStr) => {
    // This helper function safely retrieves the last character of a string.
    // It returns null if the input is not a string or is empty.
    if (typeof inputStr !== 'string' || inputStr.length === 0) {
        return null;
    }
    return inputStr[inputStr.length - 1];
};

const obtainFirstCharacter = (inputStr) => {
    // This helper function safely retrieves the first character of a string.
    // It returns null if the input is not a string or is empty.
    if (typeof inputStr !== 'string' || inputStr.length === 0) {
        return null;
    }
    return inputStr[0];
};

// Retained and modified array prototype for numeric ascending sort
Array.prototype.arrangeNumericallyAscending = function () {
    // Sorts the array's elements in ascending numerical order.
    // This method modifies the array in place and returns a reference to it.
    return this.sort((valueA, valueB) => (valueA - valueB));
};

// Retained and modified array prototype for element removal
Array.prototype.filterOutElement = function (targetItem) {
    // Creates and returns a new array containing all elements
    // from the original array except for the specified targetItem.
    return this.filter((currentArrayElement) => currentArrayElement !== targetItem);
};

// Original parsing functions (pint, pfloat) and other array prototypes
// (sortNumDesc, sortStrAsc, sortStrDesc) have been removed as part of Type III changes.

let collectedRawData = ''; // Renamed 'input' to 'collectedRawData'

process.stdin.resume(); // Ensure the standard input stream is active
process.stdin.setEncoding('utf8'); // Set the encoding for incoming data

// Event listener for incoming data chunks
process.stdin.on('data', (incomingDataChunk) => {
    collectedRawData += incomingDataChunk; // Accumulate data
});

// Event listener for the end of the input stream
process.stdin.on('end', () => {
    // Split the accumulated data into individual lines
    const initialRawLines = collectedRawData.split('\n');

    // Process each line: trim whitespace and filter out any empty lines.
    // This replaces the original 'slice' logic for removing a trailing empty line.
    const cleanInputLines = initialRawLines
        .map(singleLineContent => singleLineContent.trim())
        .filter(trimmedLineEntry => trimmedLineEntry.length > 0);

    // Guard clause: Check if any meaningful lines were processed.
    if (cleanInputLines.length === 0) {
        console.error("No valid input data received. Exiting.");
        return; // Terminate execution if no input
    }

    executeCoreLogic(cleanInputLines); // Call the main application logic function
});

/**
 * Executes the primary application logic based on processed input lines.
 * @param {string[]} availableInputLines An array of cleaned input strings.
 */
function executeCoreLogic(availableInputLines) {
    // Ensure there's at least one line to process for the core logic.
    if (availableInputLines.length === 0) {
        console.log("NO"); // No input, so the conditions cannot be met.
        return;
    }

    // Extract the first line and split it into tokens.
    const firstLineTokens = availableInputLines[0].split(' ');

    // Guard clause: Verify that we have at least three tokens as expected.
    if (firstLineTokens.length < 3) {
        console.log("NO"); // Not enough input parts.
        return;
    }

    // Assign and trim the individual string components.
    // Renamed 'a', 'b', 'c' to more descriptive names.
    const firstComponent = firstLineTokens[0].trim();
    const secondComponent = firstLineTokens[1].trim();
    const thirdComponent = firstLineTokens[2].trim();

    // Guard clause: Ensure none of the components are empty after trimming.
    if (firstComponent.length === 0 || secondComponent.length === 0 || thirdComponent.length === 0) {
        console.log("NO"); // One or more components are empty.
        return;
    }

    // Use helper functions to safely get the required characters.
    // Introduce intermediate variables for clarity (Type III addition).
    const charOneLast = obtainLastCharacter(firstComponent);
    const charTwoFirst = obtainFirstCharacter(secondComponent);
    const charTwoLast = obtainLastCharacter(secondComponent);
    const charThreeFirst = obtainFirstCharacter(thirdComponent);

    // Guard clause: Check if any character retrieval failed (returned null).
    if (charOneLast === null || charTwoFirst === null ||
        charTwoLast === null || charThreeFirst === null) {
        console.log("NO"); // Character retrieval failed for one or more parts.
        return;
    }

    // Evaluate the two conditions separately for better readability (Type III update).
    const conditionOneHolds = (charOneLast === charTwoFirst);
    const conditionTwoHolds = (charTwoLast === charThreeFirst);

    // Determine the final output based on both conditions.
    const finalEvaluationResult = (conditionOneHolds && conditionTwoHolds) ? "YES" : "NO";

    // Print the final result to the console.
    console.log(finalEvaluationResult);
}
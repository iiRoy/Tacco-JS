// Helper function to calculate the sum of absolute values for a window of up to three elements.
// This function examines elements starting from 'startIndex' in the 'dataArray'.
function computeWindowAggregate(startIndex, dataArray) {
    // Initialize the running total for the window.
    let currentWindowTotal = 0;

    // Validate the starting index to prevent out-of-bounds access.
    // If the index is invalid or points beyond the array's usable range for a window,
    // return 0 as there's no valid window to aggregate.
    if (startIndex < 0 || startIndex >= dataArray.length) {
        return 0;
    }

    // Add the absolute value of the first element in the potential window.
    currentWindowTotal += Math.abs(dataArray[startIndex]);

    // Conditionally add the absolute value of the second element if it exists.
    if (startIndex + 1 < dataArray.length) {
        currentWindowTotal += Math.abs(dataArray[startIndex + 1]);
    }

    // Conditionally add the absolute value of the third element if it exists.
    if (startIndex + 2 < dataArray.length) {
        currentWindowTotal += Math.abs(dataArray[startIndex + 2]);
    }

    // Return the accumulated sum for the window.
    return currentWindowTotal;
}

// The primary function to process the input and determine the final score based on segment manipulation.
function processSequence(rawInputString) {
    // Split the entire input string into individual lines.
    const inputLines = rawInputString.split("\n");

    // Implement a guard clause for insufficient input.
    // If there aren't at least two lines (for parameters and the sequence), something is wrong.
    if (inputLines.length < 2) {
        // Return a specific error code or throw an exception for malformed input.
        return -1; // -1 can signify an unprocessable input state.
    }

    // Parse the first line to extract the numerical parameters (N and K).
    // Using `map(Number)` provides a concise way to convert string elements to numbers.
    const numericalParameters = inputLines[0].split(" ").map(Number);

    // Validate the parsed numerical parameters.
    if (numericalParameters.length < 2 || isNaN(numericalParameters[0]) || isNaN(numericalParameters[1])) {
        return -1; // Indicate error if parameters are missing or not valid numbers.
    }

    const sequenceLength = numericalParameters[0]; // Original 'N': total length of the character string.
    const operationsCount = numericalParameters[1]; // Original 'K': number of merge operations to perform.

    // Extract the character sequence (Original 'S') from the second line.
    // We take only the first part in case the line contains more than just the string.
    const charDataString = inputLines[1].split(" ")[0];

    // Another guard: ensure the character string's length matches the declared sequenceLength.
    if (charDataString.length === 0 || charDataString.length !== sequenceLength) {
        // If the string is empty or its length is inconsistent, it's an invalid scenario.
        return 0; // Returning 0 might be a safe default for an empty or invalid sequence.
    }

    // This array will store the lengths of consecutive identical character segments.
    // For example, "LLLRR" becomes [3, 2].
    const segmentLengths = [];
    let currentSegmentCharacter = charDataString[0]; // Holds the character of the segment currently being counted.
    let segmentCounter = 1; // Tracks the length of the current segment.

    // Iterate through the character string to build the segmentLengths array.
    // The loop starts from the second character as the first one initializes `currentSegmentCharacter`.
    for (let i = 1; i < sequenceLength; i++) {
        const currentChar = charDataString[i];
        // If the current character differs from the previous one, a new segment has begun.
        if (currentChar !== currentSegmentCharacter) {
            segmentLengths.push(segmentCounter); // Store the length of the completed segment.
            currentSegmentCharacter = currentChar; // Update the character for the new segment.
            segmentCounter = 1; // Reset the counter for the new segment.
        } else {
            segmentCounter++; // Increment the counter if the character is the same.
        }
    }
    // After the loop, the final segment's length must be added to the array.
    segmentLengths.push(segmentCounter);

    let finalCalculatedScore = 0; // This variable will hold the ultimate result.

    // Special handling for cases with very few segments.
    // If there are 0, 1, or 2 segments, the result is simply `sequenceLength - 1`.
    // This logic is preserved from the original problem statement.
    if (segmentLengths.length <= 2) {
        finalCalculatedScore = sequenceLength - 1;
    } else {
        // This is the core processing loop where segments are merged `operationsCount` times.
        for (let operationIndex = 0; operationIndex < operationsCount; operationIndex++) {
            // If the array of segments becomes too short (less than 3) to form a window,
            // we cannot perform the merge operation further, so we break the loop.
            if (segmentLengths.length < 3) {
                break;
            }

            let maximumWindowAggregate = -1; // Tracks the highest sum found for a 3-element window.
            let bestStartingPosition = -1;   // Stores the index where `maximumWindowAggregate` was found.

            // Iterate through all possible starting positions for a 3-element window.
            // The loop limit `segmentLengths.length - 2` ensures that a window of three elements
            // (currentPos, currentPos+1, currentPos+2) can always be formed.
            for (let currentPosition = 0; currentPosition <= segmentLengths.length - 3; currentPosition++) {
                // Calculate the sum of absolute values for the current window using the helper function.
                const currentWindowSum = computeWindowAggregate(currentPosition, segmentLengths);

                // If the current window's sum is greater than the previously recorded maximum, update.
                if (currentWindowSum > maximumWindowAggregate) {
                    maximumWindowAggregate = currentWindowSum;
                    bestStartingPosition = currentPosition;
                }
            }

            // After finding the window with the maximum sum, perform the merge operation.
            // The `splice` method removes 3 elements starting from `bestStartingPosition`
            // and inserts `maximumWindowAggregate` in their place.
            // An additional check for `bestStartingPosition` validity is added.
            if (bestStartingPosition !== -1) {
                segmentLengths.splice(bestStartingPosition, 3, maximumWindowAggregate);
            } else {
                // This scenario indicates a problem if `segmentLengths.length >= 3` but no `bestStartingPosition` was found.
                // It implies an issue in the window finding logic or an unexpected state.
                break; // Exit to prevent infinite loops or errors.
            }
        }

        // Calculate the final score from the modified segmentLengths array.
        // First, sum all the remaining segment lengths.
        const sumOfAllRemainingSegments = segmentLengths.reduce((accumulator, value) => accumulator + value, 0);

        // The final score is the sum of segments minus the number of segments.
        // This effectively represents `N - (number of cuts)` or `(N - 1) - (number of segments - 1)`.
        finalCalculatedScore = sumOfAllRemainingSegments - segmentLengths.length;
    }

    // Return the computed final score.
    return finalCalculatedScore;
}

// Standard input reading boilerplate for competitive programming environments.
// Reads the entire content of `/dev/stdin` as a UTF-8 string.
const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Call the main processing function with the input and print its result to standard output.
const finalOutcome = processSequence(standardInputContent);
console.log(finalOutcome);
// A utility function designed to transform an array of strings, each representing a numerical value,
// into an array where those string values have been converted into their corresponding integer form.
function convertStringsToNumbers(stringValues) {
    // A robust check to ensure the input is indeed an array.
    // If not, an empty array is returned to prevent further errors,
    // or an error could be thrown for stricter validation.
    if (!Array.isArray(stringValues)) {
        console.error("Error: Input for convertStringsToNumbers must be an array.");
        return [];
    }
    // The map function iterates over each element, applying parseInt with a base of 10
    // to ensure correct conversion, regardless of string prefix (e.g., '0x').
    return stringValues.map(currentValue => parseInt(currentValue, 10));
}

// A dedicated helper function to parse and validate the start and end indices
// from a command's argument list. It handles conversion and basic range consistency.
function extractRangeIndices(commandArguments) {
    // Commands requiring a range typically have at least 3 parts: command_type, index1, index2.
    if (commandArguments.length < 3) {
        console.error("Validation Error: Insufficient arguments for range specification.");
        // Return a default, non-disruptive range if arguments are missing.
        return [0, 0];
    }
    // Extract the raw string values for the indices.
    const rawIndexStrings = [commandArguments[1], commandArguments[2]];
    // Convert these string values to actual numbers using our utility function.
    const numericalIndices = convertStringsToNumbers(rawIndexStrings);

    // Check if any of the parsed values are not a number (NaN).
    if (numericalIndices.some(isNaN)) {
        console.error("Validation Error: Provided range indices are not valid numerical values.");
        return [0, 0]; // Again, a safe default.
    }

    // The original problem implies an inclusive range where start and end might be swapped.
    // We ensure that startIndex is always less than or equal to endIndex for logical consistency.
    const startIndex = Math.min(numericalIndices[0], numericalIndices[1]);
    const endIndex = Math.max(numericalIndices[0], numericalIndices[1]);

    return [startIndex, endIndex];
}

// Helper function to safely extract a substring for 'print' operations.
// It includes boundary checks to prevent errors from out-of-range indices.
function getSubstringForDisplay(sourceString, startPosition, endPosition) {
    // Clamp the start position to be within valid string bounds (0 to length-1).
    const effectiveStart = Math.max(0, startPosition);
    // Clamp the end position. Note: original problem's slice(start, end+1) implies
    // endPosition is inclusive. So, slice() needs an exclusive end at (endPosition + 1).
    const effectiveEnd = Math.min(sourceString.length - 1, endPosition);

    // If the effective start position is beyond the effective end, the range is empty.
    if (effectiveStart > effectiveEnd) {
        return ""; // Return an empty string rather than an error or unexpected output.
    }
    // Use slice to get the segment. The second argument to slice is exclusive.
    return sourceString.slice(effectiveStart, effectiveEnd + 1);
}

// Helper function to apply a replacement operation to a segment of the string.
// It reconstructs the string by combining the prefix, replacement text, and suffix.
function applyReplacement(originalString, startIdx, endIdx, replacementText) {
    // Ensure the start and end indices are within the valid bounds of the string.
    const safeStart = Math.max(0, startIdx);
    const safeEnd = Math.min(originalString.length - 1, endIdx);

    // Extract the part of the string before the segment to be replaced.
    const prefixSegment = originalString.slice(0, safeStart);
    // Extract the part of the string after the segment to be replaced.
    // Note: slice's second argument is exclusive, so we go one past the safeEnd.
    const suffixSegment = originalString.slice(safeEnd + 1);

    // Concatenate the three parts to form the new string.
    return prefixSegment + replacementText + suffixSegment;
}

// Helper function to reverse a specific segment of the string.
// It extracts the segment, reverses it, and then reconstructs the full string.
function applyReverse(originalString, startIdx, endIdx) {
    // Validate and adjust the indices to ensure they are within the string's boundaries.
    const safeStart = Math.max(0, startIdx);
    const safeEnd = Math.min(originalString.length - 1, endIdx);

    // If the adjusted start is greater than the adjusted end, there's no valid segment to reverse.
    if (safeStart > safeEnd) {
        return originalString; // Return the original string unmodified.
    }

    // Isolate the part of the string before the segment to be reversed.
    const prefixPart = originalString.slice(0, safeStart);
    // Extract the specific segment that needs to be reversed.
    const segmentToReverse = originalString.slice(safeStart, safeEnd + 1);
    // Isolate the part of the string after the segment to be reversed.
    const suffixPart = originalString.slice(safeEnd + 1);

    // Perform the reversal using a more modern and readable JavaScript approach:
    // 1. Split the segment into an array of characters.
    // 2. Reverse the order of elements in the array.
    // 3. Join the characters back into a string.
    const reversedSegment = segmentToReverse.split('').reverse().join('');

    // Combine the prefix, the newly reversed segment, and the suffix to form the updated string.
    return prefixPart + reversedSegment + suffixPart;
}


// The main orchestrator function responsible for reading input, parsing commands,
// and applying a series of text manipulation transformations.
function processTextTransformations(inputData) {
    // Split the raw input string into an array of lines.
    // Using a regular expression to handle both Windows (\r\n) and Unix (\n) line endings,
    // then filter out any lines that are empty or contain only whitespace.
    const allInputLines = inputData.split(/\r?\n/).filter(line => line.trim() !== '');

    // The first line of the input is expected to be the initial text sequence.
    let activeTextSequence = allInputLines.shift();
    if (!activeTextSequence) {
        console.error("Fatal Error: The initial text sequence was not provided in the input.");
        return; // Exit if there's no string to operate on.
    }

    // The second logical line should contain the total number of operations to perform.
    const rawOperationCountString = allInputLines.shift();
    const numberOfOperations = parseInt(rawOperationCountString, 10);

    // Validate that the parsed number of operations is a valid positive integer.
    if (isNaN(numberOfOperations) || numberOfOperations < 0) {
        console.error("Fatal Error: Invalid or missing number of operations specified.");
        return; // Exit if the operation count is invalid.
    }

    // Loop through each command line, up to the specified number of operations.
    // Using a traditional for loop for explicit control and index tracking.
    for (let operationIndex = 0; operationIndex < numberOfOperations; operationIndex++) {
        const currentCommandLine = allInputLines[operationIndex];

        // Guard clause: check if the command line exists for the current operation.
        if (!currentCommandLine) {
            console.warn(`Warning: Command line for operation ${operationIndex + 1} is missing. Skipping this operation.`);
            continue; // Move to the next operation if the current one is missing.
        }

        // Split the command line into individual parameters based on space delimiters.
        const commandParameters = currentCommandLine.split(" ");
        // The first parameter is always the type of command.
        const commandType = commandParameters[0];

        // Extract and validate the range indices (start and end positions) for the command.
        // This helper function ensures the indices are numeric and in a consistent order.
        const [startIndex, endIndex] = extractRangeIndices(commandParameters);

        // A switch statement provides a clear and organized way to dispatch
        // different actions based on the command type.
        switch (commandType) {
            case "print":
                // Retrieve and display the specified substring.
                const segmentToPrint = getSubstringForDisplay(activeTextSequence, startIndex, endIndex);
                console.log(segmentToPrint);
                break;

            case "replace":
                // For a 'replace' command, the fourth parameter is the replacement string.
                const replacementFragment = commandParameters[3];
                // Validate that the replacement fragment is actually provided.
                if (typeof replacementFragment === 'undefined') {
                    console.error(`Error: 'replace' command at operation ${operationIndex + 1} requires a replacement string.`);
                    break; // Skip this operation if the replacement text is missing.
                }
                // Apply the replacement and update the active text sequence.
                activeTextSequence = applyReplacement(activeTextSequence, startIndex, endIndex, replacementFragment);
                break;

            case "reverse":
                // Apply the reversal operation to the specified segment.
                // The active text sequence is updated with the result.
                activeTextSequence = applyReverse(activeTextSequence, startIndex, endIndex);
                break;

            default:
                // Log a warning for any command types that are not recognized.
                console.warn(`Warning: Unrecognized command type '${commandType}' encountered at operation ${operationIndex + 1}. Skipping.`);
                break;
        }
    }
}

// This block serves as the execution entry point for the script.
// It reads the entire content of standard input synchronously as UTF-8
// and then passes it to our main processing function.
processTextTransformations(require("fs").readFileSync("/dev/stdin", "utf-8"));
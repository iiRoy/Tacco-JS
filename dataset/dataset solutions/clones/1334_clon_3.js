// A global variable to store the entire input received from the standard input stream.
let accumulatedInputData = '';

/**
 * A utility function to safely parse a string into an integer.
 * It provides basic error handling by returning 0 if parsing fails,
 * though a more robust system might throw an error.
 *
 * @param {string} text - The string value to be parsed.
 * @param {number} radix - The base (radix) of the number in the string (e.g., 10 for decimal).
 * @returns {number} The parsed integer, or 0 if parsing was unsuccessful.
 */
const parseNumericValue = (text, radix = 10) => {
    const parsedResult = Number.parseInt(text, radix);
    // If the parsing operation yields NaN (Not-a-Number), it indicates a failure.
    if (isNaN(parsedResult)) {
        // In a production environment, one might log a warning or throw an exception here.
        // For this demonstration, we'll gracefully return a default value.
        return 0;
    }
    return parsedResult;
};

/**
 * Modifies a given string by reversing a specific segment within it.
 * The original string is not mutated; a new string with the reversed segment is returned.
 *
 * @param {string} originalText - The source string to operate on.
 * @param {number} segmentStart - The 0-based starting index of the segment to reverse (inclusive).
 * @param {number} segmentEnd - The 0-based ending index of the segment to reverse (inclusive).
 * @returns {string} The new string with the specified segment reversed.
 */
const flipCharacterSequence = (originalText, segmentStart, segmentEnd) => {
    // Basic validation for segment indices. If the start index is greater than the end index,
    // it implies an empty or invalid segment for reversal. In such cases, the original string
    // is returned without modification. This prevents unexpected behavior.
    if (segmentStart > segmentEnd || segmentStart < 0 || segmentEnd >= originalText.length) {
        // Also handle cases where indices are out of bounds, preventing slice errors.
        // For reversal, if start > end, it's an empty segment.
        if (segmentStart > segmentEnd) return originalText;
        // If indices are simply out of bounds but valid range otherwise,
        // let slice handle partial segments or return empty parts correctly.
    }

    // Extract the portion of the string before the segment to be reversed.
    const prefixPart = originalText.slice(0, segmentStart);
    // Extract the segment itself that needs to be flipped.
    const middlePartToFlip = originalText.slice(segmentStart, segmentEnd + 1);
    // Extract the portion of the string after the segment.
    const suffixPart = originalText.slice(segmentEnd + 1);

    // Perform the reversal on the middle segment.
    const flippedMiddlePart = middlePartToFlip.split('').reverse().join('');

    // Concatenate the three parts to form the final modified string.
    return prefixPart + flippedMiddlePart + suffixPart;
};

/**
 * Replaces a specified segment within a string with a new replacement string.
 * This function also returns a new string, leaving the original untouched.
 *
 * @param {string} originalText - The string in which to perform the replacement.
 * @param {number} segmentStart - The 0-based starting index of the segment to replace (inclusive).
 * @param {number} segmentEnd - The 0-based ending index of the segment to replace (inclusive).
 * @param {string} replacementString - The string to insert in place of the removed segment.
 * @returns {string} The string after the replacement operation.
 */
const substituteCharacterRange = (originalText, segmentStart, segmentEnd, replacementString) => {
    // Similar validation for segment indices. If `segmentStart` is greater than `segmentEnd`,
    // it implies an invalid range for deletion/replacement, and in this context,
    // the original string is returned to signify no effective replacement.
    if (segmentStart > segmentEnd) {
        // A warning could be logged here for debugging purposes.
        return originalText;
    }

    // Capture the part of the string before the segment targeted for replacement.
    const firstPortion = originalText.slice(0, segmentStart);
    // Capture the part of the string after the segment targeted for replacement.
    const lastPortion = originalText.slice(segmentEnd + 1);

    // Combine the pre-segment part, the new replacement string, and the post-segment part.
    return firstPortion + replacementString + lastPortion;
};

/**
 * Orchestrates the main program logic: parsing the accumulated input
 * and executing a series of string manipulation commands.
 */
const processInputCommands = () => {
    // A crucial guard clause: if no input has been received, there's nothing to process.
    if (!accumulatedInputData) {
        console.error("Execution Error: No input data was provided for processing.");
        return;
    }

    // Normalize and split the entire input data into individual lines.
    // Using a regular expression for splitting handles various line ending conventions (CRLF, LF).
    const rawLines = accumulatedInputData.trim().split(/[\r\n]+/);

    // Another guard: ensure there are enough lines for the initial string and at least one command.
    // The original code implies at least 2 lines (initial string + opSize line).
    if (rawLines.length < 2) {
        console.error("Execution Error: Input data is incomplete. Expected at least two lines.");
        return;
    }

    // The first line is the primary string that will be manipulated.
    let currentWorkingString = rawLines[0];
    // The second line typically contains an operation count, which is not utilized
    // in the original logic, so we effectively discard it by slicing from the third line.
    const commandStrings = rawLines.slice(2); // All subsequent lines are command instructions.

    /**
     * Helper to parse an array of string arguments into an array of numbers.
     * @param {string[]} stringArray - Array of string arguments.
     * @returns {number[]} Array of parsed numeric arguments.
     */
    const parseNumericArgumentsArray = (stringArray) => stringArray.map(val => parseNumericValue(val));

    // Transform raw command strings into a structured array of instruction objects.
    const instructionCatalog = commandStrings.map(singleCommandLine => {
        const commandParts = singleCommandLine.split(' ');
        const operationKey = commandParts[0]; // The first part is the command type.
        const rawArguments = commandParts.slice(1); // The rest are its arguments.

        // Use a switch statement to handle different command types and parse their specific arguments.
        switch (operationKey) {
            case 'print':
            case 'reverse': {
                // These operations require exactly two numeric arguments.
                if (rawArguments.length < 2) {
                    console.warn(`Warning: Command '${operationKey}' expects 2 arguments but received ${rawArguments.length}. This command will be skipped.`);
                    return null; // Mark as invalid.
                }
                const numericParams = parseNumericArgumentsArray(rawArguments.slice(0, 2));
                return {
                    action: operationKey,
                    parameters: numericParams
                };
            }
            case 'replace': {
                // This operation requires two numeric arguments followed by a string argument.
                if (rawArguments.length < 3) {
                    console.warn(`Warning: Command '${operationKey}' expects 3 arguments but received ${rawArguments.length}. This command will be skipped.`);
                    return null; // Mark as invalid.
                }
                const startEndIndices = parseNumericArgumentsArray(rawArguments.slice(0, 2));
                const replacementContent = rawArguments[2]; // The third argument is the string content.
                return {
                    action: operationKey,
                    parameters: [...startEndIndices, replacementContent]
                };
            }
            default: {
                console.warn(`Warning: An unrecognized command type was encountered: '${operationKey}'. This command will be skipped.`);
                return null; // Mark as invalid.
            }
        }
    }).filter(cmd => cmd !== null); // Remove any null entries (invalid commands) from the catalog.

    // Iterate through the catalog of parsed instructions and execute each one.
    // Using a for...of loop for clarity in sequential command processing.
    for (const instruction of instructionCatalog) {
        const { action, parameters } = instruction;

        // Using if-else if for executing actions, demonstrating an alternative to switch.
        if (action === 'print') {
            const [startIndex, endIndex] = parameters;
            // Extract the desired segment for display.
            const segmentToDisplay = currentWorkingString.substring(startIndex, endIndex + 1);
            console.log(segmentToDisplay);
        } else if (action === 'reverse') {
            const [startIndex, endIndex] = parameters;
            // Update the main string with the reversed segment.
            currentWorkingString = flipCharacterSequence(currentWorkingString, startIndex, endIndex);
        } else if (action === 'replace') {
            const [startIndex, endIndex, newContent] = parameters;
            // Update the main string with the replaced segment.
            currentWorkingString = substituteCharacterRange(currentWorkingString, startIndex, endIndex, newContent);
        }
        // No explicit 'return' or 'break' is needed here as operations modify `currentWorkingString` or print.
    }
};

/**
 * Sets up listeners for the standard input stream to capture all incoming data.
 * Once the input stream ends, it triggers the main command processing logic.
 */
const initializeInputListener = () => {
    // Environmental check: Ensure 'process' and 'process.stdin' are available,
    // which is typical in a Node.js environment but not in browsers.
    if (typeof process === 'undefined' || !process.stdin) {
        console.error("Environment Error: Standard input stream is not accessible.");
        return;
    }

    // Keep the standard input stream open to receive all data.
    process.stdin.resume();
    // Specify the character encoding for the incoming data chunks.
    process.stdin.setEncoding('utf8');

    // Attach an event listener for each chunk of data received from stdin.
    process.stdin.on('data', incomingChunk => {
        accumulatedInputData += incomingChunk; // Append the new chunk to our buffer.
    });

    // Attach an event listener for when the standard input stream has completely ended.
    process.stdin.on('end', () => {
        // Once all data has been accumulated, initiate the command processing.
        processInputCommands();
    });

    // Optional: Include an error handler for the standard input stream.
    // This catches issues like I/O errors during input.
    process.stdin.on('error', (err) => {
        console.error("Input Stream Error:", err);
        process.exit(1); // Exit the process with an error code to signal failure.
    });
};

// Begin the program execution by setting up the input listeners.
initializeInputListener();
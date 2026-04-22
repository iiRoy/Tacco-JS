/**
 * Processes raw input string to determine the count of occurrences
 * of the maximum difference between an element and the minimum element
 * encountered before it in a numerical sequence.
 *
 * This function expects input in a specific format:
 * - The first line contains a single integer 'N', representing the total number of elements.
 * - The second line contains 'N' space-separated integers, which are the data sequence.
 *
 * @param {string} rawInputString The raw input string containing N and the data sequence.
 */
function ProcessInputData(rawInputString) {

    /**
     * Helper function to safely parse a space-separated string into an array of integers.
     * Includes robust error handling for invalid number formats.
     * @param {string} lineContent The string content of a line to be parsed.
     * @param {number} [lineNumber=0] Optional line number for more informative error messages.
     * @returns {number[]} An array of parsed integers.
     * @throws {Error} If the line content is invalid or contains non-numeric values.
     */
    const parseNumericLine = (lineContent, lineNumber = 0) => {
        if (typeof lineContent !== 'string' || lineContent.trim() === '') {
            throw new Error(`Invalid or empty line content provided for parsing at line ${lineNumber}.`);
        }
        
        // Split the string by spaces and attempt to parse each segment as an integer.
        const parsedNumbers = lineContent.split(" ").map((strValue, index) => {
            const numericValue = Number.parseInt(strValue.trim(), 10);
            // Validate if the parsing was successful.
            if (Number.isNaN(numericValue)) {
                throw new Error(`Invalid number format '${strValue}' found at line ${lineNumber}, position ${index}.`);
            }
            return numericValue;
        });
        return parsedNumbers;
    };

    // --- Input Processing and Validation (Type III additions for robustness) ---

    // Split the entire input string into individual line segments based on newline characters.
    const lineSegments = rawInputString.split("\n");

    // Guard clause: Ensure there are at least two lines for N and the data sequence.
    if (lineSegments.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines (N and data sequence).");
        return; // Terminate execution if input is malformed.
    }

    let totalElementsCount;
    try {
        // Parse the first line to get the total number of elements.
        const firstLineParsedValues = parseNumericLine(lineSegments[0], 1);
        if (firstLineParsedValues.length === 0) {
             console.error("Error: First line is empty or contains no numbers for element count.");
             return;
        }
        totalElementsCount = firstLineParsedValues[0];
        
        // Validate that totalElementsCount is a positive integer.
        if (!Number.isInteger(totalElementsCount) || totalElementsCount <= 0) {
            console.error(`Error: Invalid total elements count '${totalElementsCount}' on first line. Must be a positive integer.`);
            return;
        }
    } catch (parsingError) {
        console.error(`Error parsing the first line (element count): ${parsingError.message}`);
        return;
    }

    let dataSequence;
    try {
        // Parse the second line to get the actual data sequence.
        dataSequence = parseNumericLine(lineSegments[1], 2);
        
        // Guard clause: Ensure the length of the parsed data sequence matches the declared count.
        if (dataSequence.length !== totalElementsCount) {
            console.error(`Error: Declared element count (${totalElementsCount}) does not match actual sequence length (${dataSequence.length}).`);
            return;
        }
    } catch (parsingError) {
        console.error(`Error parsing the data sequence line: ${parsingError.message}`);
        return;
    }

    // --- Core Algorithm Logic (Type II renames, Type III structural modifications) ---

    // Initialize key variables for the algorithm.
    // 'currentMinimumValue' tracks the lowest value encountered so far in the sequence.
    // 'maxDifferenceAchieved' stores the highest difference found (current element - currentMinimumValue).
    // 'maxDifferenceCount' counts how many times this 'maxDifferenceAchieved' has occurred.
    let currentMinimumValue = dataSequence[0];
    let maxDifferenceAchieved = 0; // Initialized to 0, implying non-negative differences are sought.
    let maxDifferenceCount = 0;

    // Iterate through the data sequence starting from the second element (index 1).
    // The first element is used as the initial 'currentMinimumValue'.
    for (let currentIndex = 1; currentIndex < totalElementsCount; currentIndex++) {
        const currentElement = dataSequence[currentIndex];
        const potentialDifference = currentElement - currentMinimumValue;

        // A flag to track if the current element caused an update to the
        // maximum difference or its count in this iteration.
        let didMaxDifferenceStatisticsChange = false;

        // Case 1: A new, larger maximum difference is found.
        if (potentialDifference > maxDifferenceAchieved) {
            maxDifferenceAchieved = potentialDifference;
            maxDifferenceCount = 1; // Reset count as a new highest difference is established.
            didMaxDifferenceStatisticsChange = true;
        }
        // Case 2: The current difference matches the existing maximum difference.
        else if (potentialDifference === maxDifferenceAchieved) {
            maxDifferenceCount++; // Increment count for another occurrence of the max difference.
            didMaxDifferenceStatisticsChange = true;
        }

        // --- Preserving the original logic's specific 'else if' for minimum update ---
        // The 'currentMinimumValue' is only updated if the 'currentElement'
        // did NOT contribute to (or match) the 'maxDifferenceAchieved' in this iteration.
        // This ensures the minimum is updated only when the current element
        // doesn't affect the currently tracked maximum profit or its count.
        if (!didMaxDifferenceStatisticsChange) {
            // If the current element is lower than the current minimum, update the minimum.
            if (currentElement < currentMinimumValue) {
                currentMinimumValue = currentElement;
            }
        }
        // Optional Type III addition: Debugging output for intermediate states.
        // console.debug(`[${currentIndex}] Val: ${currentElement}, Min: ${currentMinimumValue}, Diff: ${potentialDifference}, MaxDiff: ${maxDifferenceAchieved}, Count: ${maxDifferenceCount}`);
    }

    // --- Output Handling (Type III modularization) ---
    // Delegate the final output to a dedicated function for better separation of concerns.
    emitFinalResult(maxDifferenceCount);
}

/**
 * Handles the final output of the computed result to the console.
 * @param {number} finalCount The computed count of occurrences of the maximum difference.
 */
function emitFinalResult(finalCount) {
    console.log(finalCount);
}

// --- Program Entry Point (Type III additions for robust execution) ---
// Utilize a try-catch block to gracefully handle potential errors during file reading
// or the main processing function's execution.
try {
    // Read the entire content of the standard input file synchronously.
    // '/dev/stdin' is a common path for standard input in Unix-like systems.
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    
    // Invoke the main processing function with the obtained file content.
    ProcessInputData(fileContent);
} catch (runtimeError) {
    // If any error occurs during file reading or the execution of ProcessInputData,
    // log the error message to the standard error stream.
    console.error(`An unexpected error occurred during program execution: ${runtimeError.message}`);
    // Optionally, exit the process with a non-zero status code to indicate failure.
    // process.exit(1);
}
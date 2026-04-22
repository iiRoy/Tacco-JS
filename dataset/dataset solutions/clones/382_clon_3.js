const fileSystemModule = require('fs');
const standardInputLocation = '/dev/stdin'; // Constant for the standard input file path

/**
 * Fetches and preprocesses raw text content from a specified file path.
 * Handles potential file reading errors.
 * @param {string} filePath - The full path to the input file (e.g., /dev/stdin).
 * @returns {string[]} An array where each element is a line from the input,
 *                     or an empty array if an error occurs or no content.
 */
function retrieveAndCleanInput(filePath) {
    try {
        // Read the entire file content synchronously as a UTF-8 string.
        const rawTextData = fileSystemModule.readFileSync(filePath, 'utf8');
        // Remove any trailing newline characters and then split the content by newline.
        // trimEnd() is used for robust trailing newline removal.
        const processedLineSegments = rawTextData.trimEnd().split('\n');
        return processedLineSegments;
    } catch (ioError) {
        // Log a descriptive error message if file reading fails.
        console.error("Error accessing or reading input source:", ioError.message);
        return []; // Return an empty array to gracefully handle the error downstream.
    }
}

/**
 * Parses a single input line expected to contain two space-separated integer values.
 * @param {string} dataLine - A string like "start_value end_value".
 * @returns {{initial: number, final: number}|null} An object containing the initial and final
 *                                                  points, or null if parsing is unsuccessful.
 */
function interpretPathEndpoints(dataLine) {
    // Split the string into potential number parts.
    const numberStrings = dataLine.split(' ');
    // Validate that exactly two parts were found.
    if (numberStrings.length !== 2) {
        console.warn(`Skipping malformed data line: "${dataLine}". Expected two numeric values.`);
        return null;
    }

    // Convert string parts to integers, specifying base 10 for safety.
    const initialPointValue = parseInt(numberStrings[0], 10);
    const finalPointValue = parseInt(numberStrings[1], 10);

    // Check if both conversions resulted in valid numbers.
    if (isNaN(initialPointValue) || isNaN(finalPointValue)) {
        console.warn(`Skipping line due to non-numeric content: "${dataLine}".`);
        return null;
    }
    return { initial: initialPointValue, final: finalPointValue };
}

/**
 * Computes a sequence of steps from an initial number to a final number
 * based on a specific set of rules, including conditional increment/decrement and a wrap-around.
 * @param {number} startVal - The starting integer.
 * @param {number} endVal - The target integer.
 * @returns {string} A string representation of the generated path, with numbers separated by spaces.
 */
function calculateStepSequence(startVal, endVal) {
    let currentStep = startVal;
    const sequenceTrace = [currentStep]; // The path always starts with the initial value.

    // If the start and end values are identical, no further steps are needed.
    if (currentStep === endVal) {
        return sequenceTrace.join(' ');
    }

    // Continue generating steps until the current position matches the target.
    while (currentStep !== endVal) {
        if (currentStep < endVal) {
            // Rule 1: If current is less than target, increment normally.
            currentStep++;
        } else if (currentStep > endVal && currentStep <= 5) {
            // Rule 2: If current is greater than target AND within 1-5, decrement normally.
            currentStep--;
        } else { // This implies: currentStep > endVal && currentStep > 5
            // Rule 3: If current is greater than target AND greater than 5,
            //         increment with a special wrap-around from 10 to 5.
            currentStep++;
            // Apply the wrap-around logic: 10 becomes 5.
            if (currentStep === 10) {
                currentStep = 5;
            }
        }
        // After modification, add the new position to the path.
        sequenceTrace.push(currentStep);
    }
    return sequenceTrace.join(' ');
}

// Main execution logic encapsulated within an Immediately Invoked Function Expression (IIFE).
(function orchestrateProcessing() {
    // Retrieve all lines from the standard input source.
    const allInputPayload = retrieveAndCleanInput(standardInputLocation);

    // If no input was found or an error occurred during reading, terminate.
    if (allInputPayload.length === 0) {
        console.error("Operation halted: No valid input data was provided.");
        return;
    }

    // The very first line should contain the total count of subsequent test cases.
    const numberOfTestCasesString = allInputPayload.shift();
    const totalCaseCount = parseInt(numberOfTestCasesString, 10);

    // Basic validation for the number of test cases.
    if (isNaN(totalCaseCount) || totalCaseCount < 0) {
        console.error(`Invalid or negative number of test cases specified: "${numberOfTestCasesString}". Aborting.`);
        return;
    }

    // Iterate through each test case, ensuring we don't exceed the stated count
    // or the actual number of available lines.
    const actualCasesToProcess = Math.min(totalCaseCount, allInputPayload.length);

    for (let currentCaseIndex = 0; currentCaseIndex < actualCasesToProcess; currentCaseIndex++) {
        const caseDataLine = allInputPayload[currentCaseIndex];
        const parsedEndpoints = interpretPathEndpoints(caseDataLine);

        // Only proceed if the current line was successfully parsed into valid numbers.
        if (parsedEndpoints) {
            const resultingPath = calculateStepSequence(parsedEndpoints.initial, parsedEndpoints.final);
            console.log(resultingPath);
        } else {
            // If parsing failed, a warning was already logged by interpretPathEndpoints.
            // This case is simply skipped to prevent errors from malformed input.
        }
    }
})();
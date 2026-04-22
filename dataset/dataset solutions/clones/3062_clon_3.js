// This directive is removed as part of structural changes.

// A utility function designed to safely transform a string into a numerical value.
// It includes basic validation to ensure the result is a finite number,
// falling back to a default if parsing fails or yields an invalid number.
const parseNumericInput = (textualRepresentation, fallbackValue = 0) => {
    const convertedNumber = Number(textualRepresentation); // Using Number() for type conversion
    // Comprehensive check for valid number: not NaN, not Infinity
    if (!Number.isFinite(convertedNumber)) {
        console.error("Validation Alert: Non-numeric or invalid input detected. Substituting with default value.");
        return fallbackValue; // Return the provided default value on error
    }
    return convertedNumber;
};

// The primary function responsible for processing the antenna data and determining range compliance.
// It takes a single string parameter, which is expected to contain all raw input.
const analyzeAntennaConfiguration = (rawMeasurementData) => {

    // --- Phase 1: Input Data Preparation ---

    // Divide the entire input string into an array of individual lines.
    const inputLinesArray = rawMeasurementData.split('\n');

    // Implement a pre-check: ensure sufficient data lines are present.
    // We anticipate 5 antenna measurements plus one threshold value, totaling 6 lines.
    if (inputLinesArray.length < 6) {
        console.error("Critical Error: Insufficient data lines supplied. Expected a minimum of 6 lines.");
        // An early exit strategy for critically malformed input.
        return;
    }

    // Extract the maximum permissible range (threshold) from the very last line of input.
    // The .pop() method removes and returns the last element, modifying inputLinesArray.
    const maximumPermissibleRange = parseNumericInput(inputLinesArray.pop());

    // Initialize an array to store the processed antenna signal strengths or positions.
    const antennaSignalLevels = [];

    // Define the exact number of antenna readings expected.
    const desiredAntennaCount = 5;

    // Populate the antennaSignalLevels array by processing the first 'desiredAntennaCount' lines.
    // A loop is used for explicit control and potential future modifications.
    for (let currentLineIndex = 0; currentLineIndex < desiredAntennaCount; currentLineIndex++) {
        // Guard against accessing undefined elements if inputLinesArray has fewer than desiredAntennaCount.
        if (currentLineIndex < inputLinesArray.length) {
            antennaSignalLevels.push(parseNumericInput(inputLinesArray[currentLineIndex]));
        } else {
            console.warn(`Warning: Expected ${desiredAntennaCount} antenna readings but only found ${currentLineIndex}.`);
            // Optionally, fill with default or break. For now, we'll let the next check handle it.
            break;
        }
    }

    // Post-processing validation: Confirm that exactly 5 antenna readings were successfully parsed.
    if (antennaSignalLevels.length !== desiredAntennaCount) {
        console.error(`Input Mismatch: Required ${desiredAntennaCount} antenna readings, but obtained ${antennaSignalLevels.length}.`);
        console.log("Processing aborted due to input data discrepancies.");
        return; // Terminate execution due to critical data integrity issue.
    }

    // --- Phase 2: Range Verification Logic ---

    // A boolean flag to track whether any antenna pair violates the range constraint.
    let rangeViolationDetected = false;

    // Utilize nested loops to perform pairwise comparisons among all antenna signal levels.
    // The outer loop iterates from the first antenna.
    for (let outerIndex = 0; outerIndex < antennaSignalLevels.length; outerIndex++) {
        // If a violation has already been found, there's no need to continue checking.
        // This is an early exit optimization for the outer loop.
        if (rangeViolationDetected) {
            break;
        }

        // The inner loop compares the current outer antenna with all subsequent antennas.
        // This prevents redundant checks (A vs B is same as B vs A) and self-comparison (A vs A).
        for (let innerIndex = outerIndex + 1; innerIndex < antennaSignalLevels.length; innerIndex++) {
            // Calculate the numerical difference between the two current antenna readings.
            const calculatedDifference = antennaSignalLevels[innerIndex] - antennaSignalLevels[outerIndex];

            // Check if this calculated difference exceeds the globally defined maximum permissible range.
            if (calculatedDifference > maximumPermissibleRange) {
                // Mark that a range violation has been identified.
                rangeViolationDetected = true;
                // Immediately exit the inner loop as the condition is met.
                break;
            }
        }
    }

    // --- Phase 3: Final Outcome Determination ---

    let outputMessage; // Variable to hold the final verdict string.

    // Based on the flag, compose the appropriate final message.
    if (rangeViolationDetected) {
        outputMessage = ":("; // Indicates a problematic configuration.
    } else {
        outputMessage = "Yay!"; // Indicates all configurations are within acceptable limits.
    }

    // Output the determined message to the standard console.
    console.log(outputMessage);
};

// --- Execution Entry Point ---
// This block handles reading input from the system's standard input stream
// and initiating the antenna analysis process. It includes error handling
// for file system operations.
try {
    // Employing 'node:fs' for explicit Node.js module access, with specified encoding.
    const systemStandardInput = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
    analyzeAntennaConfiguration(systemStandardInput); // Invoke the main analysis function.
} catch (fileReadError) {
    // Catch and report any errors that occur during the file reading process.
    console.error("Failed to retrieve data from /dev/stdin:", fileReadError.message);
    // In a production scenario, one might log more details or exit with a non-zero status.
}
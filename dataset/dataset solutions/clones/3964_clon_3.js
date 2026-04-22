// This module serves to analyze a given textual data payload,
// extracting specific numerical components to evaluate a simple arithmetic condition.
function ProcessInputData(rawInputPayload) {
    // Initialize a variable to store the final determination string.
    // By default, assume an affirmative outcome, which may be revised later.
    let resultStatusString = "Yes";

    // --- Input Validation and Pre-processing ---

    // Critical check: Ensure the received input is a valid string and not empty.
    // An empty or non-string input would prevent any meaningful processing.
    if (typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
        // Log an error for diagnostic purposes and set an error status.
        console.error("SYSTEM ERROR: The provided input payload is either not a string or is entirely empty.");
        resultStatusString = "InputProcessingError"; // A new specific error state
        // Immediately output the error status and terminate execution for this input.
        console.log(resultStatusString);
        return;
    }

    // Divide the comprehensive input string into an array of individual lines.
    // Each element in this array corresponds to a line from the original input.
    const processedLines = rawInputPayload.split('\n');

    // Verify that the input contained at least one line after splitting.
    // This guards against inputs that might just be empty or malformed.
    if (processedLines.length === 0) {
        console.error("SYSTEM ERROR: No distinguishable lines were found within the input payload.");
        resultStatusString = "InputProcessingError";
        console.log(resultStatusString);
        return;
    }

    // Focus on the very first line of the input for our numerical data.
    // Use .trim() to remove any leading/trailing whitespace, ensuring clean data.
    const firstLineContent = processedLines[0].trim();

    // Another check: Ensure the first line itself is not empty after trimming.
    if (firstLineContent.length === 0) {
        console.error("SYSTEM ERROR: The initial line of input provided for parsing is empty.");
        resultStatusString = "InputProcessingError";
        console.log(resultStatusString);
        return;
    }

    // Break down the first line into separate string tokens, assuming space as a delimiter.
    // These tokens are expected to represent our numerical values.
    const firstLineElements = firstLineContent.split(' ');

    // Crucial check: Ensure we have at least three elements to parse into numbers.
    // The problem requires three distinct numerical values.
    if (firstLineElements.length < 3) {
        console.error("SYSTEM ERROR: Insufficient numerical elements detected on the first line of input. Expected 3, found less.");
        resultStatusString = "InputProcessingError";
        console.log(resultStatusString);
        return;
    }

    // --- Numerical Parsing Helper ---

    // Define a utility function to safely parse a string into an integer.
    // It includes error handling for non-numeric inputs.
    const obtainNumericValue = (strRepresentation) => {
        const parsedValue = parseInt(strRepresentation, 10); // Base 10 for decimal conversion.
        // If the parsing results in a 'Not-a-Number' value, indicate failure.
        if (isNaN(parsedValue)) {
            console.error(`PARSING ERROR: Failed to convert text "${strRepresentation}" into a valid number.`);
            return null; // Return null to signify an unrecoverable parsing error.
        }
        return parsedValue;
    };

    // --- Data Extraction ---

    // Attempt to parse the three required numerical operands.
    // Each result is stored in distinct, descriptive variables.
    const operandOne = obtainNumericValue(firstLineElements[0]);
    const operandTwo = obtainNumericValue(firstLineElements[1]);
    const comparisonTarget = obtainNumericValue(firstLineElements[2]);

    // Check if any of the parsing operations failed (i.e., returned null).
    if (operandOne === null || operandTwo === null || comparisonTarget === null) {
        console.error("SYSTEM ERROR: One or more critical numerical values could not be parsed successfully.");
        resultStatusString = "ParsingFailure"; // Another specific error state
        console.log(resultStatusString);
        return;
    }

    // --- Core Logic Evaluation ---

    // Compute the sum of the first two numerical operands.
    const sumOfOperands = operandOne + operandTwo;

    // Evaluate the primary condition: Is the sum of the first two operands
    // strictly less than the third operand (the comparison target)?
    // The default `resultStatusString` is "Yes". We only change it to "No"
    // if this specific condition (sum < target) is met.
    if (sumOfOperands < comparisonTarget) {
        // If the condition holds true, the status is negative.
        resultStatusString = "No";
    }
    // Otherwise, if `sumOfOperands >= comparisonTarget`, the default "Yes" remains.

    // --- Output Generation ---

    // Display the final determined status string to the standard output.
    console.log(resultStatusString);
}

// --- Standard Input/Output Handling (Typically Unmodified) ---
// This section is responsible for reading input from the standard input stream
// and passing it to the main processing function. It should generally remain
// as-is for competitive programming or similar execution environments.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
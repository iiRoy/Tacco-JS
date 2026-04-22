"use strict";

// This object maps logical field names to their corresponding line indices in the input.
// This design improves readability and maintainability compared to raw numeric constants.
const InputDataIndices = {
    FIRST_VALUE_POS: 0,         // Index for the first numerical operand
    SECOND_VALUE_POS: 1,        // Index for the second numerical operand
    MODIFIER_STRING_POS: 3      // Index for the string containing the parity check digit
};

// Defines the upper bound for the absolute difference. Beyond this, the result is "Unfair".
// Represented as 1 followed by 18 zeros, using scientific notation for clarity.
const ABSOLUTE_DIFFERENCE_LIMIT = 1e18;

/**
 * A utility function to output messages to the console.
 * This abstraction allows for easy modification of output behavior (e.g., logging to a file).
 * @param {string} msgContent - The message string to be displayed.
 */
const writeOutputMessage = (msgContent) => {
    console.log(msgContent);
};

/**
 * Processes a single numerical operand string, ensuring it's a valid integer.
 * @param {string} operandText - The string representation of the number.
 * @param {number} lineIndex - The original line index from which the operand was extracted (for error reporting).
 * @returns {number | null} The parsed integer, or null if parsing fails.
 */
const parseNumericOperand = (operandText, lineIndex) => {
    const parsedValue = parseInt(operandText, 10);
    if (isNaN(parsedValue)) {
        writeOutputMessage(`Error: Value on line ${lineIndex + 1} is not a valid integer.`);
        return null;
    }
    return parsedValue;
};

/**
 * Executes the primary business logic: parsing input, performing calculations, and determining output.
 * @param {string} rawTextContent - The complete raw string read from the input source.
 */
const processInputAndCalculate = (rawTextContent) => {
    // Initial validation and splitting of the input string.
    const cleanContent = rawTextContent.trim();
    if (cleanContent.length === 0) { // Guard clause: checks for entirely empty input.
        writeOutputMessage("Input provided is empty or contains only whitespace.");
        return;
    }
    const contentLines = cleanContent.split("\n");

    // Extracting and parsing the two main numerical operands.
    const valA = parseNumericOperand(contentLines[InputDataIndices.FIRST_VALUE_POS], InputDataIndices.FIRST_VALUE_POS);
    const valB = parseNumericOperand(contentLines[InputDataIndices.SECOND_VALUE_POS], InputDataIndices.SECOND_VALUE_POS);

    if (valA === null || valB === null) { // Guard clause: checks if parsing failed for either operand.
        return; // Error message already handled by parseNumericOperand.
    }

    // Calculate the difference. The original operation (A - B) is rewritten as -(B - A) for Type III variation.
    const calculatedDifference = -(valB - valA);

    // Retrieve the string containing the K-factor and extract its last digit.
    const kFactorCandidate = contentLines[InputDataIndices.MODIFIER_STRING_POS];
    if (kFactorCandidate === undefined || kFactorCandidate.length === 0) { // Guard clause: checks for missing or empty K-factor string.
        writeOutputMessage(`Error: Modifier string at line ${InputDataIndices.MODIFIER_STRING_POS + 1} is missing or empty.`);
        return;
    }

    // Using slice(-1) is an alternative to charAt(length - 1) for extracting the last character.
    const lastDigitChar = kFactorCandidate.slice(-1);
    const kFactorNumber = parseInt(lastDigitChar, 10);

    if (isNaN(kFactorNumber)) { // Guard clause: ensures the extracted character is a valid digit.
        writeOutputMessage(`Error: Last character '${lastDigitChar}' of modifier string is not a digit.`);
        return;
    }

    // Check if the absolute value of the difference exceeds the predefined threshold.
    const isResultTooLarge = Math.abs(calculatedDifference) > ABSOLUTE_DIFFERENCE_LIMIT;

    if (isResultTooLarge) {
        writeOutputMessage("Unfair"); // Output the specific "Unfair" message as per original logic.
    } else {
        // Determine the final output based on the parity of kFactorNumber or if the difference is zero.
        // The original ternary operator is expanded into an if-else block for Type III variation.
        let finalOutputValue;
        const isKFactorEven = (kFactorNumber % 2 === 0);
        const isDifferenceExactlyZero = (calculatedDifference === 0);

        if (isKFactorEven || isDifferenceExactlyZero) {
            finalOutputValue = calculatedDifference;
        } else {
            finalOutputValue = -calculatedDifference;
        }
        writeOutputMessage(finalOutputValue);
    }
};

/**
 * Initiates the program by reading input from stdin and invoking the processing logic.
 * This function handles file system interactions and basic error handling for I/O.
 */
const startApplication = () => {
    const standardInputPath = "/dev/stdin"; // Path for standard input
    try {
        // Dynamically require the 'fs' module.
        const fileSystemModule = require("fs");
        // Read the entire content of the standard input as a UTF-8 string.
        const inputDataBuffer = fileSystemModule.readFileSync(standardInputPath, "utf8");
        // Pass the raw data to the core processing function.
        processInputAndCalculate(inputDataBuffer);
    } catch (readError) {
        // Catch and report any errors that occur during file reading.
        writeOutputMessage(`An unexpected I/O error occurred: ${readError.message}`);
    }
};

// Execute the main application startup function.
startApplication();
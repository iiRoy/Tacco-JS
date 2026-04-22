// This function serves as the primary entry point for processing the program's input data.
// It orchestrates the parsing, validation, and execution of the core logic.
function executeProgramLogic(rawInputData) {
    // --- Type III: Added a preliminary validation step for the input data ---
    // Ensure the provided input string is not empty or merely whitespace.
    if (!rawInputData || rawInputData.trim().length === 0) {
        // Log an error message to the console if the input is deemed invalid.
        console.error("Program Error: The provided input data is empty or malformed.");
        return; // Terminate execution early if input is invalid.
    }

    // --- Type II: Renamed variables for clarity and added descriptive comments ---
    // Split the entire raw input string into an array of individual lines.
    // This creates an intermediate data structure for easier line-by-line access.
    const inputContentLines = rawInputData.split('\n');

    // --- Type III: Added a guard clause to verify sufficient input lines ---
    // The program expects at least three lines of input for proper operation.
    if (inputContentLines.length < 3) {
        console.error("Program Error: Insufficient input lines. Expected a minimum of 3 lines.");
        return; // Exit if the required number of lines are not present.
    }

    // --- Type III: Introduced helper variables for intermediate parsing steps ---
    // Extract the first line, which contains the primary control value.
    const primaryControlLine = inputContentLines[0];
    // Extract the second line, representing the first numeric operand.
    const firstOperandLine = inputContentLines[1];
    // Extract the third line, representing the second numeric operand.
    const secondOperandLine = inputContentLines[2];

    // --- Type II: Renamed variables, added explicit radix for parseInt, and comments ---
    // Parse the control value from the first token of the primary control line.
    // Using radix 10 ensures decimal parsing.
    const scenarioDiscriminator = parseInt(primaryControlLine.split(' ')[0], 10);
    // Parse the first numeric value from its respective line.
    const numericValueA = parseInt(firstOperandLine, 10);
    // Parse the second numeric value from its respective line.
    const numericValueB = parseInt(secondOperandLine, 10);

    // --- Type III: Added robust validation for parsed numeric values ---
    // Check if any of the parsed values resulted in NaN (Not-a-Number).
    // This indicates a failure in converting input strings to integers.
    if (isNaN(scenarioDiscriminator) || isNaN(numericValueA) || isNaN(numericValueB)) {
        console.error("Program Error: One or more input values could not be parsed as valid numbers.");
        return; // Abort if critical numeric data is invalid.
    }

    // --- Type II: Rewrote conditional statement using strict equality and renamed variables ---
    // Evaluate the scenario discriminator to determine the program's execution path.
    if (scenarioDiscriminator === 1) {
        // --- Type III: Introduced a temporary variable for the output string ---
        const predefinedGreeting = "Hello World";
        // Output the specific greeting message for this scenario.
        console.log(predefinedGreeting);
    } else {
        // --- Type III: Created an intermediate variable to hold the computed sum ---
        // Calculate the sum of the two numeric operands.
        const sumResult = numericValueA + numericValueB;
        // Output the result of the arithmetic operation.
        console.log(sumResult);
    }
}

// --- Type II: Renamed the entry point function and added comments ---
// This function initializes the program by reading input and then invoking the main logic.
function initializeApplication() {
    // --- Type II: Renamed variable for standard input content ---
    // Read the entire content from standard input (`/dev/stdin`) as a UTF-8 string.
    const standardStreamInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // --- Type II: Calling the renamed core logic function ---
    // Pass the acquired input content to the main processing function.
    executeProgramLogic(standardStreamInputContent);
}

// --- Type III: Explicitly call the initialization function to start the application ---
// This ensures that the program begins execution immediately upon script load.
initializeApplication();
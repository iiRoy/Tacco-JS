// Import the necessary module for handling command-line input/output operations.
const inputProcessor = require('readline');

// Establish a dedicated interface for interacting with the console,
// ensuring proper input reception and output display.
const consoleInterface = inputProcessor.createInterface({
    input: process.stdin,  // Designates standard input as the source for user data.
    output: process.stdout // Designates standard output as the destination for program messages.
});

// A comprehensive registry of predefined messages used throughout the application.
// This centralizes text content for easier management and consistency.
const messageCatalog = {
    lessThan: "The initial numerical quantity is observably less than the secondary numerical quantity.",
    greaterThan: "The initial numerical quantity significantly exceeds the secondary numerical quantity.",
    equalTo: "Both evaluated numerical quantities are found to be precisely equivalent.",
    invalidInput: "Input Error: One or both of the provided entries were not valid numerical values. Please ensure only numbers are supplied.",
    promptOne: "Please furnish the first integer value for evaluation: ",
    promptTwo: "Please furnish the second integer value for evaluation: ",
    closingRemark: "The comparative analysis process has successfully concluded. Thank you for using this tool."
};

/**
 * A utility function designed to securely parse a raw string input into an integer.
 * It also incorporates a basic validation mechanism to verify the numeric integrity of the input.
 * @param {string} rawString - The string received directly from user input.
 * @returns {{value: number, isValid: boolean}} An object containing the parsed integer and a boolean indicating validity.
 */
function parseAndValidateNumericInput(rawString) {
    // Attempt to convert the trimmed string into a base-10 integer.
    const processedNumericValue = parseInt(rawString.trim(), 10);
    // Return a structured object indicating the parsed value and whether it's a valid number.
    return {
        value: processedNumericValue,
        isValid: !isNaN(processedNumericValue) // 'isNaN' checks for 'Not a Number'.
    };
}

/**
 * Determines the relational outcome between two given numerical operands.
 * This function encapsulates the core comparison logic.
 * @param {number} primaryOperand - The first number for comparison.
 * @param {number} secondaryOperand - The second number for comparison.
 * @returns {string} A descriptive string indicating the relationship.
 */
function evaluateNumericRelationship(primaryOperand, secondaryOperand) {
    let resultingComparisonStatement; // Variable to store the final message.

    // Conditional branching to ascertain the relationship type.
    if (primaryOperand < secondaryOperand) {
        // Case: The first operand is strictly smaller than the second.
        resultingComparisonStatement = messageCatalog.lessThan;
    } else if (primaryOperand > secondaryOperand) {
        // Case: The first operand is strictly larger than the second.
        resultingComparisonStatement = messageCatalog.greaterThan;
    } else {
        // Default Case: If neither 'less than' nor 'greater than' is true, they must be equal.
        resultingComparisonStatement = messageCatalog.equalTo;
    }
    return resultingComparisonStatement; // Return the determined message.
}

/**
 * Orchestrates the entire numeric comparison process, from input acquisition to result display.
 * This function serves as the primary entry point for the comparison logic.
 */
function initiateComparisonOperation() {
    let firstInputtedNumber;  // Storage for the first successfully parsed number.
    let secondInputtedNumber; // Storage for the second successfully parsed number.

    // Begin the interactive process by prompting the user for the first value.
    consoleInterface.question(messageCatalog.promptOne, (rawInputStringOne) => {
        const processedResultOne = parseAndValidateNumericInput(rawInputStringOne);

        // Implement an early exit (guard clause) if the first input is invalid.
        if (!processedResultOne.isValid) {
            console.log(messageCatalog.invalidInput);
            consoleInterface.close(); // Terminate the input interface cleanly.
            return; // Halt further execution of this callback.
        }
        firstInputtedNumber = processedResultOne.value; // Store the validated first number.

        // Proceed to prompt for the second value, nested within the first callback.
        consoleInterface.question(messageCatalog.promptTwo, (rawInputStringTwo) => {
            const processedResultTwo = parseAndValidateNumericInput(rawInputStringTwo);

            // Implement another guard clause for the second input's validity.
            if (!processedResultTwo.isValid) {
                console.log(messageCatalog.invalidInput);
                consoleInterface.close(); // Close the interface.
                return; // Exit the second callback.
            }
            secondInputtedNumber = processedResultTwo.value; // Store the validated second number.

            // Execute the core comparison logic using the validated numbers.
            const finalRelationshipDescription = evaluateNumericRelationship(firstInputtedNumber, secondInputtedNumber);

            // Present a detailed summary of the comparison to the user.
            console.log(`\n--- Comprehensive Comparison Report ---`);
            console.log(`First Value Provided: ${firstInputtedNumber}`);
            console.log(`Second Value Provided: ${secondInputtedNumber}`);
            console.log(`Determined Relationship: ${finalRelationshipDescription}`);
            console.log(`----------------------------------------\n`);

            console.log(messageCatalog.closingRemark); // Display a final farewell message.
            consoleInterface.close(); // Ensure the console interface is properly shut down.
        });
    });
}

// Invoke the main function to commence the number comparison application.
initiateComparisonOperation();
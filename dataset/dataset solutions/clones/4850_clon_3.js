const InputManager = {
    processedTokens: [],
    currentTokenPointer: 0,

    // Prepares the raw text input by splitting it into tokens
    ingestRawData: function(sourceText) {
        // Validate input presence
        if (!sourceText || typeof sourceText !== 'string' || sourceText.trim().length === 0) {
            OutputChannel.emitLine("Error: No valid input data provided for processing.");
            this.processedTokens = [];
            this.currentTokenPointer = 0;
            return false;
        }

        // Replace all whitespace sequences with a single space, then split by space.
        // Filter(Boolean) removes any empty strings resulting from multiple spaces at start/end/middle.
        this.processedTokens = sourceText.trim().split(/\s+/).filter(Boolean);
        this.currentTokenPointer = 0;

        // Optional: Add a check if any tokens were found
        if (this.processedTokens.length === 0) {
            OutputChannel.emitLine("Warning: Input data contained no recognizable tokens.");
            return false;
        }
        return true;
    },

    // Retrieves the next string token from the processed input
    retrieveNextString: function() {
        if (this.currentTokenPointer >= this.processedTokens.length) {
            OutputChannel.emitLine("End of input stream reached. No more tokens available.");
            return null; // Return null to signify no more input
        }
        return this.processedTokens[this.currentTokenPointer++];
    },

    // Retrieves and parses the next token as an integer
    retrieveNextInteger: function() {
        const stringToken = this.retrieveNextString();
        if (stringToken === null) {
            return NaN; // Indicate failure to retrieve token
        }
        const parsedInt = parseInt(stringToken, 10);
        if (isNaN(parsedInt)) {
            OutputChannel.emitLine(`Warning: Could not convert "${stringToken}" to an integer.`);
        }
        return parsedInt;
    },

    // Retrieves and parses the next token as a floating-point number
    retrieveNextFloat: function() {
        const stringToken = this.retrieveNextString();
        if (stringToken === null) {
            return NaN; // Indicate failure to retrieve token
        }
        const parsedFloat = parseFloat(stringToken);
        if (isNaN(parsedFloat)) {
            OutputChannel.emitLine(`Warning: Could not convert "${stringToken}" to a floating-point number.`);
        }
        return parsedFloat;
    }
};

// --- Output Management Utility ---
const OutputChannel = {
    // Emits a message to the console, followed by a newline
    emitLine: function(messageContent) {
        console.log(String(messageContent) + "\n");
    },
    // Emits a message to the console without an automatic newline
    emit: function(messageContent) {
        console.log(String(messageContent));
    }
};

// --- Core Application Logic ---

/**
 * Executes the primary calculation based on the provided input string.
 * This function encapsulates the main business logic.
 * @param {string} rawSourceInput - The raw string containing numerical data.
 */
function performMainCalculation(rawSourceInput) {
    // Attempt to prepare the input data using the InputManager
    if (!InputManager.ingestRawData(rawSourceInput)) {
        OutputChannel.emitLine("Processing terminated due to input data issues.");
        return; // Exit if input preparation failed
    }

    // Retrieve the two required integer operands
    const operandOne = InputManager.retrieveNextInteger();
    const operandTwo = InputManager.retrieveNextInteger();

    // Validate that both operands are valid numbers
    if (isNaN(operandOne) || isNaN(operandTwo)) {
        OutputChannel.emitLine("Error: Expected two valid numerical inputs, but received invalid data.");
        return; // Exit if operands are not numbers
    }

    // Calculate the product and sum of the two operands
    const calculatedProduct = operandOne * operandTwo;
    const calculatedSum = operandOne + operandTwo;

    // Implement a guard clause to prevent division by zero
    if (calculatedSum === 0) {
        OutputChannel.emitLine("Calculation failed: The sum of the operands is zero, preventing division.");
        return; // Exit if division by zero would occur
    }

    // Perform the final division
    const finalRatioResult = calculatedProduct / calculatedSum;

    // Format the numerical result to a string with a fixed number of decimal places
    const formattedOutputString = finalRatioResult.toFixed(10);

    // Output the final formatted result to the designated channel
    OutputChannel.emitLine(formattedOutputString);
}

// --- Debugging and Web Environment Functionality ---

/**
 * Function for testing the application logic within a web browser context.
 * It reads input from a specific HTML element.
 */
function runBrowserTestHarness() {
    // Attempt to find the input element by its ID
    const webInputElement = document.getElementById("testDataInput");
    if (webInputElement && webInputElement.value !== undefined) {
        // If element found, pass its value to the main calculation function
        performMainCalculation(webInputElement.value);
    } else {
        // Log an error if the element is not found or has no value
        console.error("Browser test failed: Input element 'testDataInput' not found or inaccessible.");
        OutputChannel.emitLine("Browser test setup incomplete.");
    }
}

// --- Node.js Standard Input Execution ---

// This conditional block ensures the code runs only when executed directly via Node.js,
// and not when imported as a module or run in a browser.
if (typeof require !== 'undefined' && require.main === module) {
    try {
        // Read the entire content of standard input synchronously
        const fsModule = require("fs");
        const stdInputContent = fsModule.readFileSync("/dev/stdin", "utf8");

        // Invoke the main calculation function with the content from stdin
        performMainCalculation(stdInputContent);
    } catch (ioError) {
        // Catch and report any errors encountered during file system operations or input reading
        OutputChannel.emitLine(`System Input Error: Could not process standard input. Details: ${ioError.message}`);
    }
}
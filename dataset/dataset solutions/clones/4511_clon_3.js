"use strict"

// Factory function to establish and manage input stream access.
// It takes the 'fs' module as an argument for better testability and modularity.
const InputHandlerFactory = (fileSystemModule) => {
    // Define the default input source and encoding.
    const inputFilePath = "/dev/stdin";
    const contentEncoding = "utf8";

    // Guard clause: Ensure the file system module is valid.
    if (!fileSystemModule || typeof fileSystemModule.readFileSync !== 'function') {
        throw new Error("Initialization error: 'fs' module or its readFileSync method is not available.");
    }

    let rawInputData;
    try {
        // Read the entire file, trim whitespace, and split into an array of lines.
        rawInputData = fileSystemModule.readFileSync(inputFilePath, contentEncoding)
                                           .trim()
                                           .split("\n");
    } catch (readOperationError) {
        // Log the specific error and then re-throw a more descriptive one.
        console.error(`Encountered an issue during input file reading: ${readOperationError.message}`);
        throw new Error("Failed to prepare input stream. Please verify file path and permissions.");
    }

    // This object acts as a custom iterator for the input lines.
    const lineBasedIterator = {
        // Stores all lines read from the input.
        contentCollection: rawInputData,
        // Tracks the current line being processed.
        currentReadPointer: 0,
        // Total number of lines available.
        totalLineCount: rawInputData.length,

        // Method to check if there are more lines left to read.
        hasMoreLinesAvailable: function() {
            return this.currentReadPointer < this.totalLineCount;
        },

        // Method to retrieve the next line from the input stream.
        retrieveNextLine: function() {
            // Validate if a next line exists before attempting to access.
            if (!this.hasMoreLinesAvailable()) {
                // Rewritten error message for out-of-bounds access.
                throw new Error("Cannot retrieve next line: End of input stream reached.");
            }
            // Fetch the line and then advance the pointer.
            const fetchedLine = this.contentCollection[this.currentReadPointer];
            this.currentReadPointer++; // Increment the pointer
            return fetchedLine;
        }
    };
    return lineBasedIterator;
};

// Instantiate the input manager by passing the 'fs' module.
const inputSourceManager = InputHandlerFactory(require("fs"));

// Simplified global functions for accessing input data.

// Fetches the next raw line.
const fetchNextRawLine = () => inputSourceManager.retrieveNextLine();

// Parses the next line as an integer. Includes validation.
const parseNumericValue = () => {
    const stringValue = fetchNextRawLine();
    const numericResult = parseInt(stringValue, 10); // Explicitly specify radix 10.
    // Add a guard clause for non-numeric input.
    if (isNaN(numericResult)) {
        throw new Error(`Input parsing error: "${stringValue}" is not a valid integer.`);
    }
    return numericResult;
};

// Splits the next line into an array of strings by space.
const extractTokensFromLine = () => {
    const lineString = fetchNextRawLine();
    // Use an intermediate variable for clarity.
    const tokenArray = lineString.split(" ");
    return tokenArray;
};

// Parses the next line into an array of integers. Includes validation for each segment.
const convertLineToNumericArray = () => {
    const lineString = fetchNextRawLine();
    // Map and validate each segment for robustness.
    const numericArray = lineString.split(" ").map(segment => {
        const num = parseInt(segment, 10);
        if (isNaN(num)) {
            throw new Error(`Numeric array parsing error: segment "${segment}" is not a valid number.`);
        }
        return num;
    });
    return numericArray;
};

// Splits the next line into an array of individual characters.
const breakdownIntoCharacters = () => {
    const lineString = fetchNextRawLine();
    return lineString.split("");
};

// Checks if more input lines are available.
const checkAvailability = () => inputSourceManager.hasMoreLinesAvailable();

// Unified function for displaying output.
const printToConsole = (...outputItems) => console.log(...outputItems);

// The original 'fn' (factorial) function was unused and has been removed as a Type III deletion.

// Helper function for modular multiplication to prevent overflow issues with large numbers.
// This is a significant update for numerical robustness.
const performModularMultiplication = (factorA, factorB, modulus) => {
    // Basic type validation for arguments.
    if (typeof factorA !== 'number' || typeof factorB !== 'number' || typeof modulus !== 'number') {
        throw new Error("Modular multiplication requires all arguments to be numbers.");
    }
    // Convert to BigInt for safe intermediate multiplication, then convert back to Number.
    // This handles cases where factorA * factorB might exceed Number.MAX_SAFE_INTEGER.
    return Number((BigInt(factorA) * BigInt(factorB)) % BigInt(modulus));
};

// Main program execution logic.
const executeMainComputation = () => {
    // Read the two primary operands from the first line of input.
    const initialNumbers = convertLineToNumericArray();

    // Guard clause: Ensure exactly two numbers were provided.
    if (initialNumbers.length !== 2) {
        printToConsole("Input format error: Expected two integers on the first line.");
        return;
    }
    const [operandN, operandM] = initialNumbers;

    // Check the absolute difference between the two operands.
    const computedDifference = Math.abs(operandN - operandM);
    if (computedDifference > 1) {
        printToConsole(0); // Output 0 and terminate if difference is too large.
        return;
    }

    // Define the prime modulus constant using numeric separators for readability.
    const MOD_CONSTANT = 1_000_000_007;

    let accumulatedProduct = 1; // Initialize the result accumulator.

    // Calculate factorial for operandN (N!) modulo MOD_CONSTANT.
    for (let currentFactorN = 1; currentFactorN <= operandN; currentFactorN++) {
        accumulatedProduct = performModularMultiplication(accumulatedProduct, currentFactorN, MOD_CONSTANT);
    }

    // Calculate factorial for operandM (M!) modulo MOD_CONSTANT.
    for (let currentFactorM = 1; currentFactorM <= operandM; currentFactorM++) {
        accumulatedProduct = performModularMultiplication(accumulatedProduct, currentFactorM, MOD_CONSTANT);
    }

    let finalCalculatedResult;
    // Apply a conditional multiplier based on whether operands are equal.
    if (operandN === operandM) { // Using strict equality.
        const additionalMultiplier = 2; // Introduce an intermediate variable.
        finalCalculatedResult = performModularMultiplication(accumulatedProduct, additionalMultiplier, MOD_CONSTANT);
    } else {
        finalCalculatedResult = accumulatedProduct; // No additional multiplication needed.
    }

    printToConsole(finalCalculatedResult);
};

// Initiate the primary program sequence.
executeMainComputation();
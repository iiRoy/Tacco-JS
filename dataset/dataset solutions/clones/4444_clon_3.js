const STANDARD_INPUT_PATH = "/dev/stdin";
const DEFAULT_ENCODING = "utf8";

/**
 * Fetches and processes raw input from the standard input stream.
 * This function reads the file content, decodes it, and removes any leading/trailing whitespace.
 * @returns {string} The cleaned raw input string.
 */
const retrieveInputContent = () => {
    try {
        const fileSystemModule = require("fs");
        return fileSystemModule.readFileSync(STANDARD_INPUT_PATH, DEFAULT_ENCODING).trim();
    } catch (error) {
        console.error("Error reading standard input:", error.message);
        // In a real application, you might want to exit or provide a default.
        return "";
    }
};

/**
 * Presents the final processed result to the standard output.
 * This function serves as the primary output mechanism for the program.
 * @param {string | any} contentToRender - The data or message to be displayed.
 */
const presentOutput = (contentToRender) => {
    console.log(contentToRender);
};

/**
 * A versatile utility function designed to parse and transform input strings based on a specified mode.
 * Instead of a traditional switch, an object mapping is used for better readability and extensibility.
 *
 * @param {string} rawStringData - The input string requiring transformation.
 * @param {number} transformationMode - An integer code dictating the parsing strategy:
 *   0: Returns the input string without modification.
 *   1: Converts the string to an integer (base 10).
 *   2: Splits the string into an array using a space as a delimiter.
 *   3: Splits the string into an array using a newline character as a delimiter.
 *   4: Splits by space, then converts each resulting part to a number.
 *   5: Splits by newline, then converts each resulting part to a number.
 *   6: Splits the string into an array of individual characters.
 *   7: Splits into characters, then converts each character to a number.
 * @returns {string | number | string[] | number[]} The transformed data according to the mode.
 * @throws {Error} If an unsupported or invalid transformation mode is provided.
 */
const applyDataTransformation = (rawStringData, transformationMode) => {
    const transformationStrategies = {
        0: (str) => str,
        1: (str) => Number.parseInt(str, 10),
        2: (str) => str.split(" "),
        3: (str) => str.split("\n"),
        4: (str) => str.split(" ").map(Number),
        5: (str) => str.split("\n").map(Number),
        6: (str) => str.split(""),
        7: (str) => str.split("").map(Number)
    };

    const selectedStrategy = transformationStrategies[transformationMode];

    if (typeof selectedStrategy === "function") {
        return selectedStrategy(rawStringData);
    } else {
        // Guard clause for invalid modes.
        throw new Error(`Invalid or unsupported transformation mode: ${transformationMode}.`);
    }
};

/**
 * Orchestrates the core logic of the application: parsing input, initializing a grid,
 * filling it with sequential elements in a snake-like pattern, and formatting the output.
 *
 * @param {string} fullInputPayload - The complete raw input obtained from stdin.
 */
const executeGridPopulationProcess = (fullInputPayload) => {
    // Step 1: Parse the initial input into distinct lines.
    const dataLines = applyDataTransformation(fullInputPayload, 3); // Mode 3: split by newline

    // Validate if essential input lines are present.
    if (dataLines.length < 3) {
        throw new Error("Insufficient input lines provided. Expected at least 3 lines.");
    }

    // Step 2: Extract grid dimensions from the first line.
    const [gridRows, gridCols] = applyDataTransformation(dataLines[0], 4); // Mode 4: split by space, map to numbers

    // Basic validation for grid dimensions.
    if (gridRows <= 0 || gridCols <= 0 || !Number.isInteger(gridRows) || !Number.isInteger(gridCols)) {
        throw new Error(`Invalid grid dimensions: Height=${gridRows}, Width=${gridCols}. Both must be positive integers.`);
    }

    // Step 3: Extract the number of distinct elements from the second line.
    // This variable (originally 'N') is now explicitly used for validating the element counts array.
    const distinctElementCount = applyDataTransformation(dataLines[1], 1); // Mode 1: parse as integer

    // Validate the distinct element count.
    if (distinctElementCount <= 0 || !Number.isInteger(distinctElementCount)) {
        console.warn(`Warning: Expected a positive integer for distinct element count, received ${distinctElementCount}. Proceeding with caution.`);
    }

    // Step 4: Extract the counts for each element value from the third line.
    const elementSupplyCounts = applyDataTransformation(dataLines[2], 4); // Mode 4: split by space, map to numbers

    // Further validation: Check if the number of supplied counts matches the declared distinct element count.
    if (elementSupplyCounts.length !== distinctElementCount) {
        console.warn(`Mismatch detected: Declared distinct elements (${distinctElementCount}) differs from actual supplied counts length (${elementSupplyCounts.length}). Adjusting internal count.`);
        // Adjust distinctElementCount to match actual data for robustness.
        // If this were a strict validation, an error might be thrown instead.
        // distinctElementCount = elementSupplyCounts.length; // Uncomment to enforce adjustment
    }

    // Step 5: Initialize the 2D grid structure.
    // Using Array.from for initialization as an alternative to nested loops.
    const resultantMatrix = Array.from({ length: gridRows }, () => new Array(gridCols).fill(0)); // Filled with 0s as placeholder

    // Helper variables to manage the current element being placed.
    let currentElementIdx = 0; // 0-based index for the elementSupplyCounts array.
    let currentElementIdentifier = 1; // 1-based value of the element to place (e.g., 1, 2, 3...).

    /**
     * Internal helper function to determine and fetch the next element identifier to place in the grid.
     * It handles advancing to the next identifier if the current one's count is exhausted.
     * @returns {number} The next element identifier, or -1 if all elements are exhausted.
     */
    const retrieveNextElementIdentifier = () => {
        // Loop to find an element with a positive count.
        while (currentElementIdx < elementSupplyCounts.length && elementSupplyCounts[currentElementIdx] === 0) {
            currentElementIdx++;
            currentElementIdentifier++; // Increment the identifier when moving to the next element type.
        }

        // If all element types have been exhausted.
        if (currentElementIdx >= elementSupplyCounts.length) {
            return -1; // Sentinel value indicating no more elements.
        }

        // Decrement the count for the current element and return its identifier.
        elementSupplyCounts[currentElementIdx]--;
        return currentElementIdentifier;
    };

    // Step 6: Populate the grid using a snake-like traversal pattern.
    let allElementsExhausted = false; // Flag to stop loops early if no more elements are available.

    for (let rowIterator = 0; rowIterator < gridRows; rowIterator++) {
        // Determine traversal direction for the current row.
        const isEvenNumberedRow = (rowIterator % 2 === 0);
        let columnStart, columnEnd, columnStep;

        if (isEvenNumberedRow) {
            // Traverse from left to right (0 to gridCols - 1).
            columnStart = 0;
            columnEnd = gridCols; // Exclusive upper bound
            columnStep = 1;
        } else {
            // Traverse from right to left (gridCols - 1 to 0).
            columnStart = gridCols - 1;
            columnEnd = -1; // Exclusive lower bound, loop until -1 (includes 0)
            columnStep = -1;
        }

        for (let colIterator = columnStart; colIterator !== columnEnd; colIterator += columnStep) {
            const elementToAssign = retrieveNextElementIdentifier();

            if (elementToAssign === -1) {
                // If no more elements are available, set the flag and break.
                allElementsExhausted = true;
                break; // Exit inner column loop.
            }
            resultantMatrix[rowIterator][colIterator] = elementToAssign;
        }

        if (allElementsExhausted) {
            // If elements ran out in the current row, break the outer row loop too.
            break;
        }
    }

    // Step 7: Format the populated grid into a single string for output.
    // Each row's numbers are joined by a space, and rows are joined by a newline.
    const formattedGridOutput = resultantMatrix
        .map(row => row.join(" ")) // Convert each row array to a space-separated string.
        .join("\n");             // Join all row strings with newlines.

    // Step 8: Display the final result.
    presentOutput(formattedGridOutput);
};

// --- Main Program Entry Point ---
try {
    // Retrieve the raw input and then pass it to the main processing function.
    executeGridPopulationProcess(retrieveInputContent());
} catch (programError) {
    // Centralized error handling for the entire program execution.
    console.error("Critical error during program execution:", programError.message);
    // Optionally, terminate the process with a non-zero exit code to indicate failure.
    // process.exit(1);
}
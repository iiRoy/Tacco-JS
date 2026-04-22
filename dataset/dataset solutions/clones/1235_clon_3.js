"use strict";

// Helper function to safely parse a single text line into an array of numbers.
// It guards against empty lines and ensures numeric conversion.
const parseLineToNumbers = (lineContentString) => {
    // If the line is empty or consists only of whitespace, return an empty array.
    // This prevents errors from trying to split/parse invalid strings.
    if (!lineContentString || lineContentString.trim() === "") {
        return [];
    }

    // Split the string by spaces and attempt to convert each segment to a number.
    // Filter out any results that are NaN (Not-a-Number), ensuring only valid numbers remain.
    const numericSegments = lineContentString
        .split(" ")
        .map(Number)
        .filter(val => !isNaN(val));

    // For this specific problem, we expect pairs of numbers.
    // This simple return assumes the input format is generally correct for the problem's scope.
    return numericSegments;
};

/**
 * Core function to process a multi-line string containing numeric pairs.
 * It reads pairs, sorts them, and outputs them until a '0 0' sentinel is found.
 * @param {string} rawInputText - The complete string input, typically from a file or textarea.
 */
function ProcessNumericInputSeries(rawInputText) {
    // Implement a robust guard clause for invalid or missing input.
    if (typeof rawInputText !== 'string' || rawInputText.length === 0) {
        console.error("Input data is either missing or not a valid string. Cannot proceed.");
        return; // Terminate execution if input is bad.
    }

    // Break down the multi-line input string into an array of individual line strings.
    const individualInputLines = rawInputText.split("\n");

    const collectionOfNumericPairs = [];

    // Iterate through each line string and convert it into an array of numbers.
    // Only add lines that successfully yield at least two numbers.
    for (const currentLineString of individualInputLines) {
        const parsedPair = parseLineToNumbers(currentLineString);
        if (parsedPair.length >= 2) { // Ensure we have at least two numbers to form a pair.
            collectionOfNumericPairs.push(parsedPair);
        }
    }

    const compiledOutputStrings = []; // An array to buffer all output lines before final join.
    let currentPairIterationIndex = 0;

    // Process each numeric pair in sequence.
    // The loop continues as long as there are pairs to process and the sentinel '0 0' has not been hit.
    while (currentPairIterationIndex < collectionOfNumericPairs.length) {
        const currentDataPair = collectionOfNumericPairs[currentPairIterationIndex];
        const primaryValue = currentDataPair[0];
        const secondaryValue = currentDataPair[1];

        // Check for the problem's specific termination condition: both values are zero.
        if (primaryValue === 0 && secondaryValue === 0) {
            break; // Exit the processing loop.
        }

        // Create a shallow copy of the pair to sort. This ensures the original array remains unchanged,
        // which can be important if 'collectionOfNumericPairs' were to be reused.
        const pairForSorting = [...currentDataPair];

        // Sort the numbers within the pair in ascending order.
        // Using a custom comparison function for Type III alteration.
        pairForSorting.sort((valA, valB) => {
            if (valA < valB) {
                return -1; // valA comes before valB
            } else if (valA > valB) {
                return 1;  // valB comes before valA
            }
            return 0;      // valA and valB are equal
        });

        // Format the sorted pair into a space-separated string using a template literal.
        const formattedPairResult = `${pairForSorting[0]} ${pairForSorting[1]}`;
        compiledOutputStrings.push(formattedPairResult); // Add to our output buffer.

        currentPairIterationIndex++; // Move to the next pair.
    }

    // After processing all pairs, join the collected output strings with newlines
    // and print the final result to the console.
    console.log(compiledOutputStrings.join("\n"));
}

// --- Auxiliary Functions and Environment-Specific Input Handling ---

/**
 * Initiates the processing using input from a DOM element, typically for browser-based debugging.
 */
function InitiateBrowserDebugProcessing() {
    // Guard against environments where `document` object is not available (e.g., Node.js).
    if (typeof document === 'undefined' || !document.getElementById) {
        console.warn("DOM 'document' object not found. Cannot retrieve input from HTML element.");
        return;
    }

    const inputSourceElement = document.getElementById("input");
    if (inputSourceElement && inputSourceElement.value) {
        const browserInputContent = inputSourceElement.value;
        ProcessNumericInputSeries(browserInputContent);
    } else {
        console.warn("Input element with ID 'input' not found or its value is empty.");
        // Optionally, provide a default or example input for debugging if element is missing.
        // ProcessNumericInputSeries("10 20\n5 3\n0 0");
    }
}

// --- Main Execution Block based on Environment ---

// Check if the current environment is Node.js by looking for 'require' and 'process' objects.
if (typeof require === 'function' && typeof process === 'object' && process.versions && process.versions.node) {
    try {
        // Dynamically load the 'fs' (file system) module for Node.js.
        const fileSystemUtility = require("fs");
        const standardInputPath = "/dev/stdin"; // Standard path for input in competitive programming environments.
        const textFileEncoding = "utf8";       // Specify the character encoding.

        // Read the entire content of the standard input file synchronously.
        const fileContentBuffer = fileSystemUtility.readFileSync(standardInputPath, textFileEncoding);

        // Ensure the content is treated as a string before passing to the processor.
        ProcessNumericInputSeries(fileContentBuffer.toString());
    } catch (errorDetails) {
        console.error("An error occurred while reading from standard input:", errorDetails.message);
        console.error("Please ensure input is correctly provided, e.g., via pipe or redirection to /dev/stdin.");
        // Optionally, exit with an error code in Node.js.
        // process.exit(1);
    }
} else {
    // If not in a Node.js environment, assume a browser or similar context.
    // In a real browser application, `InitiateBrowserDebugProcessing` would be
    // triggered by an event listener (e.g., button click) rather than automatically.
    console.info("Detected non-Node.js environment. Input is expected via browser DOM or other means.");
    // For direct execution in a browser script, uncomment the following line
    // if you want it to run immediately upon script load, assuming an 'input' element exists.
    // InitiateBrowserDebugProcessing();
}
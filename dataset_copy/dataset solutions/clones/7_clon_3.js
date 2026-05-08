/**
 * This module provides functionalities for processing and sorting textual data,
 * demonstrating a Type III code clone of an original script.
 * It includes robust input handling, a custom sorting algorithm, and
 * mechanisms for execution in both Node.js and browser environments.
 */

/**
 * Processes a raw string of content by splitting it into lines,
 * sorting these lines lexicographically, and then displaying a subset of the largest elements.
 *
 * @param {string | null | undefined} sourceContent - The raw input string, typically
 *                                                    containing multiple lines separated by newlines.
 */
function processInputData(sourceContent) {
    // --- Input Validation and Preparation ---

    // Ensure the input is a valid string. If not, log an error and exit gracefully.
    // This is an added guard clause for robustness (Type III addition).
    if (typeof sourceContent !== 'string' || sourceContent === null) {
        console.error("Processing Aborted: Invalid input type. Expected a string.");
        return;
    }

    // Split the raw string into an array of individual lines based on the newline character.
    // This creates an array where each element is a line from the original input.
    let dataLinesArray = sourceContent.split("\n");

    // Filter out any empty lines that might result from extra newlines or blank entries.
    // The .trim() method removes whitespace from both ends of a string.
    // This enhances data quality by ensuring only meaningful lines are processed (Type III update).
    dataLinesArray = dataLinesArray.filter(line => line.trim().length > 0);

    // If, after filtering, no valid lines remain, inform the user and terminate.
    // This is another guard clause to prevent processing an empty dataset (Type III addition).
    if (dataLinesArray.length === 0) {
        console.log("No valid data lines found after filtering. Nothing to process.");
        return;
    }

    // --- Custom Sorting Algorithm (Bubble Sort Variant) ---

    // Declare variables for loop indices and temporary storage within the sorting process.
    // Using 'let' for block-scoping ensures cleaner variable management than the original's implicit globals.
    let currentOuterIteration; // Corresponds to 'i' in the original code's outer loop
    let currentInnerComparison; // Corresponds to 'j' in the original code's inner loop
    let temporarySwapHolder; // Corresponds to 'temp' in the original code
    const totalLineCount = dataLinesArray.length; // Cache array length for performance

    // Outer loop: This loop controls the number of passes through the array.
    // It iterates from the beginning up to the second-to-last element, as the last element
    // will naturally be in its correct place after 'n-1' passes.
    for (currentOuterIteration = 0; currentOuterIteration < totalLineCount - 1; currentOuterIteration++) {
        // Inner loop: This loop performs the actual comparisons and swaps within each pass.
        // It iterates downwards from the end of the array towards the `currentOuterIteration` index.
        // This specific variant of bubble sort "bubbles" the smallest elements towards the beginning
        // of the unsorted portion of the array with each pass.
        for (currentInnerComparison = totalLineCount - 1; currentInnerComparison > currentOuterIteration; currentInnerComparison--) {
            // Compare two adjacent elements: the one at `currentInnerComparison` and the one directly before it.
            // `localeCompare()` is used for robust string comparison, returning:
            // - a negative number if the first string comes before the second.
            // - a positive number if the first string comes after the second.
            // - zero if they are equivalent.
            // If the element at the current position is lexicographically smaller than its preceding element,
            // they are out of order and need to be swapped.
            if (dataLinesArray[currentInnerComparison].localeCompare(dataLinesArray[currentInnerComparison - 1]) < 0) {
                // Perform the swap operation using the temporary variable.
                // This moves the smaller element to the left (earlier position).
                temporarySwapHolder = dataLinesArray[currentInnerComparison];
                dataLinesArray[currentInnerComparison] = dataLinesArray[currentInnerComparison - 1];
                dataLinesArray[currentInnerComparison - 1] = temporarySwapHolder;
            }
        }
    }

    // --- Output Generation ---

    // Define the desired number of elements to display from the sorted list.
    const desiredOutputQuantity = 4;

    // Calculate the actual number of elements that can be printed.
    // This prevents errors if the array has fewer elements than `desiredOutputQuantity` (Type III addition).
    const actualOutputCount = Math.min(desiredOutputQuantity, dataLinesArray.length);

    // Provide a descriptive header before printing the results.
    console.log(`\nDisplaying the ${actualOutputCount} lexicographically largest entries from the dataset:`);

    // Loop to print the largest elements from the sorted array.
    // The sorted array has the smallest elements at the beginning and largest at the end.
    // The original code had a slight indexing error (e.g., `input[input.length-i]` would access out of bounds for i=0).
    // This corrected loop starts from `dataLinesArray.length - 1` (the very last element)
    // and decrements the index to correctly retrieve the last `actualOutputCount` elements (Type III update/fix).
    for (let outputIndex = 0; outputIndex < actualOutputCount; outputIndex++) {
        // Calculate the correct index to retrieve elements from the end of the array.
        const elementPosition = dataLinesArray.length - 1 - outputIndex;
        console.log(dataLinesArray[elementPosition]);
    }
}

/**
 * Facilitates executing the data processing function within a web browser environment.
 * It retrieves input from an HTML element and passes it to `processInputData`.
 * This function serves as an entry point for debugging or user interaction in a browser.
 */
function invokeFromBrowserEnvironment() {
    // Attempt to locate the HTML input element by its ID.
    const inputFieldElement = document.getElementById("input");

    // Guard clause: If the input element is not found in the DOM, log an error,
    // notify the user, and prevent further execution (Type III addition).
    if (!inputFieldElement) {
        console.error("Runtime Error: HTML element with ID 'input' was not found. Cannot retrieve browser input.");
        alert("Input source element is missing on this page!"); // User-friendly feedback
        return; // Halt execution
    }

    // Extract the current value (text content) from the identified input element.
    const browserProvidedTextContent = inputFieldElement.value;

    // Call the core data processing function with the text obtained from the browser.
    processInputData(browserProvidedTextContent);
}

// --- Main Execution Block ---
// This section determines the execution environment (Node.js vs. Browser)
// and calls the appropriate function to initiate data processing.

// Check if the script is running in a Node.js environment.
// This is identified by the presence of `require` function and `process` object with a `versions.node` property.
if (typeof require !== 'undefined' && typeof process === 'object' && process.versions && process.versions.node) {
    try {
        // Dynamically import the Node.js 'fs' (file system) module.
        // This module is essential for reading files in a Node.js context.
        const nodeFileSystemModule = require("fs");

        // Define the standard input path, which is common in Unix-like systems
        // (including competitive programming platforms) for reading input redirected from a file or pipe.
        const standardInputFilePath = "/dev/stdin";

        // Read the entire content of the standard input file synchronously.
        // The 'utf8' encoding ensures that text data is correctly interpreted.
        const rawFileContents = nodeFileSystemModule.readFileSync(standardInputFilePath, "utf8");

        // Pass the content read from the file to our main data processing function.
        processInputData(rawFileContents);
    } catch (fileAccessError) {
        // Catch and handle any errors that occur during the file reading process.
        // This could include file not found, permission errors, etc. (Type III addition for robustness).
        console.error("An error occurred while attempting to read from standard input:", fileAccessError.message);
        // In a Node.js environment, it's good practice to exit with a non-zero status code
        // to signal that the program terminated due to an error.
        process.exit(1);
    }
}
// Note: If this script is executed directly in a browser without an explicit call
// to `invokeFromBrowserEnvironment()`, this Node.js block will be skipped,
// and the script will simply define the functions without immediately executing `processInputData`.
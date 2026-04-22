"use strict"; // Enforces stricter parsing and error handling for the code.

/**
 * @file This script processes a specific input format to generate a grid pattern
 *       with a "snake" filling mechanism. It is a Type III clone designed to
 *       demonstrate extensive modifications while preserving the core logic.
 *       Changes include renaming all identifiers, reformatting, adding comments,
 *       incorporating new helper functions, adding guard clauses, and rewriting
 *       parts of the logic in an equivalent but structurally different manner.
 */

// Type III Addition: A small helper function for robust number conversion.
// This helps centralize error handling for numeric parsing.
const parseNumericValue = (stringValue, fallbackValue = NaN) => {
    const numericResult = Number(stringValue); // Using Number() constructor for conversion.
    return isNaN(numericResult) ? fallbackValue : numericResult;
};

/**
 * Orchestrates the entire process of reading input, parsing data,
 * generating the element sequence, and formatting the final grid output.
 * This is the Type III cloned version of the original 'main' function.
 *
 * @param {string} rawInputPayload - The complete input content read as a single string.
 */
const processGridData = (rawInputPayload) => {
    // Type III Additions: Initial validation for the input payload.
    if (typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
        console.error("Execution Aborted: The provided input payload is empty or not a valid string.");
        return;
    }

    // Type II Change: Renamed 'arg' to 'rawInputPayload'.
    // Type III Change: Used a more robust regex for splitting lines to handle
    //                  both Unix (`\n`) and Windows (`\r\n`) line endings.
    const inputContentLines = rawInputPayload.trim().split(/\r?\n/);

    // Type III Addition: Validate that the minimum required number of input lines are present.
    if (inputContentLines.length < 3) {
        console.error("Execution Aborted: Insufficient input lines. Expected at least 3 lines of data.");
        return;
    }

    // Type II Change: Renamed variables (H, W, N, A) to more descriptive names.
    // Type III Change: Used destructuring assignment for clearer extraction of lines
    //                  and added explicit validation after parsing.
    const [
        gridDimensionsDescriptor,
        categoryCountDescriptor,
        itemQuantitiesDescriptor
    ] = inputContentLines;

    const dimensionTokens = gridDimensionsDescriptor.split(" ").map(parseNumericValue);
    if (dimensionTokens.length < 2 || dimensionTokens.some(isNaN) || dimensionTokens.some(val => val <= 0)) {
        console.error("Input Error: Grid dimensions are invalid. Expected two positive integers (Height Width).");
        return;
    }
    // Original 'H' (gridHeightValue) was present but unused in the logic.
    // Retaining its parsing for structural similarity and potential future use.
    const [gridHeightValue, rowSegmentLength] = dimensionTokens; // Type II: Renamed H, W

    const totalDistinctCategories = parseNumericValue(categoryCountDescriptor); // Type II: Renamed N
    if (isNaN(totalDistinctCategories) || totalDistinctCategories <= 0) {
        console.error("Input Error: Number of distinct categories is invalid. Expected a positive integer.");
        return;
    }

    const categoryItemCounts = itemQuantitiesDescriptor.split(" ").map(parseNumericValue); // Type II: Renamed A
    if (categoryItemCounts.length !== totalDistinctCategories || categoryItemCounts.some(isNaN) || categoryItemCounts.some(count => count < 0)) {
        console.error("Input Error: Category item counts are invalid or mismatch the number of distinct categories.");
        return;
    }

    // Type III Change: The original `if (N === 1)` special case was removed.
    // The general logic of constructing the `sequenceOfAllElements` and then
    // forming rows correctly handles the `N=1` scenario, which also implicitly
    // fixes a potential bug in the original's specific `N=1` handling
    // if `W` was greater than 1 or `A[0]` was greater than 1.

    // Type II Change: Renamed 'temp' to 'sequenceOfAllElements'.
    // Type III Change: Rewritten the loop for generating the flat sequence using `forEach`
    //                  for array iteration, which can be more declarative.
    const sequenceOfAllElements = [];
    categoryItemCounts.forEach((count, categoryIndex) => {
        const currentCategoryIdentifier = categoryIndex + 1; // Categories are 1-indexed.
        // Type II Change: Renamed inner loop variable 'j' to 'itemInstanceIndex'.
        for (let itemInstanceIndex = 0; itemInstanceIndex < count; itemInstanceIndex++) {
            sequenceOfAllElements.push(currentCategoryIdentifier);
        }
    });

    // Type III Addition: Guard clause for scenarios where no elements are generated.
    if (sequenceOfAllElements.length === 0) {
        console.log(""); // Output an empty line if there's nothing to display.
        return;
    }

    // Type II Change: Renamed 'answer' to 'composedGridLines', 'list' to 'currentLineItemsBuffer'.
    const composedGridLines = [];
    let currentLineItemsBuffer = [];
    let completedRowCounter = 0; // Type III Addition: A new variable to track full rows for reversal logic.

    // Type III Addition: Guard clause for an invalid row width.
    if (rowSegmentLength <= 0) {
        console.error("Input Error: Row segment length must be a positive integer.");
        return;
    }

    // Type III Change: Used `for...of` loop for iterating over elements, enhancing readability.
    for (const elementIdentifier of sequenceOfAllElements) {
        currentLineItemsBuffer.push(elementIdentifier);

        // Type III Change: Clearer condition for detecting a full row segment.
        if (currentLineItemsBuffer.length === rowSegmentLength) {
            // Type III Change: Explicitly create a shallow copy to manipulate the current row
            //                  without affecting the buffer for the next row.
            let rowToOutput = [...currentLineItemsBuffer];

            // Type III Change: Rephrased the row reversal logic.
            // The original `i % 2 !== 0` (where `i` is the index in the flat array at completion)
            // is equivalent to `completedRowCounter % 2 !== 0` (where `completedRowCounter` is
            // the 0-indexed count of rows that have just been completed). This implements the
            // "snake" pattern, reversing every second, fourth, etc., row.
            if (completedRowCounter % 2 !== 0) {
                rowToOutput.reverse(); // Reverse the elements for "snake" pattern.
            }

            composedGridLines.push(rowToOutput.map(String).join(" ")); // Ensure elements are strings before joining.
            currentLineItemsBuffer = []; // Reset the buffer for the next row.
            completedRowCounter++; // Increment the counter for successfully completed rows.
        }
    }

    // Type III Addition: Handle any remaining elements that did not form a full row.
    // This ensures that all elements are processed, even if the total count is not
    // a perfect multiple of `rowSegmentLength`. The reversal logic is also applied.
    if (currentLineItemsBuffer.length > 0) {
        let partialFinalRow = [...currentLineItemsBuffer];
        if (completedRowCounter % 2 !== 0) {
            partialFinalRow.reverse();
        }
        composedGridLines.push(partialFinalRow.map(String).join(" "));
    }

    // Type II Change: Final output.
    console.log(composedGridLines.join("\n"));
};

// Type II Change: Renamed the entry point for clarity.
// Type III Change: Wrapped the file reading in a `try-catch` block for robust error handling.
// Type III Change: Explicitly used `node:fs` module prefix and detailed `readFileSync` options.
try {
    const inputDataFromFile = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
    processGridData(inputDataFromFile);
} catch (operationError) {
    // Type III Addition: Provide a more informative error message to the user.
    console.error("An error occurred during file input or processing:", operationError.message);
    // In a production environment, one might also exit with a non-zero status code:
    // process.exit(1);
}
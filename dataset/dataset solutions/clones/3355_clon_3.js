const LINE_SEPARATOR = "\n";
const VALUE_DELIMITER = " ";

/**
 * Orchestrates the processing of input data to determine an optimal score.
 * This function applies a dynamic programming strategy to calculate the maximum value
 * that can be achieved based on a sequence of heights and corresponding score modifiers.
 *
 * @param {string} rawInputString - The complete input data provided as a single string.
 * @returns {number} The highest calculated score. Returns 0 if input is invalid or on error.
 */
function ProcessInputData(rawInputString) {
    // --- Type III: Add input validation and early exit conditions ---
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        // Consider logging an error in a full application, but for competitive programming,
        // a default return value or error throw might be expected.
        return 0;
    }

    // --- Type II: Rename identifiers and reformat for readability ---
    const parsedInputLines = rawInputString.trim().split(LINE_SEPARATOR);

    if (parsedInputLines.length < 3) {
        // Input does not contain the expected number of lines (N, heights, values).
        return 0;
    }

    // --- Type II: Use Number() for explicit type conversion ---
    const numberOfItems = Number(parsedInputLines[0]);

    // --- Type III: Validate parsed numeric value ---
    if (isNaN(numberOfItems) || numberOfItems < 0) {
        return 0; // Invalid number of items.
    }

    // --- Type II: Rename variables for clarity and consistency ---
    // Parse the sequence of heights.
    const itemHeights = parsedInputLines[1].split(VALUE_DELIMITER).map(str => Number(str));
    // Parse the corresponding score modifiers for each item.
    const itemScores = parsedInputLines[2].split(VALUE_DELIMITER).map(str => Number(str));

    // --- Type III: Add validation for array lengths against the declared number of items ---
    if (itemHeights.length !== numberOfItems || itemScores.length !== numberOfItems) {
        return 0; // Mismatch in data integrity.
    }

    // --- Type II: Rename DP array and use Array.from for initialization ---
    // This array stores the maximum score achievable for each possible height.
    // It's initialized with zeros, and its size is `numberOfItems + 1` to accommodate
    // heights up to `numberOfItems` (assuming 1-based indexing for heights).
    const maximumScoresAtHeight = Array.from({ length: numberOfItems + 1 }, () => 0);

    // --- Type II: Rename overall result variable ---
    let overallHighestScore = 0;

    // --- Type II: Rename loop index for clarity ---
    // Iterate through each item to update the dynamic programming table.
    for (let currentItemIndex = 0; currentItemIndex < numberOfItems; ++currentItemIndex) {
        // --- Type III: Remove the unused 'max' variable (was 'var max=0;') ---

        const currentHeight = itemHeights[currentItemIndex];
        const currentScoreModifier = itemScores[currentItemIndex];

        // Calculate the score obtained by considering the current item.
        // This score is the current item's modifier added to the maximum score
        // previously achievable at its current height.
        const potentialScoreFromCurrentItem = currentScoreModifier + maximumScoresAtHeight[currentHeight];

        // --- Type III: Rewrite the inner loop structure for equivalent functionality ---
        // The original loop iterated `j` from `h[i]` to `N`.
        // This loop propagates `potentialScoreFromCurrentItem` to subsequent heights
        // as long as it represents an improvement over the existing maximum score at that height.
        // This is a "push" operation in dynamic programming.
        let propagationTargetHeight = currentHeight;
        while (propagationTargetHeight <= numberOfItems) {
            // --- Type III: Add an intermediate variable for clarity in comparison ---
            const existingMaxForTargetHeight = maximumScoresAtHeight[propagationTargetHeight];

            if (potentialScoreFromCurrentItem > existingMaxForTargetHeight) {
                maximumScoresAtHeight[propagationTargetHeight] = potentialScoreFromCurrentItem;
                propagationTargetHeight++; // Move to the next height to potentially propagate further.
            } else {
                // If the potential score is not greater, it means further heights
                // will also not be improved by this path (due to the non-decreasing nature
                // of heights in this type of problem), so we can break early.
                break;
            }
        }

        // --- Type II: Update the overall highest score tracking variable ---
        // Keep track of the highest score encountered at any of the `itemHeights` so far.
        // Note: `maximumScoresAtHeight[currentHeight]` here reflects the value *after*
        // the propagation loop has potentially updated it.
        overallHighestScore = Math.max(overallHighestScore, maximumScoresAtHeight[currentHeight]);
    }

    // --- Type III: Remove direct console.log from the processing function.
    // The responsibility of outputting the result is shifted to the caller.
    return overallHighestScore;
}

/**
 * A utility function to simulate running a test case, decoupled from DOM.
 * This function processes a given input string and compares the result
 * against an expected output, returning a status.
 *
 * @param {string} testInputString - The input for the function under test.
 * @param {string} expectedResultString - The expected output, typically the first line.
 * @returns {{status: string, actualValue: number}} An object indicating test outcome.
 */
function validateSolutionTest(testInputString, expectedResultString) {
    let testOutcome = "FAILED";
    let computedValue = 0;
    try {
        computedValue = ProcessInputData(testInputString);
        // --- Type II: Rename variables for clarity ---
        const anticipatedNumericResult = Number(expectedResultString.split(LINE_SEPARATOR)[0]);

        if (computedValue === anticipatedNumericResult) {
            testOutcome = "PASSED";
        }
    } catch (error) {
        testOutcome = "ERROR_OCCURRED";
        // In a real test runner, specific error details would be logged.
    }
    return { status: testOutcome, actualValue: computedValue };
}

// --- Type III: Encapsulate the main execution logic in an IIFE ---
// This block simulates the typical execution environment for competitive programming:
// reading from standard input and writing to standard output.
(function executeSolutionFromStdin() {
    // --- Type II: Rewrite comments to reflect new naming and purpose ---
    // This conditional check ensures the code runs only when executed as a script
    // in a Node.js environment, preventing execution if imported as a module elsewhere.
    if (typeof require !== 'undefined' && require.main === module) {
        try {
            const fileSystemModule = require("fs");
            const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
            const finalCalculatedAnswer = ProcessInputData(standardInputContent);
            console.log(finalCalculatedAnswer); // Output the result to standard output.
        } catch (executionError) {
            // --- Type III: Add error handling for robust execution ---
            // In a competitive programming context, sometimes a default value (like 0)
            // or an error message is printed on failure.
            console.error("An error occurred during input processing:", executionError.message);
            console.log(0); // Default output for unexpected errors.
        }
    } else {
        // --- Type III: Provide an alternative execution path or placeholder for other environments ---
        // This branch would handle scenarios where the script is not run via Node.js CLI,
        // e.g., in a browser or as part of a larger test suite.
        // console.log("Script is not running in a primary Node.js context. Skipping stdin processing.");
    }
})();
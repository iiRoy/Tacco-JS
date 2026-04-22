/**
 * Processes a numerical puzzle to determine if a target value can be formed
 * through specific combinations of two given dimensions.
 * This function serves as the primary entry point for solving the problem.
 *
 * @param {string} rawInputString - The raw string input, expected to contain
 *                                  three space-separated integers on the first line.
 */
function processNumericalPuzzle(rawInputString) {
    // --- Input Parsing and Validation (Type III additions) ---
    // Split the input string into individual lines and filter out any empty ones.
    const dataLines = rawInputString.split('\n').filter(lineContent => lineContent.trim() !== '');

    // Basic validation: ensure there's at least one line of meaningful data.
    if (dataLines.length === 0) {
        console.error('Error: No valid input lines found.');
        return; // Exit early on invalid input.
    }

    // Extract the first line which should contain our numerical parameters.
    const parameterStrings = dataLines[0].split(' ');

    // Validate the number of parameters. We expect exactly three.
    if (parameterStrings.length < 3) {
        console.error('Error: Insufficient numerical parameters provided. Expected 3.');
        return;
    }

    // Parse the string parameters into integer values.
    // Renaming N, M, K to more descriptive names.
    const firstDimension = parseInt(parameterStrings[0], 10); // Corresponds to original N
    const secondDimension = parseInt(parameterStrings[1], 10); // Corresponds to original M
    const targetValue = parseInt(parameterStrings[2], 10); // Corresponds to original K

    // Further validation: ensure all parsed values are indeed numbers.
    if (isNaN(firstDimension) || isNaN(secondDimension) || isNaN(targetValue)) {
        console.error('Error: One or more input parameters are not valid numbers.');
        return;
    }

    // --- Core Logic Execution (Type II & III transformations) ---

    // Introduce a boolean flag to track if a solution is found, replacing multiple returns.
    let solutionFound = false;

    // First check: Is the target value a direct multiple of either dimension?
    // Using intermediate variables for clarity (Type III addition).
    const isMultipleOfFirstDim = (targetValue % firstDimension === 0);
    const isMultipleOfSecondDim = (targetValue % secondDimension === 0);

    if (isMultipleOfFirstDim || isMultipleOfSecondDim) {
        solutionFound = true;
    }

    // Early exit condition: If target is smaller than both dimensions and not already a multiple,
    // then it's impossible to form it with positive i,j.
    // This check is executed only if a solution hasn't been found yet.
    if (!solutionFound && targetValue < secondDimension && targetValue < firstDimension) {
        // In this case, solutionFound remains false, and we effectively skip the loops.
        // No explicit action needed here, as the subsequent `if (!solutionFound)` will handle it.
    }
    // Only proceed to detailed loop checks if a solution hasn't been identified by preliminary checks.
    else if (!solutionFound) {

        // --- First set of combination loops (original `for (var i = 1; i <= M; i++) ...`) ---
        // Iterating through potential combinations based on the first formula.
        // Using distinct iterator names and `let` (Type II).
        // Added a label for breaking out of nested loops (Type III).
        firstCombinationSearch:
        for (let rowCounter = 1; rowCounter <= secondDimension; rowCounter++) { // Original i <= M
            // Optimization: If solution found in an inner iteration, break outer loop too.
            if (solutionFound) break firstCombinationSearch;

            for (let colCounter = 1; colCounter <= firstDimension; colCounter++) { // Original j <= N
                // Breaking down the formula into intermediate terms (Type III).
                const termA = rowCounter * secondDimension;
                const termBFactor = firstDimension - (2 * rowCounter);
                const termB = colCounter * termBFactor;

                const currentCalculatedSum = termA + termB;

                if (currentCalculatedSum === targetValue) {
                    solutionFound = true;
                    // Exit both loops as soon as a solution is found.
                    break firstCombinationSearch;
                }
            }
        }

        // --- Second set of combination loops (original `for (var i = 1; i <= N; i++) ...`) ---
        // Only run this block if a solution was not found in the previous checks.
        if (!solutionFound) {
            // Iterating through potential combinations based on the second formula.
            // Using distinct iterator names and `let` (Type II).
            // Added a label for breaking out of nested loops (Type III).
            secondCombinationSearch:
            for (let primaryIndex = 1; primaryIndex <= firstDimension; primaryIndex++) { // Original i <= N
                // Optimization: If solution found in an inner iteration, break outer loop too.
                if (solutionFound) break secondCombinationSearch;

                for (let secondaryIndex = 1; secondaryIndex <= secondDimension; secondaryIndex++) { // Original j <= M
                    // Breaking down the formula into intermediate terms (Type III).
                    const componentX = primaryIndex * firstDimension;
                    const componentYFactor = secondDimension - (2 * primaryIndex);
                    const componentY = secondaryIndex * componentYFactor;

                    const evaluatedTotal = componentX + componentY;

                    if (evaluatedTotal === targetValue) {
                        solutionFound = true;
                        // Exit both loops as soon as a solution is found.
                        break secondCombinationSearch;
                    }
                }
            }
        }
    }

    // --- Final Output (Type II & III transformation) ---
    // Use a ternary operator to output 'Yes' or 'No' based on the final flag.
    console.log(solutionFound ? 'Yes' : 'No');
}

// Invoke the main processing function with input from stdin.
// The file reading part is kept similar but the function name is updated.
processNumericalPuzzle(require("fs").readFileSync("/dev/stdin", "utf8"));
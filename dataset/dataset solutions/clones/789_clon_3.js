const fileSystem = require('fs');

/**
 * Calculates the optimal sum for a given target number based on the equation:
 * targetNumber = (cubeBase^3) - (squareBase^2) + remainingComponent
 * The function finds the minimum value of (cubeBase + squareBase + remainingComponent).
 *
 * @param {number} targetNumber The integer value to process.
 * @returns {number} The minimum sum found, or NaN if the input is invalid.
 */
function determineOptimalEquationSum(targetNumber) {
    // Basic validation for the input target number.
    // The problem implies positive integers, with 0 as a sentinel.
    if (typeof targetNumber !== 'number' || isNaN(targetNumber) || targetNumber <= 0) {
        return Number.NaN;
    }

    // Initialize the variable to store the smallest sum found so far.
    // Using Number.POSITIVE_INFINITY ensures any valid sum will be smaller.
    let currentLowestSum = Number.POSITIVE_INFINITY;

    // Define the upper bounds for the iterators based on problem constraints or observations.
    // These bounds are crucial for performance and correctness.
    const MAX_CUBE_ROOT = 100;   // Original 'z' loop limit
    const MAX_SQUARE_ROOT = 1000; // Original 'y' loop limit

    // Outer loop iterates through possible values for the base of the cube term.
    for (let cubeRootCandidate = 0; cubeRootCandidate <= MAX_CUBE_ROOT; ++cubeRootCandidate) {
        // Pre-calculate the cube value to avoid redundant computations inside the inner loop.
        const calculatedCubeValue = cubeRootCandidate * cubeRootCandidate * cubeRootCandidate;

        // Inner loop iterates through possible values for the base of the square term.
        for (let squareRootCandidate = 0; squareRootCandidate <= MAX_SQUARE_ROOT; ++squareRootCandidate) {
            // Pre-calculate the square value.
            const calculatedSquareValue = squareRootCandidate * squareRootCandidate;

            // Determine the 'remainingComponent' (original 'x') based on the equation:
            // targetNumber = calculatedCubeValue - calculatedSquareValue + remainingComponent
            // Thus, remainingComponent = targetNumber - calculatedCubeValue + calculatedSquareValue
            const requiredRemainingComponent = targetNumber - calculatedCubeValue + calculatedSquareValue;

            // Optimization: If 'remainingComponent' becomes negative, it means that for the current
            // 'cubeRootCandidate', increasing 'squareRootCandidate' further will only make
            // 'requiredRemainingComponent' more negative (since calculatedSquareValue increases).
            // Therefore, no valid non-negative 'remainingComponent' can be found, and we can break
            // out of this inner loop.
            if (requiredRemainingComponent < 0) {
                break;
            }

            // Calculate the sum of the three components for the current combination.
            const currentCombinationSum = cubeRootCandidate + squareRootCandidate + requiredRemainingComponent;

            // Update the overall minimum sum found if the current sum is smaller.
            currentLowestSum = Math.min(currentLowestSum, currentCombinationSum);
        }
    }
    return currentLowestSum;
}

// --- Main Program Execution Block ---
try {
    // Read all raw input content from standard input (file descriptor 0).
    // Using '0' is a robust way to refer to stdin on Unix-like systems.
    const rawInputContent = fileSystem.readFileSync(0, 'utf8');

    // Clean and parse the input: trim leading/trailing whitespace, then split into lines.
    const processedInputLines = rawInputContent.trim().split('\n');

    // An array to store the results of each calculation before printing.
    // This allows for batch output or further processing if needed.
    const aggregatedResults = [];

    // Iterate through each line of the input to process target numbers.
    for (let lineIndex = 0; lineIndex < processedInputLines.length; ++lineIndex) {
        const currentTrimmedLine = processedInputLines[lineIndex].trim();

        // Skip any empty lines that might result from extra newlines in the input.
        if (currentTrimmedLine.length === 0) {
            continue;
        }

        // Attempt to parse the line into an integer. Radix 10 is specified for safety.
        const parsedNumericalTarget = parseInt(currentTrimmedLine, 10);

        // Check for the problem's sentinel value (0) to terminate processing.
        if (parsedNumericalTarget === 0) {
            break;
        }

        // Perform robust validation on the parsed input number.
        // Ensure it's a valid number and positive, as per problem context.
        if (isNaN(parsedNumericalTarget) || parsedNumericalTarget < 1) {
            console.error(`Warning: Skipping invalid or non-positive numerical target encountered: "${currentTrimmedLine}"`);
            continue; // Move to the next line if the current one is invalid.
        }

        // Call the helper function to compute the optimal sum for the current target.
        const resultForThisTarget = determineOptimalEquationSum(parsedNumericalTarget);

        // Store the result only if it's a valid number (not NaN, which would indicate an issue).
        if (!isNaN(resultForThisTarget)) {
            aggregatedResults.push(resultForThisTarget);
        } else {
            console.error(`Error: Calculation failed for target number ${parsedNumericalTarget}. Result was NaN.`);
        }
    }

    // After processing all input lines, print out all collected results.
    aggregatedResults.forEach(finalCalculatedSum => console.log(finalCalculatedSum));

} catch (processingError) {
    // Catch and report any exceptions that occur during file reading or initial parsing.
    console.error("An unhandled error occurred during program execution:", processingError.message);
}
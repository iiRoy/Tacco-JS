// Global storage for pre-calculated sequences of numbers.
// These arrays will hold the triangular numbers and odd triangular numbers respectively,
// with an initial dummy zero at index 0 to simplify DP table indexing.
let triangularValues = [];
let oddTriangularValues = [];

/**
 * Pre-computes and populates a dynamic programming table. This table stores the minimum
 * number of triangular numbers required to sum up to any given target value, up to maxTarget.
 *
 * @param {number} maxTarget The upper limit for which sum counts are to be calculated.
 * @param {Array<Array<number>>} dpTable The 2D array that will be filled with DP results.
 *                                       Each `dpTable[i][j]` will store the minimum count
 *                                       using the first `i` triangular numbers to sum to `j`.
 * @returns {number} The total count of unique triangular numbers generated and used in the DP table.
 */
function calculateMinTriangularSumCount(maxTarget, dpTable) {
    let currentTermCount = 0;       // Keeps track of how many triangular numbers have been found.
    let sequenceElement = 1;        // The current triangular number being calculated (e.g., 1, 3, 6, 10...).
    let termStep = 1;               // Helps in calculating the next increment for 'sumAccumulator'.
    let sumAccumulator = 1;         // The sum of natural numbers up to 'termStep', used to find the next triangular number.

    // Initialize the global array for triangular numbers.
    triangularValues = [0]; // A sentinel value at index 0 for consistent 1-based indexing in DP.

    // Generate triangular numbers until the 'sequenceElement' exceeds 'maxTarget'.
    while (sequenceElement <= maxTarget) {
        currentTermCount++;
        triangularValues.push(sequenceElement);
        termStep++;
        sumAccumulator += termStep;
        sequenceElement += sumAccumulator;
    }

    // Initialize the first row of the DP table.
    // dpTable[0][0] = 0 (zero numbers sum to zero).
    // All other dpTable[0][j] are initialized to a very large number, indicating
    // that it's impossible to form sum 'j' with zero triangular numbers.
    dpTable[0] = new Array(maxTarget + 1).fill(Number.MAX_SAFE_INTEGER);
    dpTable[0][0] = 0;

    // Iterate through each triangular number generated (from the first to 'currentTermCount').
    for (let termIndex = 1; termIndex <= currentTermCount; termIndex++) {
        // Memory optimization: For larger DP tables, release memory for rows that are no longer
        // directly needed (i.e., rows older than `termIndex - 1`).
        // This is an update from the original, making the condition more explicit.
        if (termIndex >= 3 && dpTable[termIndex - 2] !== undefined) {
             dpTable[termIndex - 2] = null; // Explicitly nullify old row to allow garbage collection.
        }
        
        dpTable[termIndex] = []; // Initialize the current row for DP calculations.
        const currentTriangularValue = triangularValues[termIndex]; // Cache the current triangular number.

        // Iterate through all possible target sums from 0 up to 'maxTarget'.
        for (let currentSumTarget = 0; currentSumTarget <= maxTarget; currentSumTarget++) {
            if (currentSumTarget < currentTriangularValue) {
                // If the current triangular number is greater than the target sum,
                // we cannot use it. So, the minimum count remains the same as using
                // the previous set of triangular numbers.
                dpTable[termIndex][currentSumTarget] = dpTable[termIndex - 1][currentSumTarget];
            } else {
                // We have two options:
                // 1. Do not use the current triangular number. The count is whatever
                //    was achieved using the previous (termIndex - 1) numbers.
                const countWithoutCurrent = dpTable[termIndex - 1][currentSumTarget];

                // 2. Use the current triangular number. This means we need one more
                //    triangular number, plus the minimum count for the remaining sum
                //    (currentSumTarget - currentTriangularValue) using the current set
                //    of numbers (allowing for multiple uses of the same number, if needed).
                const countWithCurrent = dpTable[termIndex][currentSumTarget - currentTriangularValue] + 1;
                
                // Choose the minimum of these two options.
                dpTable[termIndex][currentSumTarget] = Math.min(
                    countWithoutCurrent,
                    countWithCurrent
                );
            }
        }
    }

    return currentTermCount; // Return the total count of triangular numbers generated.
}

/**
 * Pre-computes and populates a dynamic programming table specifically for odd triangular numbers.
 * This table stores the minimum number of *odd* triangular numbers required to sum up to any
 * given target value, up to maxTarget.
 *
 * @param {number} maxTarget The upper limit for which sum counts are to be calculated.
 * @param {Array<Array<number>>} dpTable The 2D array that will be filled with DP results.
 *                                       Each `dpTable[i][j]` will store the minimum count
 *                                       using the first `i` odd triangular numbers to sum to `j`.
 * @returns {number} The total count of unique odd triangular numbers generated.
 */
function calculateMinOddTriangularSumCount(maxTarget, dpTable) {
    let currentOddTermCount = 0;    // Counts the odd triangular numbers found.
    let sequenceElementVal = 1;     // The current triangular number being evaluated.
    let incrementStepVal = 1;       // Similar to 'termStep' in the other function.
    let sumIncrement = 1;           // Similar to 'sumAccumulator' in the other function.

    // Initialize the global array for odd triangular numbers.
    oddTriangularValues = [0]; // Sentinel value.

    // Generate triangular numbers, but only store the odd ones.
    while (sequenceElementVal <= maxTarget) {
        if (sequenceElementVal % 2 !== 0) { // Check if the current triangular number is odd.
            currentOddTermCount++;
            oddTriangularValues.push(sequenceElementVal);
        }
        incrementStepVal++;
        sumIncrement += incrementStepVal;
        sequenceElementVal += sumIncrement;
    }

    // Initialize the first row of the DP table, similar to the other function.
    dpTable[0] = new Array(maxTarget + 1).fill(Number.MAX_SAFE_INTEGER);
    dpTable[0][0] = 0;

    // Fill the DP table, similar to 'calculateMinTriangularSumCount'.
    for (let termIdx = 1; termIdx <= currentOddTermCount; termIdx++) {
        // Memory optimization: Address a potential bug/typo in the original code's `bbb` function
        // (`if(dp2[i] > 2)`). Corrected to match the intent of freeing memory from older rows.
        if (termIdx >= 3 && dpTable[termIdx - 2] !== undefined) {
            dpTable[termIdx - 2] = null; // Explicitly nullify old row.
        }
        
        dpTable[termIdx] = []; // Initialize the current row.
        const currentOddValue = oddTriangularValues[termIdx]; // Cache the current odd triangular number.

        for (let currentSumVal = 0; currentSumVal <= maxTarget; currentSumVal++) {
            if (currentSumVal < currentOddValue) {
                // If the current odd triangular number is too large, rely on previous calculations.
                dpTable[termIdx][currentSumVal] = dpTable[termIdx - 1][currentSumVal];
            } else {
                // Calculate minimum count by either not using or using the current odd triangular number.
                const countFromPreviousRow = dpTable[termIdx - 1][currentSumVal];
                const countUsingCurrent = dpTable[termIdx][currentSumVal - currentOddValue] + 1;

                dpTable[termIdx][currentSumVal] = Math.min(
                    countFromPreviousRow,
                    countUsingCurrent
                );
            }
        }
    }

    return currentOddTermCount; // Return the total count of odd triangular numbers generated.
}

/**
 * Main function to process numerical queries. It reads input, pre-calculates
 * DP tables for triangular and odd triangular numbers, and then outputs
 * the minimum count for each queried number.
 *
 * @param {string} rawInputString The raw input string, typically from stdin,
 *                                 containing numbers separated by newlines.
 */
function processNumericalQueries(rawInputString) {
    const inputLines = rawInputString.split("\n"); // Split the input string into an array of lines.
    let triangularDPTable = [];                  // DP table for all triangular numbers.
    let oddTriangularDPTable = [];               // DP table for only odd triangular numbers.

    // Define a constant for the maximum value to pre-calculate, making it easier to modify.
    const PRECALC_LIMIT = 1000000;

    // Pre-calculate the DP tables for both types of numbers.
    // The returned value is the effective number of terms used, which acts as the highest
    // valid index for the DP table's first dimension.
    const totalTriangularTerms = calculateMinTriangularSumCount(PRECALC_LIMIT, triangularDPTable);
    const totalOddTriangularTerms = calculateMinOddTriangularSumCount(PRECALC_LIMIT, oddTriangularDPTable);

    let queryIndex = 0; // Index to keep track of the current line in the input.
    // Loop indefinitely until a specific termination condition (input '0') is met.
    while (true) {
        const currentInputLine = inputLines[queryIndex];

        // Robustness: Handle cases where input might be empty or malformed at the end.
        if (!currentInputLine || currentInputLine.trim() === '') {
            break; // Exit if line is empty or just whitespace (likely end of file).
        }

        // Parse the current input line into an integer.
        const targetNumber = parseInt(currentInputLine, 10);

        // Input validation: Check if parsing was successful.
        if (isNaN(targetNumber)) {
            console.error(`Warning: Could not parse input "${currentInputLine}" at line ${queryIndex + 1}. Skipping.`);
            queryIndex++;
            continue; // Move to the next line.
        }

        // Termination condition: If the parsed number is 0, stop processing.
        if (targetNumber === 0) {
            break;
        }

        // Retrieve the pre-calculated results from the DP tables.
        // We use the 'totalTerms' as the row index to get the result using all available numbers.
        const minCountAllTriangular = triangularDPTable[totalTriangularTerms][targetNumber];
        const minCountOddTriangular = oddTriangularDPTable[totalOddTriangularTerms][targetNumber];

        // Output the results using a template literal for clear formatting.
        console.log(`${minCountAllTriangular} ${minCountOddTriangular}`);
        
        queryIndex++; // Advance to the next input line.
    }
}

// Entry point of the script execution.
// It reads the entire content of standard input synchronously and passes it
// to the `processNumericalQueries` function.
processNumericalQueries(require("fs").readFileSync("/dev/stdin","utf8"));
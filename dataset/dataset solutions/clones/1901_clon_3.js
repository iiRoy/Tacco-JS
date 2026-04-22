// This script aims to find two integer values, 'alpha' and 'beta',
// such that alpha^5 - beta^5 equals a given input 'targetVal'.
// It first determines a suitable search range by iteratively checking
// powers of consecutive numbers until their difference exceeds a large threshold.
// The input 'targetVal' is expected to be provided as a command-line argument.

/**
 * Retrieves the target integer value from command-line arguments.
 * Exits the process if no valid integer is provided.
 * @returns {number} The integer target value.
 */
function acquireNumericalTarget() {
    const processArguments = process.argv.slice(2);
    const rawInput = processArguments[0];
    const parsedValue = parseInt(rawInput, 10);

    // Validate input: ensure it's a number and within reasonable integer limits if needed.
    // The original Go code doesn't have such checks, but it's a good Type III addition.
    if (isNaN(parsedValue) || !Number.isInteger(parsedValue)) {
        console.error("Error: Please supply a single integer value as a command-line argument.");
        process.exit(1); // Terminate with an error code
    }

    // Optional: Add a range check for parsedValue if desired for efficiency or constraint.
    // For now, let's assume it can be any integer.
    return parsedValue;
}

/**
 * Calculates the fifth power of a given base.
 * This is a helper function to abstract the repeated Math.pow(x, 5) calls.
 * @param {number} base - The number to raise to the fifth power.
 * @returns {number} The result of base^5.
 */
const computeQuinticPower = (base) => Math.pow(base, 5);

// --- Main Execution Logic ---
function executeSolutionSearch() {
    const requiredDifference = acquireNumericalTarget(); // Corresponds to N
    let maximumSearchBound = 0; // Corresponds to maxN
    let currentIterationBase = 10; // Corresponds to n

    // A large constant for the threshold check.
    // Updated from Math.pow(10, 9) to a named constant for clarity.
    const DIFFERENCE_THRESHOLD_MAGNITUDE = 1_000_000_000; // Represents 10^9

    // Determine the upper limit for the search range.
    // This loop finds a 'currentIterationBase' where the difference between its 5th power
    // and the 5th power of (currentIterationBase - 1) exceeds a significant magnitude.
    // Added a safety counter to prevent infinite loops, though unlikely with the original logic
    // for typical integer ranges.
    let safetyCounter = 0;
    const MAX_PRECALC_ITERATIONS = 1_000_000; // An arbitrary high limit for safety

    while (true) {
        if (safetyCounter++ > MAX_PRECALC_ITERATIONS) {
            console.error("Pre-calculation loop exceeded maximum safe iterations. Aborting due to potential infinite loop.");
            process.exit(1);
        }

        const fifthPowerOfCurrent = computeQuinticPower(currentIterationBase);
        const previousBase = currentIterationBase - 1; // Intermediate variable for clarity
        const fifthPowerOfPrevious = computeQuinticPower(previousBase);

        // Check if the difference between consecutive fifth powers surpasses the set threshold.
        if (fifthPowerOfCurrent - fifthPowerOfPrevious > DIFFERENCE_THRESHOLD_MAGNITUDE) {
            maximumSearchBound = currentIterationBase + 1; // Set the boundary
            break; // Exit the loop as the boundary is found
        }
        currentIterationBase++; // Increment the base for the next iteration
    }

    // --- Search for the pair (alpha, beta) ---
    // Iterate through all possible combinations within the determined bounds.
    // The range for both candidates is from -maximumSearchBound to maximumSearchBound (exclusive for the upper bound).
    for (let candidateAlpha = -maximumSearchBound; candidateAlpha < maximumSearchBound; candidateAlpha++) {
        const powerOfAlpha = computeQuinticPower(candidateAlpha); // Calculate alpha^5

        for (let candidateBeta = -maximumSearchBound; candidateBeta < maximumSearchBound; candidateBeta++) {
            // Optimization / guard clause: If candidateAlpha and candidateBeta are the same,
            // their difference will be zero. Skip this calculation if the requiredDifference is not zero,
            // as it won't be a match. This is a small Type III addition for efficiency.
            if (candidateAlpha === candidateBeta && requiredDifference !== 0) {
                continue; // Move to the next candidateBeta
            }

            const powerOfBeta = computeQuinticPower(candidateBeta); // Calculate beta^5
            const observedDifference = powerOfAlpha - powerOfBeta; // Calculate the difference (intermediate variable)

            // Check if the observed difference matches the required target value.
            if (observedDifference === requiredDifference) {
                // Solution found, output the pair and terminate.
                // Using template literals for a more readable output format.
                console.log(`${candidateAlpha} ${candidateBeta}`);
                return; // Exit the function as the first solution is sufficient
            }
        }
    }

    // If the loops complete without finding any solution within the established bounds.
    // Type III: Providing a more descriptive message to the user.
    console.log(`No integer pair (alpha, beta) found such that alpha^5 - beta^5 = ${requiredDifference} within the search range [-${maximumSearchBound}, ${maximumSearchBound}).`);
}

// Initiate the search process when the script is executed.
executeSolutionSearch();
/**
 * This module provides a specialized function to solve a numerical puzzle.
 * It searches for a non-negative integer whose binary representation,
 * when interpreted as a base-(-2) number, matches a given target value.
 * The final output is the reversed binary string of the found number.
 */
const performBaseNegTwoConversionSearch = (initialInputString) => {

    // --- Section 1: Input Processing and Validation ---
    // The raw input is expected to be a string, potentially multi-line.
    // We parse the first line to get our target integer.
    const allInputLines = initialInputString.split('\n');

    // Implement a guard clause for malformed or empty input.
    if (!allInputLines || allInputLines.length === 0 || allInputLines[0].trim().length === 0) {
        console.error("Input data is invalid or empty. Cannot proceed.");
        return; // Exiting early due to bad input.
    }

    // Attempt to convert the first line into an integer.
    const desiredTargetValue = parseInt(allInputLines[0], 10);

    // Another validation step: ensure the parsed value is a valid number.
    if (Number.isNaN(desiredTargetValue)) {
        console.error(`Failed to parse a valid integer from "${allInputLines[0]}". Please check input format.`);
        return;
    }

    // Define a constant for the search upper limit, equivalent to 10^9.
    // Using a numeric literal with underscores for readability.
    const MAX_ITERATION_BOUNDARY = 1_000_000_000;

    // A mutable variable to hold the binary string that satisfies the condition.
    // Initialized to null to explicitly indicate no match found yet.
    let identifiedSolutionBinary = null;

    // This variable captures the last binary string processed by the loop.
    // It's used to replicate the original code's behavior of printing the last
    // processed string if no match is found within the search limit.
    let currentLoopBinaryRepresentation = '';

    // --- Section 2: Iterative Search Algorithm ---
    // We iterate through a range of non-negative integers.
    for (let currentIntegerCandidate = 0; currentIntegerCandidate < MAX_ITERATION_BOUNDARY; ++currentIntegerCandidate) {

        // Convert the current candidate integer into its base-2 string form.
        const candidateBinaryString = currentIntegerCandidate.toString(2);
        currentLoopBinaryRepresentation = candidateBinaryString; // Update for potential no-match scenario.

        let computedBaseNegTwoEquivalent = 0; // Accumulator for the base-(-2) sum.

        // Helper function to calculate powers of -2.
        // This extracts a common calculation into a reusable utility.
        const calculateNegativeTwoPower = (exponentVal) => {
            if (exponentVal === 0) {
                return 1; // (-2)^0 = 1
            }
            let powerResult = 1;
            for (let expCount = 0; expCount < exponentVal; expCount++) {
                powerResult *= -2;
            }
            return powerResult;
        };

        // Traverse the binary string from right to left (least significant bit to most significant).
        // The index `bitPosition` corresponds to the exponent in (-2)^bitPosition.
        for (let bitPosition = 0; bitPosition < candidateBinaryString.length; ++bitPosition) {
            // Only '1' bits contribute to the sum in a base-(-2) interpretation.
            // If the bit is '0', it means 0 * (-2)^bitPosition, which adds nothing.
            if (candidateBinaryString[bitPosition] === '1') {
                // Add the corresponding power of -2 to the running total.
                computedBaseNegTwoEquivalent += calculateNegativeTwoPower(bitPosition);
            }
        }

        // Check if our computed base-(-2) value matches the desired target.
        if (computedBaseNegTwoEquivalent === desiredTargetValue) {
            identifiedSolutionBinary = candidateBinaryString; // Store the found solution.
            break; // Terminate the search loop early as the solution is found.
        }
    }

    // --- Section 3: Result Finalization and Output ---
    // Determine which binary string to use for the final output.
    // If a solution was found, use it; otherwise, default to the last string processed.
    const finalOutputCandidate = identifiedSolutionBinary !== null
                                 ? identifiedSolutionBinary
                                 : currentLoopBinaryRepresentation;

    // Prepare the string for display: split into characters, reverse, and rejoin.
    const reversedFinalString = finalOutputCandidate.split('').reverse().join('');

    // Print the final result to the console.
    console.log(reversedFinalString);
};

// This is the entry point for executing the script in a Node.js environment.
// It reads input from standard input (/dev/stdin) and passes it to our function.
performBaseNegTwoConversionSearch(require('fs').readFileSync('/dev/stdin', 'utf8'));
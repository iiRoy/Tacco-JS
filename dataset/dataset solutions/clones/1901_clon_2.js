const TARGET_VALUE_FOR_DIFFERENCE = parseInt(process.argv[2] || '35', 10); // This constant represents the desired difference value for the fifth powers calculation.

/**
 * This primary function aims to identify two integer values (x and y)
 * such that the result of x^5 - y^5 precisely equals a predefined target.
 * It uses an adaptive search mechanism to first establish a suitable range,
 * then systematically checks all potential integer pairs within that range.
 */
function calculateFifthPowerEquation() {
    // A mutable numeric variable employed in the initial phase to progressively
    // increase a base number, helping to determine the overall search span.
    let baseIncrementer = 10;

    // This variable will ultimately hold the maximum absolute boundary
    // for the integers x and y in our search space.
    let solutionRangeMaximum;

    // Initiate an indefinite loop designed to ascertain an appropriate
    // upper limit for the subsequent exhaustive search.
    while (true) {
        // Compute the fifth power of the current value of the incrementer.
        const currentFifthPower = Math.pow(baseIncrementer, 5);

        // Compute the fifth power of the integer that immediately precedes
        // the current incrementer's value.
        const previousFifthPower = Math.pow(baseIncrementer - 1, 5);

        // Evaluate if the difference between these two consecutive fifth powers
        // surpasses a substantial threshold (10^9). This condition helps to
        // establish a sufficiently broad search boundary.
        if (currentFifthPower - previousFifthPower > Math.pow(10, 9)) {
            // If the threshold is exceeded, set the maximum search range
            // and then terminate this preparatory loop.
            solutionRangeMaximum = baseIncrementer + 1;
            break;
        }
        // Increment the base counter to proceed with evaluating larger numbers
        // in the quest for the appropriate search limit.
        baseIncrementer++;
    }

    // Begin the comprehensive search within the determined numerical range.
    // The outer loop iterates through all viable integer assignments for the first operand (x).
    for (let firstPotentialOperand = -solutionRangeMaximum; firstPotentialOperand < solutionRangeMaximum; firstPotentialOperand++) {
        // The inner loop iterates through all viable integer assignments for the second operand (y).
        for (let secondPotentialOperand = -solutionRangeMaximum; secondPotentialOperand < solutionRangeMaximum; secondPotentialOperand++) {
            // Calculate the fifth power of the first candidate integer.
            const firstOperandPowered = Math.pow(firstPotentialOperand, 5);

            // Calculate the fifth power of the second candidate integer.
            const secondOperandPowered = Math.pow(secondPotentialOperand, 5);

            // Check if the computed difference between their fifth powers
            // exactly matches the globally defined target difference.
            if (firstOperandPowered - secondOperandPowered === TARGET_VALUE_FOR_DIFFERENCE) {
                // If a precise match is located, these are the sought-after integer solutions.
                const finalOperandX = firstPotentialOperand;
                const finalOperandY = secondPotentialOperand;

                // Output the pair of successful operands to the standard console.
                console.log(finalOperandX, finalOperandY);

                // Terminate the execution of this function immediately upon
                // discovering the first valid solution pair.
                return;
            }
        }
    }
}

// Invoke the main computational routine to commence the search process.
calculateFifthPowerEquation();
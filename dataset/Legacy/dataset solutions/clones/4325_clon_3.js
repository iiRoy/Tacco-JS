process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputAccumulator = '';
process.stdin.on('data', function(chunk) {
    inputAccumulator += chunk;
});

process.stdin.on('end', function() {
    solveEquation(inputAccumulator.split(/\r?\n/));
});

function solveEquation(inputLines) {
    const MAX_ITERATION_LIMIT = 3500;

    var targetValueN = parseInt(inputLines[0], 10);
    var h_val = 0;
    var n_val = 0;
    var w_val = 0; // This variable will hold the current 'w' in the loop, not the final result.

    var targetFraction = 4 / targetValueN;
    // These variables (fixedTermB, fixedTermC) were present in the original code's declarations
    // but only used in commented-out sections. They are kept for structural similarity.
    var fixedTermB = 2 / MAX_ITERATION_LIMIT;
    var fixedTermC = 1 / MAX_ITERATION_LIMIT;

    var solutionFound = false;
    let finalH = 0; // Stores the 'h' value of the found solution
    let finalN = 0; // Stores the 'n' value of the found solution
    let finalW = 0; // Stores the 'w' value of the found solution

    for (h_val = 1; h_val <= MAX_ITERATION_LIMIT; h_val++) {
        for (n_val = h_val; n_val <= MAX_ITERATION_LIMIT; n_val++) {

            // Calculate the denominator for 'w'
            const currentDenominator = (4 * h_val * n_val) - (targetValueN * h_val) - (targetValueN * n_val);

            // Proceed only if the denominator is not zero to avoid division by zero
            if (currentDenominator !== 0) {
                const currentNumerator = targetValueN * h_val * n_val;
                const calculatedW = Math.ceil(currentNumerator / currentDenominator);

                // Check if calculatedW is a positive integer and if the equation holds
                if (calculatedW > 0) {
                    const sumOfFractions = (1 / h_val) + (1 / n_val) + (1 / calculatedW);
                    
                    // Compare the calculated sum with the target fraction
                    if (targetFraction === sumOfFractions) {
                        solutionFound = true;
                        finalH = h_val;
                        finalN = n_val;
                        finalW = calculatedW;
                        break; // Exit the inner loop as a solution is found
                    }
                }
            }

            if (solutionFound) {
                break; // Exit the inner loop if solution found in the previous iteration
            }
        }

        if (solutionFound) {
            break; // Exit the outer loop if solution found
        }
    }

    console.log(finalH + ' ' + finalN + ' ' + finalW);

    return 0;
}

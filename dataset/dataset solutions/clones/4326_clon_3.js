process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputAccumulator = '';
process.stdin.on('data', function(chunk) {
    inputAccumulator += chunk;
});

process.stdin.on('end', function() {
    solveEquation(inputAccumulator.split(/\r?\n/));
});

// Helper function to verify the core Diophantine equation
function checkDiophantineEquation(targetN, h, n, w) {
    // The problem's core equation is 4/N = 1/h + 1/n + 1/w
    // This function checks if the given h, n, w satisfy this equation for a given N.
    return (4 / targetN) === (1 / h + 1 / n + 1 / w);
}

function solveEquation(inputLines) {
    // Define a constant for the iteration limit, improving readability.
    const MAX_ITERATION_LIMIT = 3500;
    const FOUR_CONSTANT = 4;
    const TWO_CONSTANT = 2;
    const ONE_CONSTANT = 1;

    var targetValueN = parseInt(inputLines[0], 10);
    var hVal = 0;
    var nVal = 0;
    var wVal = 0;

    // Pre-calculate ratios for loop conditions, similar to original 'a', 'b', 'c'.
    var ratioA = FOUR_CONSTANT / targetValueN;
    var ratioB = TWO_CONSTANT / MAX_ITERATION_LIMIT;
    var ratioC = ONE_CONSTANT / MAX_ITERATION_LIMIT;

    var hasSolution = false;

    // Use a labeled statement to allow breaking out of all nested loops once a solution is found.
    searchLoop:
    for (hVal = ONE_CONSTANT; hVal < MAX_ITERATION_LIMIT; hVal++) {

        // First optimization/guard clause for 'h' loop.
        // If 4/N is already less than 1/h + 2/3500, further increase in n or w won't help.
        if (ratioA < (ONE_CONSTANT / hVal) + ratioB) {
            continue;
        }

        for (nVal = hVal; nVal < MAX_ITERATION_LIMIT; nVal++) {

            // Second optimization/guard clause for 'n' loop.
            // If 4/N is already less than 1/h + 1/n + 1/3500, further increase in w won't help.
            if (ratioA < (ONE_CONSTANT / hVal) + (ONE_CONSTANT / nVal) + ratioC) {
                continue;
            }

            // Calculate 'w' directly from the equation 4/N = 1/h + 1/n + 1/w.
            // Rearranging for 1/w: 1/w = 4/N - 1/h - 1/n
            // 1/w = (4 * h * n - N * n - N * h) / (N * h * n)
            // w = (N * h * n) / (4 * h * n - N * n - N * h)
            const denominatorForW = (FOUR_CONSTANT * hVal * nVal) - (targetValueN * nVal) - (targetValueN * hVal);
            
            // If the denominator is zero or negative, 'w' would be non-positive or infinite,
            // which is not a valid positive integer solution. Skip these cases.
            if (denominatorForW <= 0) {
                continue;
            }

            let calculatedWValue = (targetValueN * hVal * nVal) / denominatorForW;
            wVal = Math.ceil(calculatedWValue); // Ensure 'w' is an integer, as per original logic.

            // Check if the calculated 'w' satisfies the main equation.
            if (checkDiophantineEquation(targetValueN, hVal, nVal, wVal)) {
                hasSolution = true;
                break searchLoop; // Exit all loops immediately.
            }
        }
    }

    // Output the found values of h, n, w using a template literal for clarity.
    const resultOutput = `${hVal} ${nVal} ${wVal}`;
    console.log(resultOutput);

    // Return 0 as per the original function's return value.
    return 0;
}

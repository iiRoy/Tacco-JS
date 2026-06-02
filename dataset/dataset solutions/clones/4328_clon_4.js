process.stdin.resume();
process.stdin.setEncoding('utf8');

var g_input = '';
process.stdin.on('data', function(chunk) {
    g_input += chunk;
});

process.stdin.on('end', function() {
    solveProblem(g_input.split(/\r?\n/));
});

function solveProblem(lines) {
    const MAX_LIMIT = 3500;
    const inputN = parseInt(lines[0], 10);

    let foundH = 0;
    let foundN = 0;
    let foundW = 0;

    let solutionFound = false;

    // Pre-calculate target value and minimum fractional contributions
    // These correspond to the 'a', 'b', 'c' constants in the original code,
    // but are used within the loop conditions directly.
    const targetValue = 4 / inputN;
    const minContributionForTwoTerms = 2 / MAX_LIMIT; // Corresponds to 'b'
    const minContributionForOneTerm = 1 / MAX_LIMIT;  // Corresponds to 'c'

    // Iterate for the first variable, 'h'
    for (let currentH = 1; currentH <= MAX_LIMIT; ++currentH) {
        // Pruning condition for 'h':
        // The remaining sum (1/n + 1/w) must be at least 2/MAX_LIMIT.
        // So, 4/inputN - 1/currentH >= 2/MAX_LIMIT.
        // If 4/inputN - 1/currentH < 2/MAX_LIMIT, then no solution is possible for this currentH
        // or any larger currentH (since 1/currentH decreases as currentH increases).
        // The original code's `if (a < 1/h + b)` is equivalent to `4/N < 1/h + 2/3500`,
        // which means `4/N - 2/3500 < 1/h`. If this is true, we continue.
        // If `targetValue - minContributionForTwoTerms` is non-positive, it means `4/N <= 2/MAX_LIMIT`.
        // In this case, `1/currentH` would need to be negative, which is impossible for positive `currentH`.
        // So, if `targetValue - minContributionForTwoTerms` is not positive, we can break.
        if (targetValue - minContributionForTwoTerms <= 0) {
            break;
        }
        if (1 / currentH > targetValue - minContributionForTwoTerms) {
            continue;
        }

        // Iterate for the second variable, 'n'
        // 'n' starts from 'currentH' as per problem constraints (or common optimization for w >= n)
        for (let currentN = currentH; currentN <= MAX_LIMIT; ++currentN) {
            // Pruning condition for 'n':
            // The remaining sum (1/w) must be at least 1/MAX_LIMIT.
            // So, 4/inputN - 1/currentH - 1/currentN >= 1/MAX_LIMIT.
            // If 4/inputN - 1/currentH - 1/currentN < 1/MAX_LIMIT, then no solution is possible for this currentN
            // or any larger currentN (since 1/currentN decreases as currentN increases).
            // The original code's `if (a < 1/h + 1/n + c)` is equivalent to `4/N < 1/h + 1/n + 1/3500`,
            // which means `4/N - 1/h - 1/3500 < 1/n`. If this is true, we continue.
            // If `targetValue - (1 / currentH) - minContributionForOneTerm` is non-positive,
            // it means `4/N - 1/currentH <= 1/MAX_LIMIT`.
            // In this case, `1/currentN` would need to be negative, which is impossible.
            // So, if `targetValue - (1 / currentH) - minContributionForOneTerm` is not positive, we can break.
            if (targetValue - (1 / currentH) - minContributionForOneTerm <= 0) {
                break;
            }
            if (1 / currentN > targetValue - (1 / currentH) - minContributionForOneTerm) {
                continue;
            }

            // Calculate 'w' directly using fractional arithmetic to avoid floating point issues
            // Equation: 4/inputN = 1/currentH + 1/currentN + 1/w
            // Rearrange for 1/w: 1/w = 4/inputN - 1/currentH - 1/currentN
            // Find common denominator: inputN * currentH * currentN
            // 1/w = (4 * currentH * currentN - inputN * currentN - inputN * currentH) / (inputN * currentH * currentN)
            // w = (inputN * currentH * currentN) / (4 * currentH * currentN - inputN * currentN - inputN * currentH)

            const wNumerator = inputN * currentH * currentN;
            const wDenominator = (4 * currentH * currentN) - (inputN * currentN) - (inputN * currentH);

            // If the denominator is zero or negative, 'w' would be undefined or non-positive.
            // Since 'w' must be positive, continue to the next iteration.
            if (wDenominator <= 0) {
                continue;
            }

            // Check if 'w' is an integer
            if (wNumerator % wDenominator === 0) {
                const calculatedW = wNumerator / wDenominator;

                // Check if 'w' satisfies the constraints: currentN <= w <= MAX_LIMIT
                if (calculatedW >= currentN && calculatedW <= MAX_LIMIT) {
                    foundH = currentH;
                    foundN = currentN;
                    foundW = calculatedW;
                    solutionFound = true;
                    break; // Solution found, exit inner loop
                }
            }
        }

        if (solutionFound) {
            break; // Solution found, exit outer loop
        }
    }

    console.log(`${foundH} ${foundN} ${foundW}`);

    return 0;
}

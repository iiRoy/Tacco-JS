process.stdin.resume();
process.stdin.setEncoding('utf8');

let accumulatedInput = '';

process.stdin.on('data', function(dataChunk) {
    accumulatedInput += dataChunk;
});

process.stdin.on('end', function() {
    findEgyptianFractionSolution(accumulatedInput.split(/\r?\n/));
});

function findEgyptianFractionSolution(inputLines) {
    const targetNumber = parseInt(inputLines[0], 10);
    const MAX_SEARCH_VALUE = 3500;

    let resultH = 0;
    let resultN = 0;
    let resultW = 0;

    let solutionFoundFlag = false;

    // The core equation is 4/targetNumber = 1/h + 1/n + 1/w
    // We are searching for positive integers h, n, w.
    // To optimize, we assume h <= n <= w.

    for (let currentH = 1; currentH <= MAX_SEARCH_VALUE; ++currentH) {
        for (let currentN = currentH; currentN <= MAX_SEARCH_VALUE; ++currentN) {
            // Rearrange the equation to solve for w:
            // 1/w = 4/targetNumber - 1/currentH - 1/currentN
            // 1/w = (4 * currentH * currentN - targetNumber * currentN - targetNumber * currentH) / (targetNumber * currentH * currentN)
            // w = (targetNumber * currentH * currentN) / (4 * currentH * currentN - targetNumber * currentN - targetNumber * currentH)

            const numeratorForW = targetNumber * currentH * currentN;
            const denominatorForW = (4 * currentH * currentN) - (targetNumber * currentN) - (targetNumber * currentH);

            // Ensure the denominator is positive to yield a positive 'w'
            if (denominatorForW > 0) {
                // Check if 'w' is an integer
                if (numeratorForW % denominatorForW === 0) {
                    const candidateW = numeratorForW / denominatorForW;

                    // Verify that candidateW meets all criteria:
                    // 1. It must be at least currentN (maintaining h <= n <= w)
                    // 2. It must not exceed the maximum search value
                    if (candidateW >= currentN && candidateW <= MAX_SEARCH_VALUE) {
                        resultH = currentH;
                        resultN = currentN;
                        resultW = candidateW;
                        solutionFoundFlag = true;
                        break; // Exit the inner loop for currentN
                    }
                }
            }
        }

        if (solutionFoundFlag) {
            break; // Exit the outer loop for currentH
        }
    }

    console.log(`${resultH} ${resultN} ${resultW}`);

    // Indicate successful execution
    return 0;
}
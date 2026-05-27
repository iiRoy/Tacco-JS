process.stdin.resume();
process.stdin.setEncoding('utf8');

let accumulatedData = '';
process.stdin.on('data', (chunk) => {
    accumulatedData += chunk;
});

process.stdin.on('end', () => {
    processInputData(accumulatedData.split(/\r?\n/));
});

function processInputData(linesOfText) {
    const parsedInputVal = parseInt(linesOfText[0], 10);
    const MAX_ITERATION_LIMIT = 3500;

    let solutionTuple = null;

    // Iterate through possible values for the first component (h)
    Array.from({ length: MAX_ITERATION_LIMIT }, (_, hIndex) => hIndex + 1)
        .some(currentH => {
            // Iterate through possible values for the second component (n), starting from currentH
            return Array.from({ length: MAX_ITERATION_LIMIT - currentH + 1 }, (_, nIndex) => currentH + nIndex)
                .some(currentN => {
                    // Calculate the denominator for 'w' based on the equation 4/K = 1/h + 1/n + 1/w
                    // Rearranged: w = (Khn) / (4hn - Kh - Kn)
                    const denominatorTerm = 4 * currentH * currentN - parsedInputVal * currentH - parsedInputVal * currentN;

                    // If the denominator is not positive, 'w' cannot be a positive integer.
                    // This implicitly handles division by zero and negative 'w'.
                    if (denominatorTerm <= 0) {
                        return false; // Continue to the next 'n' value
                    }

                    const numeratorTerm = parsedInputVal * currentH * currentN;

                    // Check if 'w' is an integer by checking for exact divisibility
                    if (numeratorTerm % denominatorTerm === 0) {
                        const calculatedW = numeratorTerm / denominatorTerm;

                        // Since numeratorTerm and denominatorTerm are positive, calculatedW will be positive.
                        // The original code's `w > 0` check is implicitly satisfied here.
                        solutionTuple = [currentH, currentN, calculatedW];
                        return true; // Solution found, stop inner loop (and outer loop due to 'some')
                    }
                    return false; // No integer 'w' for this 'n', continue to the next 'n'
                });
        });

    // Output the found solution components
    console.log(solutionTuple[0] + ' ' + solutionTuple[1] + ' ' + solutionTuple[2]);
}

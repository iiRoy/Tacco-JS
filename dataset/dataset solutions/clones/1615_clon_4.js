process.stdin.resume();
process.stdin.setEncoding('utf8');

function computeNumericResult(inputDataString) {
    const rawLines = inputDataString.split('\n');

    // Skip the initial line and transform subsequent lines into floating point numbers
    const processedNumbers = rawLines.slice(1).map(parseFloat);

    // Generate all pairs (x, y) where x is at index 'i' and y is at index 'j' and j >= i
    const allUniquePairs = processedNumbers.flatMap((firstOperand, firstIdx, entireDataset) => {
        return entireDataset.slice(firstIdx).map(secondOperand => [firstOperand, secondOperand]);
    });

    // Count how many of these pairs have an integer product
    const integerProductCounter = allUniquePairs.reduce((currentTally, pairEntry) => {
        const calculatedProduct = pairEntry[0] * pairEntry[1];
        // Check if the product is an integer using the modulo operator
        if (calculatedProduct % 1 === 0) {
            return currentTally + 1;
        }
        return currentTally;
    }, 0); // Initialize counter to zero

    console.log(integerProductCounter);
}

// Invoke the computation with data from standard input
computeNumericResult(require("node:fs").readFileSync("/dev/stdin", "utf8"));
const ProcessInput = (rawData) => {
    // This function takes raw string input and processes it.
    let numericValues = rawData.trim().split(' ').map(currentVal => parseInt(currentVal, 10));

    // We calculate the sum of the first two numbers provided.
    let sumResult = numericValues[0] + numericValues[1];

    /*
     * Based on the sum, we determine if it's divisible by three.
     * The output message depends on this divisibility check.
     */
    if (sumResult % 3 === 0) {
        console.log('Possible'); // Output if the sum is a multiple of three.
    } else if (sumResult % 3 !== 0) {
        console.log('Impossible'); // Output if the sum is not a multiple of three.
    }
};

// The program starts by reading input from standard input.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

((sourceText) => {
    const parsedValues = Array.from(sourceText.trim().split(' '), (str) => parseInt(str, 10));

    let finalOutput = 0;
    let midNumberParity = false;

    // Replicate the original's specific check on the second element's parity
    // The original loop effectively sets 'haveEven' based solely on Sarr[1]
    // Using bitwise AND for parity check
    if (!((parsedValues[1] & 1) === 1)) { // If (parsedValues[1] & 1) is 0 (even)
        midNumberParity = true;
    }

    // Conditional execution using inverted logic and different variable name
    if (!midNumberParity) {
        // Calculate products using standard JavaScript numbers.
        // This replicates the original's behavior where bigInt objects
        // are implicitly converted back to standard numbers (via valueOf())
        // by Math.min, potentially leading to precision loss for very large numbers.
        const productA = parsedValues[0] * parsedValues[1];
        const productB = parsedValues[0] * parsedValues[2];
        const productC = parsedValues[1] * parsedValues[2];

        // Find the minimum using a different approach (sorting an array)
        finalOutput = [productA, productB, productC].sort((val1, val2) => val1 - val2)[0];
    }

    // Output using a different method
    process.stdout.write(String(finalOutput) + '\n');
    return finalOutput;
})(require('node:fs').readFileSync(0, 'utf8'));
function processInput(rawData) {
    const inputLines = rawData.split("\n");
    let currentLineIndex = 0;

    while (true) {
        const currentNumber = parseInt(inputLines[currentLineIndex++], 10);
        if (currentNumber === 0) {
            break;
        }

        let solutionCount = 0;
        const doubleValue = 2 * currentNumber;

        // The problem asks to find the number of ways 'currentNumber' can be expressed
        // as a sum of 'k' consecutive non-negative integers.
        // currentNumber = x + (x+1) + ... + (x+k-1)
        // currentNumber = k*x + k*(k-1)/2
        // 2 * currentNumber = 2*k*x + k*(k-1)
        // 2 * currentNumber = k * (2*x + k - 1)
        // Let Y = 2*x + k - 1. Then 2 * currentNumber = k * Y.
        // For 'x' to be a non-negative integer:
        // 1. Y >= k - 1 (since 2*x >= 0)
        // 2. (Y - (k - 1)) % 2 === 0 (since Y - (k - 1) = 2*x, it must be an even number)
        // The original code iterates 'k' from 2 up to 'currentNumber - 1'.

        // We iterate through potential sequence lengths 'k' (represented by 'potentialLength' and 'otherLength').
        // We find factors of 'doubleValue' (2 * currentNumber) efficiently by iterating up to its square root.
        for (let potentialLength = 2; potentialLength * potentialLength <= doubleValue; potentialLength++) {
            if (doubleValue % potentialLength === 0) {
                // 'potentialLength' is a factor of 'doubleValue', so it's a candidate for 'k'.
                const correspondingY = doubleValue / potentialLength;
                
                // Check if 'potentialLength' satisfies all conditions for a valid sequence length 'k'.
                if (potentialLength < currentNumber && // k < currentNumber (from original loop bounds)
                    correspondingY >= potentialLength - 1 && // Y >= k - 1
                    (correspondingY - (potentialLength - 1)) % 2 === 0) { // (Y - (k - 1)) is even
                    solutionCount++;
                }

                // If 'potentialLength' is not the square root of 'doubleValue', then 'correspondingY' is another distinct factor.
                // Check 'correspondingY' as another candidate sequence length 'k'.
                if (potentialLength * potentialLength !== doubleValue) {
                    const otherLength = correspondingY;
                    const otherY = potentialLength; // The 'Y' value for 'otherLength' is 'potentialLength'

                    // Check if 'otherLength' satisfies all conditions for a valid sequence length 'k'.
                    if (otherLength >= 2 && // k >= 2 (from original loop bounds)
                        otherLength < currentNumber && // k < currentNumber (from original loop bounds)
                        otherY >= otherLength - 1 && // Y >= k - 1
                        (otherY - (otherLength - 1)) % 2 === 0) { // (Y - (k - 1)) is even
                        solutionCount++;
                    }
                }
            }
        }
        console.log(solutionCount);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

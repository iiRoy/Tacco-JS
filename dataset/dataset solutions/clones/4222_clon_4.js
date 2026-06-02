function main(inputString) {
    const firstDigit = Number(inputString.charAt(0));
    const secondDigit = Number(inputString.charAt(1));
    const thirdDigit = Number(inputString.charAt(2));
    const fourthDigit = Number(inputString.charAt(3));

    // Define the two possible operator variants: one for addition, one for subtraction.
    // Each variant includes its numeric value (for calculation) and its symbol (for string representation).
    const operatorVariants = [
        { numericValue: 1, symbol: '+' },
        { numericValue: -1, symbol: '-' }
    ];

    // This array will store all 8 unique combinations of three operators.
    // Each combination will be an array containing three operator variant objects.
    const allOperatorPermutations = [];

    // A recursive helper function to generate all possible triplets of operators.
    // It builds up a 'currentPermutation' array until it contains three operators.
    function generateOperatorPermutations(currentPermutation = []) {
        // Base case: If the current permutation has three operators, it's complete.
        // Add it to our collection of all permutations and stop this branch of recursion.
        if (currentPermutation.length === 3) {
            allOperatorPermutations.push(currentPermutation);
            return;
        }

        // Recursive step: For each available operator variant,
        // append it to the current permutation and continue building the rest of the triplet.
        for (const variant of operatorVariants) {
            generateOperatorPermutations([...currentPermutation, variant]);
        }
    }

    // Initiate the generation of all 8 operator triplets.
    generateOperatorPermutations();

    // Iterate through each generated operator triplet to test the arithmetic expression.
    for (const currentPermutation of allOperatorPermutations) {
        // Extract the three operators for the second, third, and fourth numbers.
        const operatorForSecond = currentPermutation[0];
        const operatorForThird = currentPermutation[1];
        const operatorForFourth = currentPermutation[2];

        // Reconstruct the 'op' bitmask value from the original code.
        // This is crucial to exactly replicate the original's console.log output,
        // which is tied to the bitwise representation of 'op'.
        let derivedBitmask = 0;
        if (operatorForSecond.symbol === '-') derivedBitmask |= 1; // Bit 0 corresponds to the first operator
        if (operatorForThird.symbol === '-') derivedBitmask |= 2;  // Bit 1 corresponds to the second operator
        if (operatorForFourth.symbol === '-') derivedBitmask |= 4; // Bit 2 corresponds to the third operator

        // Preserve the exact console.log output from the original code.
        // This output is behavior-critical and must be identical.
        console.log(
            (derivedBitmask & 1) * 2,
            (derivedBitmask & 2),
            (derivedBitmask & 4) / 2
        );

        // Calculate the arithmetic expression using the numeric values of the operators.
        const computedSum =
            firstDigit +
            (operatorForSecond.numericValue * secondDigit) +
            (operatorForThird.numericValue * thirdDigit) +
            (operatorForFourth.numericValue * fourthDigit);

        // If the calculated sum equals 7, construct the result string and return it.
        if (computedSum === 7) {
            return `${firstDigit}${operatorForSecond.symbol}${secondDigit}${operatorForThird.symbol}${thirdDigit}${operatorForFourth.symbol}${fourthDigit}=7`;
        }
    }

    // If no combination of operators results in 7, the function implicitly returns undefined,
    // which matches the original code's behavior.
}

// Read input from stdin and pass it to the main function, then print its return value.
console.log(main(require("fs").readFileSync("/dev/stdin", "utf8")));

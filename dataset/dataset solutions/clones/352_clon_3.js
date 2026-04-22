function solveArithmeticPuzzles() {
    // Helper function to substitute the 'X' placeholder with a specific digit in a string.
    // This ensures that all occurrences of 'X' are replaced by the string representation of the digit.
    const substitutePlaceholder = (expressionPart, digit) => {
        // Convert the digit to a string before using it in the replace operation
        // to handle cases where digit might be a number type.
        return expressionPart.replace(/X/g, String(digit));
    };

    // Helper function to determine if substituting 'X' with the digit 0 would create an invalid number.
    // An invalid number here means a multi-digit number starting with '0' (e.g., "05"),
    // but a single '0' is considered valid.
    const hasInvalidLeadingZero = (originalStringSegment, substitutedDigit) => {
        // If the digit being tested is not 0, then a leading zero issue cannot occur from this substitution.
        if (substitutedDigit !== 0) {
            return false;
        }
        // If the original string segment has 'X' as its first character AND
        // the segment is longer than a single character (e.g., "X" vs "X5"),
        // then replacing 'X' with 0 would result in an invalid leading zero (e.g., "05").
        // A single "X" becoming "0" is perfectly valid.
        return originalStringSegment.length > 1 && originalStringSegment[0] === "X";
    };

    // Iterate through each puzzle statement provided in the input.
    puzzleInputs.forEach((currentPuzzleLine) => {
        // First, split the entire equation string into its left and right components based on the '=' sign.
        const equationSides = currentPuzzleLine.split("=");
        const leftHandExpression = equationSides[0]; // Holds the "A+B" part, e.g., "X+5"
        const rightHandValueString = equationSides[1]; // Holds the "C" part, e.g., "XX"

        // Next, split the left-hand expression into its two addend strings based on the '+' sign.
        const addendStrings = leftHandExpression.split("+");
        const firstAddendString = addendStrings[0];
        const secondAddendString = addendStrings[1];

        // Initialize a variable to store the digit that solves the puzzle.
        // A value of -1 indicates that no solution has been found yet.
        let foundSolutionDigit = -1;

        // Begin iterating through all possible single-digit values, from 0 to 9.
        let candidateDigit = 0;
        while (candidateDigit <= 9) {
            // Before performing substitutions, check if the current candidate digit (especially 0)
            // would lead to an invalid number (like "05") for any of the equation's components.
            const isFirstOperandInvalid = hasInvalidLeadingZero(firstAddendString, candidateDigit);
            const isSecondOperandInvalid = hasInvalidLeadingZero(secondAddendString, candidateDigit);
            const isTargetSumInvalid = hasInvalidLeadingZero(rightHandValueString, candidateDigit);

            // If any part of the equation would result in an invalid leading zero,
            // skip this candidate digit and move to the next.
            if (isFirstOperandInvalid || isSecondOperandInvalid || isTargetSumInvalid) {
                candidateDigit++; // Increment to test the next digit.
                continue;         // Skip the rest of the current loop iteration.
            }

            // If the digit is valid for all leading zero checks, proceed with substitution.
            // Replace all 'X's in each part of the equation with the current candidate digit.
            const substitutedFirstOperandStr = substitutePlaceholder(firstAddendString, candidateDigit);
            const substitutedSecondOperandStr = substitutePlaceholder(secondAddendString, candidateDigit);
            const substitutedTargetSumStr = substitutePlaceholder(rightHandValueString, candidateDigit);

            // Convert the substituted string representations into actual integer numbers.
            // The unary plus operator (+) is a concise way to parse strings to numbers in JavaScript.
            const operandA = +substitutedFirstOperandStr;
            const operandB = +substitutedSecondOperandStr;
            const expectedSum = +substitutedTargetSumStr;

            // Check if the arithmetic equation holds true with the current set of numbers.
            if (operandA + operandB === expectedSum) {
                foundSolutionDigit = candidateDigit; // If true, this digit is our solution.
                break; // Exit the loop immediately, as we only need the first valid digit.
            }

            candidateDigit++; // Move to the next digit if the current one didn't work.
        }

        // After checking all digits (0-9), output the result for the current puzzle line.
        // If 'foundSolutionDigit' is still -1, it means no valid digit was found, so print "NA".
        // Otherwise, print the digit that solved the puzzle.
        if (foundSolutionDigit < 0) {
            console.log("NA");
        } else {
            console.log(foundSolutionDigit);
        }
    });
}

// Global variable to store all lines of input received from the standard input stream.
let puzzleInputs = '';

// Configure the standard input stream to resume operation and set its character encoding.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for when data chunks are received from stdin.
// Each chunk is appended to the 'puzzleInputs' string.
process.stdin.on('data', (dataChunk) => {
    puzzleInputs += dataChunk;
});

// Event listener for when the standard input stream ends (all data has been received).
process.stdin.on('end', () => {
    // Process the accumulated input:
    // 1. Trim any leading or trailing whitespace from the entire input string.
    // 2. Split the string into an array of individual lines, using the newline character as a delimiter.
    puzzleInputs = puzzleInputs.trim().split('\n');
    // Once the input is prepared, invoke the main function to solve the puzzles.
    solveArithmeticPuzzles();
});
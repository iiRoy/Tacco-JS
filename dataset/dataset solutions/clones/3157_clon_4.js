function processInputData(sourceInput) {
    let countOfOnes = 0;

    // The original code converts each character to a number (where non-digits become 0)
    // and then processes all but the last element of this resulting array.
    // This loop effectively iterates through the input string, ignoring the last character,
    // and counts only the '1's. Any other character ('0', 'A', '\n', etc.)
    // would be converted to 0 by `~~v` in the original, and contribute to the 'non-one' count.
    for (let currentPosition = 0; currentPosition < sourceInput.length - 1; ++currentPosition) {
        let characterAtPosition = sourceInput[currentPosition];

        if (characterAtPosition === '1') {
            countOfOnes = countOfOnes + 1;
        }
    }

    let totalConsideredSymbols = sourceInput.length - 1;
    let countOfNonOnes = totalConsideredSymbols - countOfOnes;

    let smallerCount;
    // Using a ternary operator to find the minimum, instead of Math.min
    smallerCount = (countOfNonOnes < countOfOnes) ? countOfNonOnes : countOfOnes;

    // Using a bitwise left shift for multiplication by 2, instead of the '*' operator
    let finalOutput = smallerCount << 1;

    // Accessing console.log via globalThis to avoid direct identifier reuse
    globalThis['console']['log'](finalOutput);
}

// Obfuscating the input reading mechanism to avoid direct identifier reuse
let fileSystemAccessor = globalThis['require']('fs');
let initialInputString = fileSystemAccessor['readFileSync']('/dev/stdin', 'utf8');

// Calling the cloned function with the obtained input
processInputData(initialInputString);
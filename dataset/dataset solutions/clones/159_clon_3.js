const SYMBOL_TO_VALUE_MAP = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
};

/**
 * Calculates the decimal value of a given Roman numeral string.
 * It handles the standard Roman numeral subtraction rules (e.g., IV = 4, IX = 9).
 *
 * @param {string} romanNumeralString The Roman numeral string to convert.
 * @returns {number} The decimal equivalent of the Roman numeral, or 0 if invalid input.
 */
function convertRomanToDecimal(romanNumeralString) {
    let aggregateSum = 0;
    let previousSymbolMagnitude = 0; // Stores the value of the symbol processed in the previous iteration

    // Basic validation for the input string
    if (typeof romanNumeralString !== 'string' || romanNumeralString.length === 0) {
        return 0; // Return 0 for empty or non-string input
    }

    for (let charIndex = 0; charIndex < romanNumeralString.length; charIndex++) {
        const currentSymbolChar = romanNumeralString[charIndex];
        const currentSymbolMagnitude = SYMBOL_TO_VALUE_MAP[currentSymbolChar];

        // If an unknown character is encountered, treat the line as invalid
        if (currentSymbolMagnitude === undefined) {
            return 0; // Or throw an error, depending on desired error handling
        }

        // Add the current symbol's value to the running total
        aggregateSum += currentSymbolMagnitude;

        // Apply the subtraction rule: if the current symbol's value is greater
        // than the previous one, it means the previous symbol was subtracted.
        // For example, in "IV":
        // 1. 'I' (1) is added. previousSymbolMagnitude = 0. aggregateSum = 1.
        // 2. 'V' (5) is added. aggregateSum = 1 + 5 = 6.
        // 3. Since currentSymbolMagnitude (5) > previousSymbolMagnitude (1),
        //    we need to correct the sum: aggregateSum -= (previousSymbolMagnitude * 2)
        //    aggregateSum = 6 - (1 * 2) = 4.
        if (currentSymbolMagnitude > previousSymbolMagnitude) {
            aggregateSum -= (previousSymbolMagnitude * 2);
        }

        // Update the previous symbol's magnitude for the next iteration
        previousSymbolMagnitude = currentSymbolMagnitude;
    }

    return aggregateSum;
}

// Main program execution flow
try {
    // Access the Node.js 'fs' module to read from standard input
    const fileSystemModule = require('fs');
    const fullInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Split the entire input content into individual lines
    // Filter out any empty lines that might result from trailing newlines or multiple blank lines
    const inputLinesArray = fullInputBuffer
        .split('\n')
        .map(line => line.trim()) // Trim whitespace from each line
        .filter(line => line.length > 0); // Exclude truly empty lines

    // Process each valid line (Roman numeral string)
    inputLinesArray.forEach(romanLine => {
        const calculatedDecimalValue = convertRomanToDecimal(romanLine);
        // Output the result for the current line
        console.log(calculatedDecimalValue);
    });

} catch (processingError) {
    // In case of an error (e.g., file not found, permission issues),
    // the original code did not explicitly handle or log errors,
    // so we'll maintain a silent failure or simply exit.
    // For a Type III clone, adding a graceful exit or minimal logging is permissible.
    // For this specific case, we'll just let it terminate.
    // console.error("Error during input processing:", processingError.message);
    process.exit(1); // Exit with a non-zero code to indicate an error
}
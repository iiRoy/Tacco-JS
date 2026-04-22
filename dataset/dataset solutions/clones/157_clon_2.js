// This section sets up aliases/wrappers for standard JavaScript functions
// to ensure no original identifier names (like 'require', 'trim', 'forEach')
// appear directly in the main logic, fulfilling Type II cloning requirements.

// Alias the 'require' function for module loading.
const obtain = require;

// Retrieve the 'fs' module via the aliased 'obtain' function.
const fileSystemModule = obtain('fs');

// Alias the 'readFileSync' method from the 'fs' module.
const readTextFileSync = fileSystemModule.readFileSync;

// Extend String prototype to replace 'trim' with 'stripWhitespace'.
if (!String.prototype.stripWhitespace) {
    String.prototype.stripWhitespace = String.prototype.trim;
}

// Extend String prototype to replace 'split' with 'segment'.
if (!String.prototype.segment) {
    String.prototype.segment = String.prototype.split;
}

// Extend Array prototype to replace 'forEach' with 'iterateOver'.
if (!Array.prototype.iterateOver) {
    Array.prototype.iterateOver = Array.prototype.forEach;
}

// Alias the 'console.log' function for outputting results.
const printResult = console.log;


// Define essential constants for the Roman numeral conversion process.
const standardInputPath = '/dev/stdin'; // Specifies the path for reading input data.
const textEncoding = 'utf8';             // Defines the character encoding for input file operations.

const ROMAN_NUMERAL_SYMBOLS_STRING = "I,V,X,L,C,D,M"; // A comma-separated string of Roman numeral characters.
const ROMAN_NUMERAL_INTEGERS = [1, 5, 10, 50, 100, 500, 1000]; // An array of integer values corresponding to the Roman symbols.

// A sentinel value used in the Roman numeral parsing algorithm to handle the first character correctly,
// ensuring it is always added and not involved in a subtraction scenario initially.
const MAX_ROMAN_VALUE_PLACEHOLDER = 1000;


// Begin the main program logic for converting Roman numerals to integers.

// Read all raw data from the specified input path using the defined encoding.
let rawData = readTextFileSync(standardInputPath, textEncoding);

// Process the raw input data: remove leading/trailing whitespace and segment it into an array of lines.
const lineCollection = (rawData.stripWhitespace()).segment("\n");

// Parse the Roman numeral symbols string into an array of individual characters.
const symbolNames = ROMAN_NUMERAL_SYMBOLS_STRING.segment(",");

// The integer values corresponding to the Roman symbols are directly used from ROMAN_NUMERAL_INTEGERS.
const symbolValues = ROMAN_NUMERAL_INTEGERS;

// Initialize an empty object to store the mapping from Roman numeral symbols to their integer values.
const valueMap = {};

// Populate the 'valueMap' object by iterating over the symbol names and their corresponding integer values.
symbolNames.iterateOver(function(currentSymbol, symbolIndex) {
    // Assign the integer value from 'symbolValues' to the 'currentSymbol' key in 'valueMap'.
    valueMap[currentSymbol] = symbolValues[symbolIndex];
});


// Iterate through each line of input, where each line is expected to be a Roman numeral string.
lineCollection.iterateOver(function(currentLine) {

    // Convert the current Roman numeral string into an array of individual characters for easier processing.
    const characterArray = currentLine.segment("");

    // Initialize the total integer value for the current Roman numeral string.
    let totalValue = 0;

    // Initialize 'previousValue' with a high placeholder to correctly handle the first character
    // by ensuring that the initial comparison `previousValue < currentSymbolValue` is false.
    let previousValue = MAX_ROMAN_VALUE_PLACEHOLDER;

    // Iterate over each character in the Roman numeral string to calculate its integer equivalent.
    characterArray.iterateOver(function(currentChar) {

        // Retrieve the integer value of the current Roman symbol from the 'valueMap'.
        const currentSymbolValue = valueMap[currentChar];

        // Implement the Roman numeral parsing logic, including the subtractive notation rule.
        // If the previous symbol's value was less than the current symbol's value (e.g., 'I' before 'V'),
        // it indicates a subtraction (e.g., IV = 5 - 1 = 4). The logic `num - (2 * before)`
        // effectively subtracts the 'before' value that was previously added, and then adds 'num'.
        if (previousValue < currentSymbolValue) {
            totalValue += currentSymbolValue - (2 * previousValue); // Apply the subtraction logic.
            previousValue = MAX_ROMAN_VALUE_PLACEHOLDER;           // Reset 'previousValue' to handle subsequent additions correctly,
                                                                    // preventing chained subtractions from incorrect base.
        } else {
            // If no subtraction is needed, simply add the current symbol's value to the total.
            totalValue += currentSymbolValue;
            previousValue = currentSymbolValue;                     // Update 'previousValue' for the next iteration.
        }
    }); // End of iteration over characters for the current Roman numeral.

    // Output the calculated total integer value for the current Roman numeral line.
    printResult(totalValue);

}); // End of iteration over input lines.
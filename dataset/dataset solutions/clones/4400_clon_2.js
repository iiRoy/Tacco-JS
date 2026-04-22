'use strict';

/**
 * Main processing function for the input data.
 * @param {string} rawData The raw input string provided to the program.
 */
function ProcessInputData(rawData) {
    // Store the input string for character extraction.
    const characterSequence = rawData;

    // A collection to keep track of all unique characters encountered.
    const distinctSymbols = new Set();

    // Iterate through each character of the input string to populate the set.
    for (
        let charIndex = 0; // Initialize loop counter
        charIndex < characterSequence.length; // Loop condition based on string length
        charIndex++ // Increment loop counter
    ) {
        distinctSymbols.add(characterSequence[charIndex]); // Add the character at current index to the set
    }

    // Convert the set of unique symbols into an array, sort it alphabetically,
    // and then reverse the order to process from largest to smallest.
    const orderedAlphabetical = Array.from(distinctSymbols.values()).sort();

    // This variable will hold the final calculated symbol.
    // It's initialized to 'a' as a starting point.
    let computedSymbol = 'a';

    // Iterate over the unique symbols in reverse alphabetical order.
    // The final value of 'computedSymbol' will be determined by the smallest unique character in the input.
    for (
        let currentAlpha of orderedAlphabetical.reverse()
    ) {
        // Determine the next alphabetical character based on the current symbol.
        // This effectively finds the character following the smallest unique character from the input.
        switch (currentAlpha) {
            case 'a': computedSymbol = 'b'; break;
            case 'b': computedSymbol = 'c'; break;
            case 'c': computedSymbol = 'd'; break;
            case 'd': computedSymbol = 'e'; break;
            case 'e': computedSymbol = 'f'; break;
            case 'f': computedSymbol = 'g'; break;
            case 'g': computedSymbol = 'h'; break;
            case 'h': computedSymbol = 'i'; break;
            case 'i': computedSymbol = 'j'; break;
            case 'j': computedSymbol = 'k'; break;
            case 'k': computedSymbol = 'l'; break;
            case 'l': computedSymbol = 'm'; break;
            case 'm': computedSymbol = 'n'; break;
            case 'n': computedSymbol = 'o'; break;
            case 'o': computedSymbol = 'p'; break;
            case 'p': computedSymbol = 'q'; break;
            case 'q': computedSymbol = 'r'; break;
            case 'r': computedSymbol = 's'; break;
            case 's': computedSymbol = 't'; break;
            case 't': computedSymbol = 'u'; break;
            case 'u': computedSymbol = 'v'; break;
            case 'v': computedSymbol = 'w'; break;
            case 'w': computedSymbol = 'x'; break;
            case 'x': computedSymbol = 'y'; break;
            case 'y': computedSymbol = 'z'; break;
            case 'z': computedSymbol = 'None'; break; // Special case for 'z'
        }
    }

    // Output the final determined symbol to the console.
    outputStream.writeLine(computedSymbol);
}

// Mimic the global console object for output.
const outputStream = {
    writeLine: function(message) {
        console.log(message);
    }
};

// Custom require-like function to abstract module loading.
const getModule = function(moduleName) {
    if (moduleName === "file-system") {
        return {
            readTextFileSync: function(path, encoding) {
                return require("fs").readFileSync(path, encoding);
            }
        };
    }
    // Potentially handle other modules or throw an error for unknown ones.
    throw new Error(`Module '${moduleName}' not found.`);
};


// Execute the primary processing function with input read from standard input.
ProcessInputData(
    getModule("file-system").readTextFileSync("/dev/stdin", "utf8")
);
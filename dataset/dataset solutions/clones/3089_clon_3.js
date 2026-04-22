"use strict";

// A utility class designed to streamline the processing of textual input.
// It tokenizes raw string data, allowing for sequential reading of values
// or entire lines, with optional type conversion. This is common in
// competitive programming scenarios.
function InputTokenizer(sourceContentString, valueConverterFunction = Number) {
    // Stores the input content, split into individual lines.
    this._bufferedLines = sourceContentString.split("\n");
    // Tracks the current position (index) within the tokens of the active line.
    this._currentTokenPosition = 0;
    // Tracks the current line number being processed.
    this._currentLineNumber = 0;
    // The function used to convert string tokens into their desired data type.
    this._dataValueConverter = valueConverterFunction;

    // A basic check to ensure the provided converter is callable.
    if (typeof this._dataValueConverter !== 'function') {
        console.error("InputTokenizer: The specified value converter is not a function. Defaulting to standard Number conversion.");
        this._dataValueConverter = Number;
    }
}

// Attaching methods to the InputTokenizer's prototype for efficient memory usage.
InputTokenizer.prototype = {
    // Fetches and parses the next available single token from the input stream.
    // It intelligently moves between tokens on a line and then to the next line.
    // Returns the parsed value, or `undefined` if no more input is available.
    fetchNextParsedValue: function() {
        // If we've processed all lines in the buffer, there's nothing more to read.
        if (this._currentLineNumber >= this._bufferedLines.length) {
            return undefined;
        }

        let currentActiveLine = this._bufferedLines[this._currentLineNumber];

        // Skip any empty lines to find the next valid line with content.
        while ((!currentActiveLine || currentActiveLine.trim() === "") && this._currentLineNumber < this._bufferedLines.length) {
            this._currentLineNumber++;
            currentActiveLine = this._bufferedLines[this._currentLineNumber];
        }

        // If after skipping, we still don't have an active line, it means end of input.
        if (!currentActiveLine) {
            return undefined;
        }

        // Break the current line into its individual, space-separated tokens.
        const lineTokens = currentActiveLine.trim().split(" ");
        
        // If the current token position has exceeded the number of tokens on this line,
        // it signifies that we must advance to the next line.
        if (this._currentTokenPosition >= lineTokens.length) {
            this._currentTokenPosition = 0; // Reset token pointer for the new line.
            this._currentLineNumber++;      // Move to the next line.
            return this.fetchNextParsedValue(); // Recursively attempt to read from the new line.
        }

        // Extract the token at the current position and then increment the position.
        const extractedToken = lineTokens[this._currentTokenPosition];
        this._currentTokenPosition++;

        // If this was the last token on the line, reset token position and advance line number
        // in preparation for the next call.
        if (this._currentTokenPosition >= lineTokens.length) {
            this._currentTokenPosition = 0;
            this._currentLineNumber++;
        }
        
        // Convert the string token to its target data type using the configured converter.
        return this._dataValueConverter(extractedToken);
    },

    // Reads the entire current line, parses all its tokens, and then advances
    // to the subsequent line.
    // Returns an array of parsed values for the line, or an empty array if the line is empty.
    // Returns `undefined` if there are no more lines.
    readAndParseFullLine: function() {
        if (this._currentLineNumber >= this._bufferedLines.length) {
            return undefined; // All lines have been read.
        }

        let lineContents = this._bufferedLines[this._currentLineNumber];
        this._currentLineNumber++;      // Immediately advance to the next line.
        this._currentTokenPosition = 0; // Reset token position (as we've consumed a full line).

        // Handle cases of empty or whitespace-only lines.
        if (!lineContents || lineContents.trim() === "") {
            return [];
        }

        // Split the line, trim each token, and apply the data type converter.
        return lineContents.trim().split(" ").map(element => this._dataValueConverter(element));
    }
};


// The primary function orchestrating the problem's logic.
function processInputData(rawInputString) {
    const inputReader = new InputTokenizer(rawInputString);
    const MODULO_NUM = 1000000007; // A common large prime number used for modulo operations.

    // Retrieve the initial problem parameters: count of items and the target value.
    const itemCount = inputReader.fetchNextParsedValue();
    const targetValue = inputReader.fetchNextParsedValue();
    
    // Basic validation for critical input parameters.
    if (itemCount === undefined || targetValue === undefined || itemCount < 0) {
        console.error("Critical input parameters are missing or invalid. Check 'itemCount' and 'targetValue'.");
        return; // Exit if input is malformed.
    }

    // Populate an array with the numerical values of the items.
    const numericalItems = [];
    for(let index = 0; index < itemCount; index++) {
        numericalItems.push(inputReader.fetchNextParsedValue());
    }

    // It's essential to sort the items in ascending order for the algorithm's correctness.
    numericalItems.sort((valueA, valueB) => valueA - valueB);

    // Precompute factorials up to 'itemCount' using dynamic programming.
    // All results are kept within the modulo range to prevent overflow.
    const precomputedFactorialCache = [1, 1]; // 0! = 1, 1! = 1
    for(let k = 2; k <= itemCount; k++) {
        precomputedFactorialCache[k] = (precomputedFactorialCache[k - 1] * k) % MODULO_NUM;
    }

    // The recursive core function to determine the number of distinct paths/combinations.
    // `currentRemainder` represents the amount remaining to be processed.
    // `itemUsageMask` is a string (e.g., "01001") indicating which items have been selected ('1')
    // or are still available ('0') in the current combinatorial path.
    function calculateCombinatorialPaths(currentRemainder, itemUsageMask) {
        // Guard against invalid or negative remainders.
        if (currentRemainder < 0) {
            return 0;
        }
        // Validate the integrity of the usage mask length.
        if (itemUsageMask.length !== itemCount) {
            console.warn(`Internal error: Item usage mask length mismatch. Expected ${itemCount}, got ${itemUsageMask.length}.`);
            return 0;
        }

        // Base case: If the current remainder is smaller than the smallest available item,
        // no further subtractions are possible. The result depends on the
        // number of items that have not yet been "used" in this path.
        if (currentRemainder < numericalItems[0]) {
            // Count how many items are still marked as '0' (unused).
            const countOfUnusedItems = itemUsageMask.split('').reduce((counter, char) => counter + (char === '0' ? 1 : 0), 0);
            // The result is the current remainder multiplied by the factorial of these unused items.
            // This is because the order of the remaining unused items does not affect the remainder.
            return (currentRemainder * precomputedFactorialCache[countOfUnusedItems]) % MODULO_NUM;
        }

        let firstCandidateIndex = 0;
        // Identify the first item value that is greater than or equal to the `currentRemainder`.
        // All items before this index are smaller and thus potential divisors/subtractors.
        while(firstCandidateIndex < itemCount && numericalItems[firstCandidateIndex] < currentRemainder) {
            firstCandidateIndex++;
        }

        let totalAccumulatedPaths = 0;
        // Iterate through all items that are smaller than `currentRemainder`.
        for (let idx = 0; idx < firstCandidateIndex; idx++) {
            // Only consider items that have not yet been marked as 'used' in this path.
            if (itemUsageMask[idx] === "0") {
                // Construct a new usage mask by marking the current item as 'used'.
                // Using `Array.from` for a clear array conversion before modification.
                const nextMaskArray = Array.from(itemUsageMask);
                nextMaskArray[idx] = "1";
                const updatedMaskString = nextMaskArray.join("");
                
                // Recursively call the function with the new remainder (currentRemainder % numericalItems[idx])
                // and the updated usage mask.
                totalAccumulatedPaths = (totalAccumulatedPaths + calculateCombinatorialPaths(currentRemainder % numericalItems[idx], updatedMaskString)) % MODULO_NUM;
            }
        }
        return totalAccumulatedPaths;
    }

    // Initialize the calculation: Start with the target value and a mask where all items are unused.
    const initialItemMask = "0".repeat(itemCount);
    const finalCalculatedResult = calculateCombinatorialPaths(targetValue, initialItemMask);

    // Output the final count of combinatorial paths.
    console.log(finalCalculatedResult);
}

// Read the entire standard input as a UTF-8 string and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
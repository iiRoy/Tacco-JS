// This Immediately Invoked Function Expression (IIFE) encapsulates the input parsing logic
// and returns a factory function to create parser instances.
var INPUT_PARSER_FACTORY = (function() {
    /**
     * Serves as the primary factory function to instantiate a new InputDataParser.
     * @param {string} rawInputContent - The entire input content as a single string.
     * @returns {InputDataParser} A fresh instance of the data parser.
     */
    function createParser(rawInputContent) {
        return new InputDataParser(rawInputContent);
    }

    /**
     * The constructor for the InputDataParser class.
     * It prepares the input string for sequential reading.
     * @param {string} initialContent - The raw string data provided for parsing.
     */
    function InputDataParser(initialContent) {
        // Internal storage for all input lines, trimmed and split by newline characters.
        this._sourceLines = initialContent.trim().split("\n");
        // Keeps track of the current line index being processed within _sourceLines.
        this._currentLineIndex = 0;
    }

    /**
     * Extracts and returns the next available token from the current input line.
     * Automatically advances to the next line if the current one is fully consumed.
     * @param {boolean} [returnAsString=false] - If true, the token is returned as a string; otherwise, it's converted to a number.
     * @returns {string|number} The parsed token.
     */
    InputDataParser.prototype.readNextToken = function(returnAsString) {
        var lineCollection = this._sourceLines;
        var currentPosition = this._currentLineIndex;
        var retrievedToken;

        // If the current line is still a raw string, split it into tokens and reverse for efficient `pop()`.
        if (typeof lineCollection[currentPosition] === "string") {
            lineCollection[currentPosition] = lineCollection[currentPosition].split(" ").reverse();
        }

        // Retrieve the last element, which is the next token in original order.
        retrievedToken = lineCollection[currentPosition].pop();

        // If the current line's token array is now empty, increment the line index.
        if (!lineCollection[currentPosition].length) {
            this._currentLineIndex++;
        }

        // Return the token, optionally converting it to a number.
        return returnAsString ? retrievedToken : +retrievedToken;
    };

    /**
     * Reads an entire line from the input, splits it into tokens, and advances the line pointer.
     * @param {boolean} [returnAsStrings=false] - If true, tokens are returned as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array containing all tokens from the read line.
     */
    InputDataParser.prototype.readLineTokens = function(returnAsStrings) {
        // Fetch the current line, split it by spaces, and then move to the next line.
        var tokensFromLine = this._sourceLines[this._currentLineIndex++].split(" ");
        // Return the tokens, mapping them to numbers if not requested as strings.
        return returnAsStrings ? tokensFromLine : tokensFromLine.map(valueElement => +valueElement);
    };

    /**
     * Reads a specified number of lines, treating each as a row in a matrix, and tokenizes them.
     * Advances the line pointer by the number of rows read.
     * @param {number} numberOfLines - The count of lines to read as matrix rows.
     * @param {boolean} [returnAsStrings=false] - If true, all matrix elements are strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    InputDataParser.prototype.readMatrix = function(numberOfLines, returnAsStrings) {
        // Extract a slice of lines, then map each line to an array of its tokens.
        var matrixRowsData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numberOfLines).map(lineContent => lineContent.split(" "));
        // Conditionally convert all elements within the matrix to numbers.
        return returnAsStrings ? matrixRowsData : matrixRowsData.map(rowArray => rowArray.map(valueElement => +valueElement));
    };

    /**
     * Reads a specified number of raw lines without splitting them into tokens.
     * Advances the line pointer by the number of lines read.
     * @param {number} numberOfLines - The count of raw lines to retrieve.
     * @param {boolean} [returnAsStrings=false] - If true, lines are returned as strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of the raw lines.
     */
    InputDataParser.prototype.readRawLines = function(numberOfLines, returnAsStrings) {
        // Obtain a slice of the source lines.
        var rawLineArray = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numberOfLines);
        // Return the lines, mapping them to numbers if not requested as strings.
        return returnAsStrings ? rawLineArray : rawLineArray.map(valueElement => +valueElement);
    };

    return createParser; // The IIFE returns the factory function.
})();

// Instantiate the data processor by reading the entire content of standard input.
var dataProcessor = INPUT_PARSER_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main problem-solving function and print its return value to the console.
console.log(solveProblem());

/**
 * This is the core function that implements the problem's logic.
 * It reads specific input values, performs calculations, and determines the final answer.
 * @returns {number} The computed result based on the input data.
 */
function solveProblem() {
    // Read the first two integer values from the input:
    // numItems represents 'n', the total number of items.
    // numCategories represents 'm', the total number of distinct categories.
    var numItems = dataProcessor.readNextToken();
    var numCategories = dataProcessor.readNextToken();

    // Initialize an array to keep track of how many times each category is chosen.
    // The array size is 'numCategories', and all counts start at zero.
    var categoryCounts = Array(numCategories).fill(0);
    var finalResult = 0; // This variable will store the final count of categories chosen by all items.

    // Iterate through each of the 'numItems'.
    for (var itemIndex = 0; itemIndex < numItems; itemIndex++) {
        // Read the current line, which contains the preferences for the current item.
        // The first element (currentLineTokens[0]) indicates how many preferences follow.
        var currentLineTokens = dataProcessor.readLineTokens();

        // Loop through the actual preferences for the current item.
        // The loop starts from index 1 because index 0 holds the count of preferences.
        for (var preferenceIndex = 1; preferenceIndex <= currentLineTokens[0]; preferenceIndex++) {
            // Increment the counter for the specific category chosen by this item.
            // Note: currentLineTokens[preferenceIndex] is 1-based, so we subtract 1 for 0-based array indexing.
            categoryCounts[currentLineTokens[preferenceIndex] - 1]++;
        }
    }

    // After processing all items, iterate through the category counts.
    // Determine how many categories were chosen by *all* 'numItems'.
    for (itemIndex = 0; itemIndex < numCategories; itemIndex++) {
        // If a category's count matches the total number of items, it means every item chose it.
        if (categoryCounts[itemIndex] === numItems) {
            finalResult++; // Increment the final result counter.
        }
    }

    return finalResult; // Return the total count of categories that satisfy the condition.
}

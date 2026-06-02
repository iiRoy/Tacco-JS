var InputReader = (function() {
    // Internal function to create a new reader instance
    function createReader(sourceText) {
        return new ReaderInstance(sourceText);
    }

    // Constructor for the ReaderInstance object
    function ReaderInstance(rawInput) {
        // Store input lines, trimmed and split by newline
        this._sourceLines = rawInput.trim().split("\n");
        // Initialize current line index
        this._currentLineIndex = 0;
    }

    // Prototype method to read a single token
    ReaderInstance.prototype.readToken = function(returnAsString) {
        var lines = this._sourceLines;
        var currentLinePos = this._currentLineIndex;
        var tokenValue;

        // If the current line is still a string, split it into tokens and reverse
        // Reversing allows using pop() to get tokens in original order
        if (typeof lines[currentLinePos] === "string") {
            lines[currentLinePos] = lines[currentLinePos].split(" ").reverse();
        }

        // Extract the next token
        tokenValue = lines[currentLinePos].pop();

        // If the current line is now empty, advance to the next line
        if (!lines[currentLinePos].length) {
            this._currentLineIndex++;
        }

        // Return token as string or number based on flag
        return returnAsString ? tokenValue : +tokenValue;
    };

    // Prototype method to read an entire line of tokens
    ReaderInstance.prototype.readLine = function(returnAsStrings) {
        // Get the current line, split by space, and advance the line index
        var lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
        // Return tokens as strings or map them to numbers
        return returnAsStrings ? lineTokens : lineTokens.map(item => +item);
    };

    // Prototype method to read a matrix (multiple lines, each split into tokens)
    ReaderInstance.prototype.readMatrix = function(numberOfRows, returnAsStrings) {
        // Slice the required number of lines and advance the index
        var rawMatrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numberOfRows);
        // Split each row into tokens
        var processedMatrix = rawMatrixRows.map(rowStr => rowStr.split(" "));
        // Return as strings or map all inner tokens to numbers
        return returnAsStrings ? processedMatrix : processedMatrix.map(rowArr => rowArr.map(tokenStr => +tokenStr));
    };

    // Prototype method to read a specified number of raw lines
    ReaderInstance.prototype.readRawLines = function(count, returnAsStrings) {
        // Slice the required number of lines and advance the index
        var linesToRead = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
        // Return as strings or map each line to a number
        return returnAsStrings ? linesToRead : linesToRead.map(lineStr => +lineStr);
    };

    return createReader;
})();

// Initialize the input data reader by reading from standard input
var inputData = InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments.
 * Example: multiDimArray(0, 2, 3) creates a 2x3 array filled with 0s.
 */
function multiDimArray(initialValue) {
    var dimensions = arguments;
    var dimCount = dimensions.length;
    // Construct the string for the innermost array creation
    var arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    // Wrap with outer array creations for each remaining dimension
    while (--dimCount) {
        arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    // Evaluate the dynamically constructed string to create the array
    return eval(arrayCreationString);
}

// Call the main problem-solving function and print its result
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * It reads a string and determines the minimum of the maximum consecutive
 * non-matching character counts for each character 'a' through 'z'.
 *
 * For each character (e.g., 'a'), it iterates through the input string
 * and finds the longest sequence of characters that are *not* 'a'.
 * It then takes the minimum of these "longest non-matching sequences"
 * across all 26 possible characters.
 */
function solveProblem() {
    // Read the single input string from the reader
    var inputString = inputData.readToken(true);
    // Get the total length of the input string
    var stringLength = inputString.length;
    // Initialize the answer with the string length (a safe upper bound)
    var minMaxConsecutive = stringLength;

    // Loop through all 26 lowercase English alphabet characters (0 for 'a' to 25 for 'z')
    for (var charIndex = 0; charIndex < 26; charIndex++) {
        // Tracks the maximum consecutive count of non-matching characters for the current 'charIndex'
        var currentMaxConsecutive = 0;
        // Tracks the current consecutive count of non-matching characters
        var consecutiveCount = 0;

        // Iterate through each character in the input string
        for (var stringCharIndex = 0; stringCharIndex < stringLength; stringCharIndex++) {
            // Check if the current string character matches the character being tested (charIndex)
            // charCodeAt(0) - 97 converts 'a' to 0, 'b' to 1, etc.
            if (inputString[stringCharIndex].charCodeAt(0) - 97 === charIndex) {
                // If a match is found, the sequence of non-matching characters is broken.
                // Update currentMaxConsecutive if the current sequence was longer.
                if (consecutiveCount > currentMaxConsecutive) {
                    currentMaxConsecutive = consecutiveCount;
                }
                // Reset the consecutive count as a match occurred.
                consecutiveCount = 0;
            } else {
                // If no match, increment the consecutive count.
                consecutiveCount++;
            }
        }

        // After the loop, there might be a final sequence of non-matching characters
        // at the end of the string. Update currentMaxConsecutive one last time.
        if (consecutiveCount > currentMaxConsecutive) {
            currentMaxConsecutive = consecutiveCount;
        }

        // Update the overall minimum maximum consecutive count.
        // We are looking for the smallest 'currentMaxConsecutive' found across all characters.
        if (currentMaxConsecutive < minMaxConsecutive) {
            minMaxConsecutive = currentMaxConsecutive;
        }
    }
    // Return the final calculated minimum maximum consecutive count.
    return minMaxConsecutive;
}

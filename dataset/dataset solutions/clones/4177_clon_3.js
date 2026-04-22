var InputProcessor = (function() {
    /**
     * Factory function to create an InputSourceHandler instance.
     * This function serves as the public interface for the InputProcessor module.
     * @param {string} rawInputString - The complete input as a single string.
     * @returns {InputSourceHandler} An instance capable of parsing the input.
     */
    function createInputReader(rawInputString) {
        // Basic validation for the initial input string.
        // If the input is not a string or is empty, a warning is issued,
        // and an empty string is used to prevent subsequent errors.
        if (typeof rawInputString !== 'string' || rawInputString.length === 0) {
            console.warn("InputProcessor: Received empty or invalid input string. Proceeding with empty data.");
            rawInputString = ""; 
        }
        return new InputSourceHandler(rawInputString);
    }

    /**
     * The core class responsible for managing and parsing lines from the input source.
     * It maintains the current position within the input and provides methods to extract data.
     * @param {string} initialDataString - The raw string containing all input lines.
     */
    function InputSourceHandler(initialDataString) {
        // Normalize newlines (e.g., from Windows \r\n to Unix \n) and split into an array of lines.
        this.currentSourceLines = initialDataString.replace(/\r\n/g, '\n').split("\n");
        
        // Remove a potential trailing empty line if the input ends with a newline character.
        if (this.currentSourceLines.length > 0 && this.currentSourceLines[this.currentSourceLines.length - 1] === '') {
            this.currentSourceLines.pop();
        }
        
        this.lineIndex = 0; // Tracks the current line number being processed (0-based).
        
        // A cache to store tokenized lines (split by space) to avoid re-splitting operations.
        this._tokenizedLineCache = new Map();
    }

    /**
     * Internal helper to retrieve or create an array of tokens for a given line number.
     * Tokens are individual words/numbers separated by spaces.
     * @param {number} lineNum - The 0-based index of the line to tokenize.
     * @returns {Array<string>} An array of string tokens for the specified line.
     */
    InputSourceHandler.prototype._getLineTokens = function(lineNum) {
        // Return from cache if already processed.
        if (this._tokenizedLineCache.has(lineNum)) {
            return this._tokenizedLineCache.get(lineNum);
        }
        
        const lineContent = this.currentSourceLines[lineNum];
        // Split the line by space, filtering out any empty strings that might result
        // from multiple spaces or leading/trailing spaces.
        const tokens = lineContent ? lineContent.split(" ").filter(t => t !== '') : [];
        
        // Store the tokenized array in the cache.
        this._tokenizedLineCache.set(lineNum, tokens);
        return tokens;
    };

    /**
     * Reads and extracts a single token (value) from the current line.
     * If the current line is exhausted, it attempts to advance to the next non-empty line.
     * @param {boolean} returnAsString - If true, the token is returned as a string; otherwise, it's converted to a number.
     * @returns {string|number|null} The extracted token, or null if no more input is available.
     */
    InputSourceHandler.prototype.readSingleValue = function(returnAsString) {
        // Check if we've processed all available lines.
        if (this.lineIndex >= this.currentSourceLines.length) {
            return null; // No more lines to read.
        }

        let currentLineTokens = this._getLineTokens(this.lineIndex);

        // Advance lineIndex past any completely empty lines until a line with tokens is found
        // or all lines are exhausted.
        while (currentLineTokens.length === 0 && this.lineIndex < this.currentSourceLines.length - 1) {
            this.lineIndex++;
            currentLineTokens = this._getLineTokens(this.lineIndex);
        }

        // If after advancing, there are still no tokens, it means the remaining input is empty.
        if (currentLineTokens.length === 0) {
            return null;
        }

        // Extract the first token from the array (destructive operation).
        const extractedToken = currentLineTokens.shift();
        // Update the cache with the modified (shorter) token array for the current line.
        this._tokenizedLineCache.set(this.lineIndex, currentLineTokens); 

        // If the current line is now empty after extraction, advance to the next line for future calls.
        if (currentLineTokens.length === 0) {
            this.lineIndex++;
        }

        // Return the token, either as a string or converted to a number.
        return returnAsString ? extractedToken : Number(extractedToken);
    };

    /**
     * Reads all tokens from the current line, then automatically advances the line index.
     * @param {boolean} returnAsString - If true, returns tokens as strings; otherwise, attempts conversion to numbers.
     * @returns {Array<string|number>|null} An array of tokens from the line, or null if no more lines.
     */
    InputSourceHandler.prototype.readNextLineValues = function(returnAsString) {
        // Check for end of input.
        if (this.lineIndex >= this.currentSourceLines.length) {
            return null;
        }

        // Get tokens for the current line.
        const lineTokens = this._getLineTokens(this.lineIndex);
        this.lineIndex++; // Always advance line index after consuming a full line.

        // Return tokens, with optional number conversion.
        return returnAsString ? lineTokens : lineTokens.map(token => Number(token));
    };

    /**
     * Reads a specified number of lines, processing each into an array of tokens.
     * This is useful for reading matrices or blocks of structured data.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} returnAsString - If true, returns tokens as strings; otherwise, attempts conversion to numbers.
     * @returns {Array<Array<string|number>>} A 2D array where each inner array represents a line's tokens.
     */
    InputSourceHandler.prototype.readMatrixData = function(numLines, returnAsString) {
        const collectedRows = [];
        // Calculate the target line index, ensuring it doesn't exceed the total number of lines.
        const finalLineIndex = Math.min(this.lineIndex + numLines, this.currentSourceLines.length);

        // Iterate and collect lines until 'numLines' are read or input ends.
        while (this.lineIndex < finalLineIndex) {
            const currentLineTokens = this._getLineTokens(this.lineIndex);
            collectedRows.push(returnAsString ? currentLineTokens : currentLineTokens.map(token => Number(token)));
            this.lineIndex++; // Advance line index for each line read.
        }
        return collectedRows;
    };

    /**
     * Reads a specified number of lines as raw strings.
     * Optional conversion to number is provided, assuming each line might contain a single numeric value.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} returnAsString - If true, returns lines as strings; otherwise, attempts conversion to numbers.
     * @returns {Array<string|number>} An array of raw line contents.
     */
    InputSourceHandler.prototype.readRawLines = function(numLines, returnAsString) {
        const extractedLines = [];
        const finalLineIndex = Math.min(this.lineIndex + numLines, this.currentSourceLines.length);

        // Iterate and collect raw line content.
        for (let i = this.lineIndex; i < finalLineIndex; i++) {
            const lineContent = this.currentSourceLines[i];
            extractedLines.push(returnAsString ? lineContent : Number(lineContent)); 
        }
        this.lineIndex = finalLineIndex; // Update line index after reading the block.
        return extractedLines;
    };

    return createInputReader;
})();

// --- Main application logic ---

// Instantiate the input parser by reading from standard input.
// This assumes an environment where 'fs' and '/dev/stdin' are available (e.g., Node.js).
var dataParser = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main transformation function and print its result to console.
console.log(performTransformation());

/**
 * Orchestrates the main logic of the program:
 * 1. Reads input array and its length.
 * 2. Finds the element with the maximum absolute value.
 * 3. Generates a sequence of transformation steps based on the sign of this element.
 * 4. Returns the total number of operations followed by the operations themselves.
 * @returns {string} The formatted output string containing operation count and steps.
 */
function performTransformation() {
    // Read the array length (N) from the first value in the input stream.
    const arrayLength = dataParser.readSingleValue();
    
    // Validate the array length. It must be a positive number.
    if (arrayLength === null || isNaN(arrayLength) || arrayLength <= 0) {
        return "Error: Invalid or non-positive array length provided. Expected N > 0.";
    }

    // Read the array elements from the next line of input.
    const inputArray = dataParser.readNextLineValues();
    
    // Validate that the number of elements read matches the declared arrayLength.
    if (inputArray === null || inputArray.length !== arrayLength) {
        return `Error: Input array size mismatch. Declared length: ${arrayLength}, Actual elements: ${inputArray ? inputArray.length : 0}.`;
    }

    let extremeValue = 0; // Holds the number with the largest absolute magnitude.
    let extremeValueIndex = -1; // Stores the 1-based index of the extremeValue.

    // Iterate through the input array to find the element with the maximum absolute value.
    // Using forEach for a functional style of iteration.
    inputArray.forEach((element, idx) => {
        // Compare absolute values to find the "most extreme" number.
        if (Math.abs(extremeValue) < Math.abs(element)) {
            extremeValue = element;
            extremeValueIndex = idx + 1; // Store 1-based index as required by output format.
        }
    });

    // Special handling for the case where all elements in the array are zero.
    // In this scenario, no transformations are necessary.
    if (extremeValue === 0) {
        return "0\n0"; // Output 0 operations and 0 as the result.
    }

    const transformationSteps = []; // An array to collect all generated transformation operation strings.

    /**
     * Helper function to add a pair of transformation operations to the list.
     * This simplifies the repetitive `push` calls in the main logic.
     * @param {string} op1 - The first operation string.
     * @param {string} op2 - The second operation string.
     */
    const addOperationPair = (op1, op2) => {
        transformationSteps.push(op1);
        transformationSteps.push(op2);
    };

    // The core transformation strategy depends on the sign of the 'extremeValue'.
    if (extremeValue < 0) {
        // Scenario 1: The extreme value is negative.
        // The goal is to make all numbers negative or zero.
        // First, apply operations to the element at `extremeValueIndex` twice,
        // targeting the first element (index 1). This effectively sets up the first element
        // to be a pivot for making other numbers negative.
        addOperationPair(`${extremeValueIndex} 1`, `${extremeValueIndex} 1`);

        // Now, iterate through the entire array to adjust other elements.
        // A traditional for loop is used here for variety.
        for (let currentIdx = 0; currentIdx < arrayLength; currentIdx++) {
            // Skip the element that was already used as the 'extremeValue' to avoid redundant operations.
            if (currentIdx + 1 === extremeValueIndex) {
                continue; 
            }
            
            const currentValue = inputArray[currentIdx];
            if (currentValue > 0) {
                // If a positive number is found, make it negative by adding the first element to it,
                // then adding the first element to itself (effectively multiplying by 2).
                addOperationPair(`1 ${currentIdx + 1}`, `1 1`);
            } else {
                // If a negative or zero number is found, ensure it's still consistent with the negative
                // transformation by adding the first element to itself, then to the current element.
                addOperationPair(`1 1`, `1 ${currentIdx + 1}`);
            }
        }
    } else { // extremeValue > 0
        // Scenario 2: The extreme value is positive.
        // The goal is to make all numbers positive or zero.
        // Similar to the negative case, apply operations to the element at `extremeValueIndex` twice,
        // but this time targeting the last element (index 'arrayLength'). This makes the last element
        // a pivot for positive transformations.
        addOperationPair(`${extremeValueIndex} ${arrayLength}`, `${extremeValueIndex} ${arrayLength}`);

        // Iterate through the array to adjust other elements.
        // A for-of loop is used here to demonstrate another iteration pattern.
        let elementCounter = 0; // Manually track index for for-of loop.
        for (const elementValue of inputArray) {
            const currentIdx = elementCounter; // 0-based index.
            elementCounter++;

            // Skip the element that was already used as the 'extremeValue'.
            if (currentIdx + 1 === extremeValueIndex) {
                continue; 
            }

            if (elementValue < 0) {
                // If a negative number is found, make it positive by adding the last element to itself,
                // then adding the last element to the current negative element.
                addOperationPair(`${arrayLength} ${arrayLength}`, `${arrayLength} ${currentIdx + 1}`);
            } else {
                // If a positive or zero number is found, ensure consistency with the positive transformation
                // by adding the last element to the current element, then to itself.
                addOperationPair(`${arrayLength} ${currentIdx + 1}`, `${arrayLength} ${arrayLength}`);
            }
        }
    }

    // The total number of operations generated is always 2 * arrayLength.
    // This count is prepended to the list of transformation steps, separated by a newline.
    const totalOperationsCount = 2 * arrayLength;
    return `${totalOperationsCount}\n${transformationSteps.join("\n")}`;
}
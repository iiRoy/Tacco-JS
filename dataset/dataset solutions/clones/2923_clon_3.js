const InputReaderFactory = (function() {
    // Utility class responsible for parsing input lines and tokens.
    // Manages the current position within the input data.
    function LineParser(rawInputString) {
        // Stores all input lines, initially as strings. Some methods might
        // convert a line to an array of tokens in place for efficiency.
        this.sourceLines = rawInputString.trim().split("\n");
        // Tracks the index of the current line being processed.
        this.currentLineIndex = 0;
    }

    // A simple helper to parse a line into tokens if it hasn't been already.
    // Returns true if tokens are available or line was processed, false if no more lines.
    LineParser.prototype._ensureLineTokens = function() {
        if (this.currentLineIndex >= this.sourceLines.length) {
            return false; // No more lines left in the input stream.
        }
        let currentLineContent = this.sourceLines[this.currentLineIndex];
        // If the current line is still a string, split it into tokens.
        if (typeof currentLineContent === 'string') {
            // Using split(/\s+/) handles multiple spaces and leading/trailing spaces robustly.
            // filter(Boolean) removes any empty strings that might result from splitting (e.g., " ").
            this.sourceLines[this.currentLineIndex] = currentLineContent.trim().split(/\s+/).filter(Boolean);
        }
        return true;
    };

    // Reads and returns a single token from the current line.
    // Advances to the next line if the current one becomes exhausted.
    LineParser.prototype.extractToken = function(returnAsString = false) {
        // Guard: Check if there are any lines left to process.
        if (!this._ensureLineTokens()) {
            console.warn("Input stream exhausted when attempting to extract token. Returning default.");
            return returnAsString ? "" : NaN;
        }

        let tokensOnCurrentLine = this.sourceLines[this.currentLineIndex];

        // Skip empty lines until a line with tokens is found or stream is exhausted.
        while (tokensOnCurrentLine.length === 0 && this.currentLineIndex + 1 < this.sourceLines.length) {
            this.currentLineIndex++;
            if (!this._ensureLineTokens()) {
                console.warn("Input stream exhausted after skipping empty lines. Returning default.");
                return returnAsString ? "" : NaN;
            }
            tokensOnCurrentLine = this.sourceLines[this.currentLineIndex];
        }

        // Final check if tokens are available after skipping empty lines.
        if (tokensOnCurrentLine.length === 0) {
            console.warn("No tokens found on current or subsequent lines. Returning default.");
            return returnAsString ? "" : NaN;
        }

        // Retrieve the first token from the line (left-to-right reading).
        const acquiredToken = tokensOnCurrentLine.shift();

        // If the current line is now empty, increment the line index for future operations.
        if (tokensOnCurrentLine.length === 0) {
            this.currentLineIndex++;
        }

        // Return the token, converting it to a number unless explicitly requested as a string.
        return returnAsString ? acquiredToken : Number(acquiredToken);
    };

    // Reads an entire line, splits it into tokens, and returns them as an array.
    // Automatically advances to the next line.
    LineParser.prototype.fetchLineTokens = function(returnAsStrings = false) {
        // Guard: Check for out-of-bounds access.
        if (this.currentLineIndex >= this.sourceLines.length) {
            console.warn("Attempted to read line beyond input stream. Returning empty array.");
            return [];
        }

        // Retrieve the raw line data and advance the line index.
        const lineContent = this.sourceLines[this.currentLineIndex++];
        let tokens;

        // If the line content is already an array (meaning it was processed by extractToken), use it directly.
        // Otherwise, split the string into tokens.
        if (Array.isArray(lineContent)) {
            tokens = lineContent;
        } else {
            tokens = lineContent.trim().split(/\s+/).filter(Boolean);
        }

        // Convert tokens to numbers if not requested as strings.
        return returnAsStrings ? tokens : tokens.map(tokenVal => Number(tokenVal));
    };

    // Retrieves a specified number of lines, processing each into an array of tokens (matrix).
    // Advances the line index by the number of lines read.
    LineParser.prototype.retrieveMatrix = function(lineCount, returnAsStrings = false) {
        // Guard: Validate input lineCount.
        if (lineCount <= 0) {
            console.warn("Requested matrix line count must be positive. Returning empty array.");
            return [];
        }
        // Guard: Adjust lineCount if it exceeds available lines.
        if (this.currentLineIndex + lineCount > this.sourceLines.length) {
            console.error(`Requested ${lineCount} lines but only ${this.sourceLines.length - this.currentLineIndex} remain. Adjusting read count.`);
            lineCount = this.sourceLines.length - this.currentLineIndex;
        }

        // Slice the relevant lines from the source and update the current line index.
        const linesToProcess = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + lineCount);
        this.currentLineIndex += lineCount;

        // Process each line into an array of tokens.
        const processedMatrix = linesToProcess.map(lineData => {
            let tokens;
            if (Array.isArray(lineData)) {
                tokens = lineData;
            } else {
                tokens = lineData.trim().split(/\s+/).filter(Boolean);
            }
            return returnAsStrings ? tokens : tokens.map(tokenVal => Number(tokenVal));
        });

        return processedMatrix;
    };

    // Acquires a specified number of lines as raw content (strings or numbers), without splitting into tokens.
    // Advances the line index.
    LineParser.prototype.acquireRawLines = function(lineCount, returnAsStrings = false) {
        // Guard: Validate input lineCount.
        if (lineCount <= 0) {
            console.warn("Requested raw line count must be positive. Returning empty array.");
            return [];
        }
        // Guard: Adjust lineCount if it exceeds available lines.
        if (this.currentLineIndex + lineCount > this.sourceLines.length) {
            console.error(`Requested ${lineCount} raw lines but only ${this.sourceLines.length - this.currentLineIndex} remain. Adjusting read count.`);
            lineCount = this.sourceLines.length - this.currentLineIndex;
        }

        const rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + lineCount);
        this.currentLineIndex += lineCount;

        // Map each line content. If a line was previously tokenized (stored as an array),
        // join its elements to form a string representation before converting to number if needed.
        const finalLines = rawLines.map(lineItem => {
            let content = lineItem;
            if (Array.isArray(lineItem)) {
                // If it was tokenized, join it back to a string for 'raw' output.
                content = lineItem.join(' ');
            }
            return returnAsStrings ? content : Number(content);
        });

        return finalLines;
    };

    // Factory function to create an instance of LineParser.
    function createReader(inputSource) {
        return new LineParser(inputSource);
    }

    return { createReader };
})();

// Initialize the input processing utility.
// Adding a try-catch block for robust file reading (Type III addition).
let inputContent;
try {
    inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
} catch (error) {
    console.error("Failed to read input from /dev/stdin:", error.message);
    // Fallback to an empty string to allow the program to run without crashing,
    // though subsequent reads might yield NaNs or empty arrays.
    inputContent = "";
}
const dataStreamProcessor = InputReaderFactory.createReader(inputContent);

// Implements the core logic to find the maximum sum based on specific traversal rules.
function computeMaximumSum() {
    // Read the total number of elements (N) from the input stream.
    // Added a guard for invalid N (Type III addition).
    let totalElements = dataStreamProcessor.extractToken();
    if (typeof totalElements !== 'number' || isNaN(totalElements) || totalElements < 1) {
        console.error("Invalid number of elements received:", totalElements);
        return 0; // Return a default value for safety.
    }

    // Read the sequence of values (array S) from the input stream.
    const valueSequence = dataStreamProcessor.fetchLineTokens();
    // Validate the length of the sequence against `totalElements` (Type III addition).
    if (valueSequence.length !== totalElements) {
        console.warn(`Expected ${totalElements} values but received ${valueSequence.length}. Adjusting totalElements.`);
        // Adjust `totalElements` to match the actual number of values read, for robustness.
        totalElements = Math.min(totalElements, valueSequence.length);
    }
    // A guard for insufficient data to form pairs.
    if (totalElements < 2) {
        return 0;
    }

    // Initialize the variable to store the highest sum encountered.
    let peakSum = 0;

    // Calculate the midpoint for loop termination.
    // Using Math.floor for clarity over the bitwise operator (Type II/III update).
    const halfPoint = Math.floor(totalElements / 2);

    // Outer loop: iterates through possible step sizes, starting from 1 up to (N/2 - 1).
    for (let stepSize = 1; stepSize < halfPoint; stepSize++) {
        // A Set to keep track of indices visited within the current 'stepSize' iteration.
        // This prevents double-counting or processing elements that are part of a cycle.
        const encounteredIndices = new Set();
        // Accumulator for the sum of values for the current 'stepSize'.
        let currentIterationSum = 0;

        // Inner loop: traverses the sequence using the current 'stepSize'.
        // 'currentOffset' starts at 'stepSize' and increments by 'stepSize'.
        for (let currentOffset = stepSize; currentOffset < totalElements; currentOffset += stepSize) {
            // Calculate the symmetric index relative to the end of the sequence.
            const symmetricOffset = totalElements - currentOffset - 1;

            // Check for conditions that necessitate breaking the inner loop:
            // 1. If either 'currentOffset' or 'symmetricOffset' has already been processed in this 'stepSize' iteration.
            // 2. If 'currentOffset' and 'symmetricOffset' refer to the same element, implying it's a middle element
            //    in an odd-length array, which doesn't form a pair with a distinct symmetric element.
            const isMiddleElement = (currentOffset === symmetricOffset);
            const isAlreadyVisited = encounteredIndices.has(currentOffset) || encounteredIndices.has(symmetricOffset);

            if (isAlreadyVisited || isMiddleElement) {
                // If any of these conditions are met, we stop processing for the current 'stepSize'.
                break;
            }

            // Added a check for valid indices to prevent runtime errors (Type III addition).
            if (currentOffset >= valueSequence.length || symmetricOffset >= valueSequence.length || currentOffset < 0 || symmetricOffset < 0) {
                console.warn(`Index out of bounds detected: currentOffset=${currentOffset}, symmetricOffset=${symmetricOffset} for totalElements=${totalElements}, valueSequence.length=${valueSequence.length}. Breaking inner loop.`);
                break;
            }

            // Add the values from the current and symmetric positions to the iteration sum.
            currentIterationSum += valueSequence[currentOffset] + valueSequence[symmetricOffset];

            // Update the overall maximum sum found so far.
            // Using Math.max for clearer intent (Type II/III update).
            peakSum = Math.max(peakSum, currentIterationSum);

            // Mark both current and symmetric indices as visited for this 'stepSize' iteration.
            encounteredIndices.add(currentOffset);
            encounteredIndices.add(symmetricOffset);
        }
    }

    // Return the final maximum sum found.
    return peakSum;
}

// Helper function to handle the output (Type III addition).
const outputResult = (finalValue) => {
    // A simple validation: ensure the result is a valid number.
    if (typeof finalValue !== 'number' || isNaN(finalValue)) {
        console.error("Algorithm returned an invalid result:", finalValue);
        // Exit with an error code if the result is invalid.
        process.exit(1);
    }
    console.log(finalValue);
};

// Execute the primary algorithm and output its result.
outputResult(computeMaximumSum());
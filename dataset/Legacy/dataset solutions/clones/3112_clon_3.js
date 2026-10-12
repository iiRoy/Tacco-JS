const InputParser = (function() {
    // Helper function to convert an array of strings to an array of numbers
    const convertToNumbers = (strArray) => {
        return strArray.map(val => +val);
    };

    class ParserInstance {
        constructor(inputString) {
            this.inputLines = inputString.trim().split("\n");
            this.currentLineIndex = 0;
            // Stores tokens for the current line, reversed to allow efficient pop() from the "right"
            this.currentLineTokens = [];
        }

        // Reads a single value from the current line (right to left)
        readSingleValue(returnAsString) {
            // If current line tokens are exhausted or we're on a new line
            if (this.currentLineTokens.length === 0) {
                if (this.currentLineIndex >= this.inputLines.length) {
                    // No more lines to read, return undefined or handle as an error
                    return undefined;
                }
                // Split the current line and reverse it to enable pop() from the "right"
                this.currentLineTokens = this.inputLines[this.currentLineIndex].split(" ").reverse();
            }

            const extractedValue = this.currentLineTokens.pop();

            // If all tokens from the current line have been consumed, advance to the next line
            if (this.currentLineTokens.length === 0) {
                this.currentLineIndex++;
            }

            return returnAsString ? extractedValue : +extractedValue;
        }

        // Reads an entire line of values
        readLineValues(returnAsString) {
            if (this.currentLineIndex >= this.inputLines.length) {
                return []; // No more lines to read
            }
            const lineContent = this.inputLines[this.currentLineIndex++];
            const values = lineContent.split(" ");
            return returnAsString ? values : convertToNumbers(values);
        }

        // Reads 'count' lines as a matrix (array of arrays)
        readMatrix(count, returnAsString) {
            const matrixRows = [];
            for (let i = 0; i < count; i++) {
                if (this.currentLineIndex >= this.inputLines.length) {
                    break; // Not enough lines available
                }
                const rowContent = this.inputLines[this.currentLineIndex++];
                const rowValues = rowContent.split(" ");
                matrixRows.push(returnAsString ? rowValues : convertToNumbers(rowValues));
            }
            return matrixRows;
        }

        // Reads 'count' raw lines (either as strings or numbers)
        readRawLines(count, returnAsString) {
            const rawLines = [];
            for (let i = 0; i < count; i++) {
                if (this.currentLineIndex >= this.inputLines.length) {
                    break; // Not enough lines available
                }
                const line = this.inputLines[this.currentLineIndex++];
                rawLines.push(returnAsString ? line : +line);
            }
            return rawLines;
        }
    }

    // The factory function that GET used to be, returning a new ParserInstance
    return function createInputParser(inputString) {
        return new ParserInstance(inputString);
    };
})();

const inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainLogic());

function processMainLogic() {
    const totalElements = inputReader.readSingleValue(); // Reads 'n'
    const initialArray = inputReader.readLineValues();   // Reads 'b'
    let resultSequence = []; // Renamed from 'ans', declared with 'let' as it's modified

    // Helper function for creating a new array with an element removed at a specific index
    const removeElementAtIndex = (sourceArray, indexToRemove) => {
        if (indexToRemove < 0 || indexToRemove >= sourceArray.length) {
            return [...sourceArray]; // Return a shallow copy if index is out of bounds
        }
        return sourceArray.slice(0, indexToRemove).concat(sourceArray.slice(indexToRemove + 1));
    };

    // Renamed from 'f', this recursive function attempts to find the permutation
    function findPermutation(currentPermutation) {
        // Base case: If the array is empty, a valid permutation sequence has been found
        if (currentPermutation.length === 0) {
            return true;
        }

        // Iterate from the rightmost element to the leftmost
        for (let idx = currentPermutation.length - 1; idx >= 0; idx--) {
            // Check if the element at the current index matches the expected value (index + 1)
            if (currentPermutation[idx] === idx + 1) {
                resultSequence.push(currentPermutation[idx]); // Add the found element to the result sequence

                // Recursively call with the element removed from the array
                const remainingPermutation = removeElementAtIndex(currentPermutation, idx);
                if (findPermutation(remainingPermutation)) {
                    return true; // If the recursive call finds a solution, propagate true
                }
                // IMPORTANT: To match the original code's behavior, we do NOT pop from resultSequence here.
                // The original code implicitly leaves elements in 'ans' even if a path fails,
                // and only returns the final 'ans' if the overall 'f' returns true.
                // If 'f' returns false, 'ans' might contain partial, incorrect data, but it's not used.
            }
        }
        return false; // No valid element found in this step, so this path fails
    }

    // Execute the permutation finding logic
    const permutationFound = findPermutation(initialArray);

    // Use a guard clause for early exit if no permutation was found
    if (!permutationFound) {
        return -1;
    }

    // Prepare the final output: reverse the sequence and join with newlines
    const finalOutput = resultSequence.reverse().join("\n");
    return finalOutput;
}

// This module provides a flexible input parsing utility, designed to read various data formats from a stream.
// It acts as a factory to create an input processor instance.
const InputProcessorFactory = (function () {
    /**
     * Represents a stream of input lines, allowing sequential reading and parsing.
     * It maintains the state of the input stream, including the current line being processed.
     */
    class LineStreamProcessor {
        /**
         * Initializes the input processor with the raw string content.
         * The input is split into an array of lines, filtering out any empty lines.
         * @param {string} rawInputString - The entire input content provided as a single string.
         */
        constructor(rawInputString) {
            // Split the input string by newline characters, accommodating both Windows (\r\n) and Unix (\n) formats.
            // Filter out any lines that are empty after trimming whitespace, to ensure meaningful data processing.
            this.linesArray = rawInputString.split(/\r?\n/).filter(line => line.trim().length > 0);
            this.currentLineIndex = 0; // Pointer to the next line to be read.
        }

        /**
         * Extracts and returns a single number from the current line.
         * This method has a peculiar parsing logic: it splits the current line by spaces,
         * reverses the resulting array of words, and then "pops" (removes and returns) the last element.
         * This effectively retrieves the *first* word from the original line.
         * The remaining words on the line are then stored back, in their reversed order, for subsequent calls.
         * @param {boolean} [returnAsString=false] - If true, the extracted value is returned as a string; otherwise, it's converted to a number.
         * @returns {string|number} The extracted value, either as a string or a number.
         */
        extractNextNumber(returnAsString = false) {
            const currentLineContent = this.linesArray[this.currentLineIndex];

            // Basic validation: Check if the current line is valid and not empty.
            if (typeof currentLineContent !== "string" || currentLineContent.trim().length === 0) {
                // If the line is empty or invalid, increment the index to prevent an infinite loop,
                // and return a default invalid value.
                if (currentLineContent && currentLineContent.trim().length === 0) {
                    this.currentLineIndex++;
                }
                console.warn("Attempted to read from an invalid or empty line. Returning NaN.");
                return returnAsString ? "" : NaN;
            }

            // Split the current line into individual word segments.
            let lineSegments = currentLineContent.split(" ");
            
            // Replicate the original logic: reverse the segments array in-place,
            // then pop the last element (which was the first element of the original line).
            lineSegments.reverse(); // Array is now reversed.
            const extractedValue = lineSegments.pop(); // Get the "first" element (after reversing).

            // If no segments are left on the current line, advance to the next line.
            if (lineSegments.length === 0) {
                this.currentLineIndex++;
            } else {
                // Otherwise, update the current line in the array with the remaining (reversed) segments.
                this.linesArray[this.currentLineIndex] = lineSegments.join(" ");
            }

            // Return the extracted value, converting to a number if specified.
            return returnAsString ? extractedValue : Number(extractedValue);
        }

        /**
         * Reads an entire line of space-separated values and returns them as an array.
         * The processor then advances to the next line.
         * @param {boolean} [returnAsStringArray=false] - If true, returns an array of strings; otherwise, an array of numbers.
         * @returns {Array<string|number>} An array containing the parsed values from the line.
         */
        readNumbersFromLine(returnAsStringArray = false) {
            // Check if we've read past the end of the input.
            if (this.currentLineIndex >= this.linesArray.length) {
                console.warn("Attempted to read past the end of the input stream. Returning empty array.");
                return [];
            }
            // Get the current line, split it by spaces, and then advance the line index.
            const lineValues = this.linesArray[this.currentLineIndex++].split(" ");
            // Convert values to numbers if requested, otherwise return as strings.
            return returnAsStringArray ? lineValues : lineValues.map(Number);
        }

        // The original code included `m` (readNumberMatrix) and `r` (readRawLines) methods.
        // These methods are not utilized by the main computation logic.
        // As part of Type III cloning, non-essential code fragments can be deleted.
        // Therefore, these unused methods have been removed to simplify the processor.
    }

    // The factory function that creates and returns a new LineStreamProcessor instance.
    return (inputSource) => new LineStreamProcessor(inputSource);
})();

// Instantiate the data reader by providing it the content of standard input.
// `require("fs").readFileSync("/dev/stdin", "utf8")` reads the entire stdin as a UTF-8 string.
const dataReader = InputProcessorFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Performs a binary search on a sorted array to find the appropriate insertion point for a target value.
 * This function is analogous to `std::lower_bound` in C++, returning the index of the first element
 * that is not less than (i.e., greater than or equal to) the specified target value.
 * @param {number[]} searchArray - The array to search within, which must be sorted in ascending order.
 * @param {number} leftIndex - The starting (inclusive) index of the search range.
 * @param {number} rightIndex - The ending (exclusive) index of the search range.
 * @param {number} targetValue - The value for which to find the insertion point.
 * @returns {number} The index where `targetValue` could be inserted while maintaining the sorted order.
 */
function findInsertionPoint(searchArray, leftIndex, rightIndex, targetValue) {
    let midIndex; // Variable to store the calculated middle index.
    // Continue the binary search as long as there are at least two elements in the current range.
    while (rightIndex - leftIndex > 1) {
        // Calculate the middle index. Using `Math.floor` ensures an integer index.
        midIndex = Math.floor((leftIndex + rightIndex) / 2);
        // If the element at `midIndex` is less than the `targetValue`,
        // the target must be in the right half (elements from `midIndex` onwards).
        if (searchArray[midIndex] < targetValue) {
            leftIndex = midIndex;
        } else {
            // Otherwise, the target must be in the left half (elements up to `midIndex`).
            rightIndex = midIndex;
        }
    }
    // After the loop, `leftIndex` and `rightIndex` will be adjacent.
    // The insertion point is `rightIndex` if `searchArray[leftIndex]` is less than `targetValue`,
    // otherwise it's `leftIndex`.
    return searchArray[leftIndex] < targetValue ? rightIndex : leftIndex;
}

// Execute the main computational logic and output its result to the console.
console.log(computeXORSum());

/**
 * The primary function that computes a specific XOR sum based on two input arrays
 * and a series of bitwise operations and binary searches.
 * This function implements the core algorithm of the problem.
 * @returns {number} The final calculated XOR sum.
 */
function computeXORSum() {
    // Read an initial number from input. In this problem variant, this value is not used,
    // but it's read to match the original input consumption pattern.
    const unusedEntryCount = dataReader.extractNextNumber();

    // Read the two main arrays (firstArray and secondArray) from the input stream.
    let firstArray = dataReader.readNumbersFromLine();
    let secondArray = dataReader.readNumbersFromLine();

    // Guard clause: If either array is empty, the XOR sum cannot be computed meaningfully, so return 0.
    if (firstArray.length === 0 || secondArray.length === 0) {
        return 0;
    }

    let accumulatedXORResult = 0; // This variable will store the final XOR sum.
    const firstArraySize = firstArray.length; // Store the size of the first array for efficiency.
    const secondArraySize = secondArray.length; // Store the size of the second array for efficiency.

    // Initially sort the second array. This is a prerequisite for the `findInsertionPoint` (binary search) function.
    secondArray.sort((valA, valB) => valA - valB);

    // The main loop iterates through bit positions, typically from the most significant bit down to the least significant (0).
    // The range `28` down to `0` implies processing numbers up to `2^29 - 1`.
    for (let bitPosition = 28; bitPosition >= 0; bitPosition--) {
        const currentBitValue = 1 << bitPosition; // Represents 2 raised to the power of `bitPosition`.
        const doubleBitValue = currentBitValue << 1; // Equivalent to `currentBitValue * 2`.
        const tripleBitValue = currentBitValue + doubleBitValue; // Equivalent to `currentBitValue * 3`.

        // `lowerBitsMask` creates a mask for all bits less significant than `currentBitValue`.
        // E.g., if `currentBitValue` is 8 (binary 1000), `lowerBitsMask` is 7 (binary 0111).
        const lowerBitsMask = currentBitValue - 1;

        // `pairCountModuloTwo` tracks the parity of a computed count.
        // The initialization `firstArraySize * firstArraySize` mimics the original code's `x = a.length * a.length`.
        // This initial value's parity is significant for the problem's logic.
        let pairCountModuloTwo = firstArraySize * firstArraySize;

        // Inner loop: Iterate through each element of the `firstArray`.
        for (let elementIndex = 0; elementIndex < firstArraySize; elementIndex++) {
            const currentAValue = firstArray[elementIndex];

            // Perform three binary searches on the `secondArray` to find specific lower bounds.
            // These bounds define ranges for `currentAValue + b_k` relative to `currentBitValue`, `doubleBitValue`, and `tripleBitValue`.
            const lowerBoundIndex1 = findInsertionPoint(secondArray, 0, secondArraySize, currentBitValue - currentAValue);
            const lowerBoundIndex2 = findInsertionPoint(secondArray, 0, secondArraySize, doubleBitValue - currentAValue);
            const lowerBoundIndex3 = findInsertionPoint(secondArray, lowerBoundIndex2, secondArraySize, tripleBitValue - currentAValue);

            // Update `pairCountModuloTwo` based on the results of the binary searches.
            // The specific arithmetic (`-lb3 + lb2 - lb1`) is derived from the problem's logic
            // to count pairs whose sum falls into certain bit ranges.
            pairCountModuloTwo += (-lowerBoundIndex3 + lowerBoundIndex2 - lowerBoundIndex1);
        }

        // If the `pairCountModuloTwo` for the current bit position is odd,
        // it means this bit contributes to the final XOR sum.
        if ((pairCountModuloTwo % 2) !== 0) {
            accumulatedXORResult += currentBitValue;
        }

        // Apply the `lowerBitsMask` to both arrays. This effectively truncates elements
        // to only retain bits less significant than the current `bitPosition`, preparing for the next iteration.
        firstArray = firstArray.map(val => val & lowerBitsMask);
        secondArray = secondArray.map(val => val & lowerBitsMask);

        // Conditional processing based on the `bitPosition`.
        // For lower bit positions (less than 18), both arrays are filtered to keep only
        // elements that appear an odd number of times.
        if (bitPosition < 18) {
            firstArray = filterOddOccurrences(firstArray, bitPosition);
            secondArray = filterOddOccurrences(secondArray, bitPosition);
            // After filtering, `secondArray` must be re-sorted because `filterOddOccurrences`
            // returns a new array, and binary search requires a sorted array.
            secondArray.sort((valA, valB) => valA - valB);
        } else {
            // For higher bit positions, only `secondArray` is sorted.
            secondArray.sort((valA, valB) => valA - valB);
        }
    }

    return accumulatedXORResult;

    /**
     * Helper function to process an array and return a new array containing only elements
     * that appear an odd number of times within the `inputCollection`.
     * The `bitLength` parameter defines the maximum possible value for elements,
     * which in turn determines the size of the frequency map.
     * @param {number[]} inputCollection - The array whose elements are to be counted and filtered.
     * @param {number} bitLength - The number of bits relevant for the elements' values (e.g., if elements are 0-7, `bitLength` is 3).
     * @returns {number[]} A new array containing only those unique elements from `inputCollection`
     *                     that had an odd frequency count.
     */
    function filterOddOccurrences(inputCollection, bitLength) {
        // Create a frequency map (an array) initialized to zeros.
        // Its size is determined by `1 << bitLength`, which is 2 raised to the power of `bitLength`.
        const frequencyMap = Array.from({ length: 1 << bitLength }, () => 0);

        // Populate the frequency map by counting occurrences of each element.
        for (let mapIndex = 0; mapIndex < inputCollection.length; mapIndex++) {
            frequencyMap[inputCollection[mapIndex]]++;
        }

        const oddElements = []; // This array will store elements with odd occurrence counts.
        // Iterate through the `frequencyMap` and add elements (their indices) to `oddElements`
        // if their count is odd.
        for (let mapIndex = 0; mapIndex < frequencyMap.length; mapIndex++) {
            if ((frequencyMap[mapIndex] % 2) !== 0) { // Check for odd parity using the modulo operator.
                oddElements.push(mapIndex);
            }
        }
        return oddElements;
    }
}
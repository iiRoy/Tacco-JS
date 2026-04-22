/**
 * A utility class for common array and collection operations,
 * inspired by functional programming libraries.
 */
class CollectionUtilities {
    /**
     * Calculates the sum of all numbers in an array.
     * @param {number[]} numberArray - The array of numbers.
     * @returns {number} The sum of the numbers.
     */
    computeSum(numberArray) {
        if (!Array.isArray(numberArray) || numberArray.length === 0) {
            return 0; // Guard clause for empty or invalid input
        }
        return numberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }

    /**
     * Finds the minimum element in an array using an optional comparator.
     * @param {Array<T>} dataArray - The array to search.
     * @param {function(T, T): number} [comparisonFn=(a,b)=>a-b] - A function to compare two elements.
     * @returns {T|undefined} The minimum element, or undefined if the array is empty.
     * @template T
     */
    findMinimumElement(dataArray, comparisonFn = (a, b) => a - b) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return undefined; // Guard clause
        }
        return dataArray.reduce((minElement, currentElement) =>
            comparisonFn(minElement, currentElement) < 0 ? minElement : currentElement
        );
    }

    /**
     * Finds the maximum element in an array using an optional comparator.
     * @param {Array<T>} dataArray - The array to search.
     * @param {function(T, T): number} [comparisonFn=(a,b)=>a-b] - A function to compare two elements.
     * @returns {T|undefined} The maximum element, or undefined if the array is empty.
     * @template T
     */
    findMaximumElement(dataArray, comparisonFn = (a, b) => a - b) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return undefined; // Guard clause
        }
        return dataArray.reduce((maxElement, currentElement) =>
            comparisonFn(maxElement, currentElement) > 0 ? maxElement : currentElement
        );
    }

    /**
     * Generates a sequence of numbers.
     * @param {number} startValue - The starting value.
     * @param {number} [endValue] - The ending value (exclusive). If omitted, `startValue` becomes `endValue` and `startValue` is 0.
     * @param {number} [stepSize] - The increment/decrement step. Defaults to 1 or -1 based on start/end.
     * @returns {number[]} An array of numbers in the sequence.
     */
    generateNumberSequence(startValue, endValue, stepSize) {
        let currentStart = startValue;
        let currentEnd = endValue;

        if (currentEnd === undefined) {
            currentEnd = currentStart;
            currentStart = 0;
        }

        let actualStep = stepSize;
        if (actualStep === undefined) {
            actualStep = currentEnd < currentStart ? -1 : 1;
        }

        // Validate stepSize to prevent infinite loops for zero step with different start/end
        if (actualStep === 0 && currentStart !== currentEnd) {
             // For robustness, returning empty array or throwing an error is better than an infinite loop.
             return [];
        }

        const sequenceLength = Math.max(0, Math.ceil((currentEnd - currentStart) / actualStep));
        const numberSequence = Array(sequenceLength);

        for (let i = 0; i < sequenceLength; i++) {
            numberSequence[i] = currentStart + i * actualStep;
        }
        return numberSequence;
    }

    /**
     * Retrieves the first N elements from an array.
     * @param {Array<T>} sourceArray - The array.
     * @param {number} [count=1] - The number of elements to retrieve.
     * @returns {T|Array<T>|undefined} The first element if count is 1, an array of elements, or undefined/empty array.
     * @template T
     */
    getFirstElements(sourceArray, count = 1) {
        if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
            return count === 1 ? undefined : [];
        }
        if (count === 1) {
            return sourceArray[0];
        }
        return sourceArray.slice(0, Math.max(0, count));
    }

    /**
     * Retrieves all but the last N elements from an array.
     * @param {Array<T>} sourceArray - The array.
     * @param {number} [count=1] - The number of elements to exclude from the end.
     * @returns {Array<T>} A new array containing the initial elements.
     * @template T
     */
    getInitialElements(sourceArray, count = 1) {
        if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
            return [];
        }
        const actualCount = Math.max(0, count);
        return sourceArray.slice(0, Math.max(0, sourceArray.length - actualCount));
    }

    /**
     * Retrieves the last N elements from an array.
     * @param {Array<T>} sourceArray - The array.
     * @param {number} [count=1] - The number of elements to retrieve from the end.
     * @returns {T|Array<T>|undefined} The last element if count is 1, an array of elements, or undefined/empty array.
     * @template T
     */
    getLastElements(sourceArray, count = 1) {
        if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
            return count === 1 ? undefined : [];
        }
        if (count === 1) {
            return sourceArray[sourceArray.length - 1];
        }
        return sourceArray.slice(Math.max(0, sourceArray.length - count));
    }

    /**
     * Retrieves all elements from an array after the first N elements.
     * @param {Array<T>} sourceArray - The array.
     * @param {number} [count=1] - The number of elements to skip from the beginning.
     * @returns {Array<T>} A new array containing the tail elements.
     * @template T
     */
    getTailElements(sourceArray, count = 1) {
        if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
            return [];
        }
        const actualCount = Math.max(0, count);
        return sourceArray.slice(actualCount);
    }

    /**
     * Calculates the cumulative sums of an array of numbers.
     * E.g., [1, 2, 3] -> [1, 3, 6]
     * @param {number[]} numberArray - The array of numbers.
     * @returns {number[]} An array of cumulative sums.
     */
    calculateCumulativeSums(numberArray) {
        if (!Array.isArray(numberArray) || numberArray.length === 0) {
            return [];
        }
        const cumulativeSums = [];
        let currentSum = 0;
        for (const num of numberArray) {
            currentSum += num;
            cumulativeSums.push(currentSum);
        }
        return cumulativeSums;
    }

    /**
     * Performs a binary search on a sorted array.
     * @param {Array<T>} sortedArray - The array to search, assumed to be sorted.
     * @param {any} searchKey - The value to search for.
     * @param {string|function(T): any} [accessor] - Property name string or function to extract value for comparison.
     * @returns {number} The index where the searchKey should be inserted to maintain order, or its current index if found.
     * @template T
     */
    performBinarySearch(sortedArray, searchKey, accessor) {
        if (!Array.isArray(sortedArray)) {
            throw new Error("Input must be an array for binary search.");
        }

        const getComparisonValue = (element) => {
            if (typeof accessor === 'string') {
                return element?.[accessor];
            }
            if (typeof accessor === 'function') {
                return accessor(element);
            }
            return element;
        };

        const targetValue = getComparisonValue(searchKey); // Handle if searchKey itself needs accessor

        let lowIndex = 0;
        let highIndex = sortedArray.length;

        while (lowIndex < highIndex) {
            const midIndex = Math.floor((lowIndex + highIndex) / 2);
            const midValue = getComparisonValue(sortedArray[midIndex]);

            if (midValue < targetValue) {
                lowIndex = midIndex + 1;
            } else {
                highIndex = midIndex;
            }
        }
        return lowIndex;
    }
}
const collectionUtils = new CollectionUtilities(); // Renamed instance

/**
 * Handles reading various types of input from standard input.
 */
class DataStreamReader {
    constructor() {
        this.readPointer = 0;
        this.allInputLines = [];
        this.initializeInputData();
    }

    /**
     * Reads all available data from stdin and splits it into lines.
     * Filters out empty lines to prevent issues with extra newlines.
     * @private
     */
    initializeInputData() {
        try {
            const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
            this.allInputLines = rawData.split('\n').filter(line => line.trim() !== '');
        } catch (error) {
            console.error("Error reading input from /dev/stdin:", error);
            this.allInputLines = []; // Ensure it's an array even on error
        }
    }

    /**
     * Fetches one or multiple lines from the input stream.
     * Advances the internal read pointer.
     * @param {number} [lineCount] - The number of lines to fetch. If omitted, fetches one line.
     * @returns {string|string[]} A single line string or an array of line strings. Returns empty string/array if no more lines.
     */
    fetchNextLines(lineCount) {
        if (lineCount === undefined) {
            if (this.readPointer >= this.allInputLines.length) {
                return ''; // Return empty string if no more lines
            }
            return this.allInputLines[this.readPointer++];
        } else {
            const endIndex = Math.min(this.readPointer + lineCount, this.allInputLines.length);
            const lines = this.allInputLines.slice(this.readPointer, endIndex);
            this.readPointer = endIndex;
            return lines;
        }
    }

    /**
     * Fetches a line and splits it into an array of strings.
     * @returns {string[]} An array of strings.
     */
    fetchStringArray() {
        const line = this.fetchNextLines();
        return line.split(' ');
    }

    /**
     * Fetches a line and parses its elements into an array of integers.
     * Filters out any non-numeric results (NaN).
     * @returns {number[]} An array of integers.
     */
    fetchIntegerArray() {
        return this.fetchStringArray().map(str => parseInt(str, 10)).filter(num => !isNaN(num));
    }

    /**
     * Fetches a line and parses its elements into an array of floating-point numbers.
     * Filters out any non-numeric results (NaN).
     * @returns {number[]} An array of floats.
     */
    fetchFloatArray() {
        return this.fetchStringArray().map(str => parseFloat(str)).filter(num => !isNaN(num));
    }

    /**
     * Fetches multiple lines and parses each into an integer.
     * Filters out any non-numeric results (NaN).
     * @param {number} count - The number of lines to fetch.
     * @returns {number[]} An array of integers.
     */
    fetchIntegerLines(count) {
        return this.fetchNextLines(count).map(line => parseInt(line, 10)).filter(num => !isNaN(num));
    }

    /**
     * Fetches multiple lines and parses each into a floating-point number.
     * Filters out any non-numeric results (NaN).
     * @param {number} count - The number of lines to fetch.
     * @returns {number[]} An array of floats.
     */
    fetchFloatLines(count) {
        return this.fetchNextLines(count).map(line => parseFloat(line)).filter(num => !isNaN(num));
    }

    /**
     * Fetches multiple lines, each split into a string array, forming a 2D string array.
     * @param {number} count - The number of lines to fetch.
     * @returns {string[][]} A 2D array of strings.
     */
    fetchStringMatrix(count) {
        return this.fetchNextLines(count).map(line => line.split(' '));
    }

    /**
     * Fetches multiple lines, each split into an array of integers, forming a 2D integer array.
     * Filters out any non-numeric results (NaN) from each inner array.
     * @param {number} count - The number of lines to fetch.
     * @returns {number[][]} A 2D array of integers.
     */
    fetchIntegerMatrix(count) {
        return this.fetchNextLines(count).map(line =>
            line.split(' ').map(str => parseInt(str, 10)).filter(num => !isNaN(num))
        );
    }

    /**
     * Fetches multiple lines, each split into an array of floats, forming a 2D float array.
     * Filters out any non-numeric results (NaN) from each inner array.
     * @param {number} count - The number of lines to fetch.
     * @returns {number[][]} A 2D array of floats.
     */
    fetchFloatMatrix(count) {
        return this.fetchNextLines(count).map(line =>
            line.split(' ').map(str => parseFloat(str)).filter(num => !isNaN(num))
        );
    }
}
const dataReader = new DataStreamReader(); // Renamed instance

/**
 * Main class to solve the problem using dynamic programming.
 * This problem counts valid DNA sequences of length N, avoiding certain patterns.
 */
class ProblemSolver {
    /**
     * Helper static function to perform modulo addition.
     * Ensures results stay within the integer range and avoid overflow for large sums.
     * @param {number} num1 - The first number.
     * @param {number} num2 - The second number.
     * @param {number} modulus - The modulus value.
     * @returns {number} The result of (num1 + num2) % modulus.
     */
    static addWithModulo(num1, num2, modulus) {
        return (num1 + num2) % modulus;
    }

    /**
     * Executes the problem-solving logic.
     * Calculates the number of DNA sequences of a given length that do not contain specific forbidden patterns.
     */
    executeProblem() {
        // Define a large prime number for modulo operations to prevent integer overflow
        const PRIME_MODULO = 1000000007;

        // Read the target sequence length from input
        const sequenceLength = parseInt(dataReader.fetchNextLines(), 10);

        // --- Input Validation and Edge Cases ---
        if (isNaN(sequenceLength) || sequenceLength < 0) {
            console.error("Error: Invalid sequence length provided. Must be a non-negative integer.");
            return; // Exit if input is invalid
        }
        if (sequenceLength === 0) {
            console.log(1); // Base case: 1 way to form an empty sequence (the empty string itself)
            return;
        }

        // Define the valid nucleotide bases for DNA sequences
        const dnaBases = ['A', 'T', 'G', 'C'];

        // Define the forbidden 3-character patterns, represented as regular expressions.
        // These patterns are checked against a 4-character string (previous 3 chars + new char).
        // Example: '.AGC' matches any character followed by 'AGC'.
        const prohibitedTriplets = [
            new RegExp('.AGC'), // Any character + AGC
            new RegExp('AG.C'), // AG + Any character + C
            new RegExp('A.GC'), // A + Any character + GC
            new RegExp('.GAC'), // Any character + GAC
            new RegExp('.ACG')  // Any character + ACG
        ];

        // Dynamic programming table: memoTable[length][last_three_chars] = count
        // Using Map objects for inner states to efficiently handle sparse states and string keys.
        const memoTable = new Array(sequenceLength + 1);
        for (let i = 0; i <= sequenceLength; ++i) {
            memoTable[i] = new Map();
        }

        // Base case initialization for length 0.
        // 'TTT' is an arbitrary 3-char sequence that serves as a starting point.
        // It represents the "context" before any actual character is added.
        // The count of 1 means there's one way to have this "empty context".
        memoTable[0].set('TTT', 1);

        // Iterate from sequence length 1 up to the target sequenceLength
        for (let currentLen = 1; currentLen <= sequenceLength; ++currentLen) {
            // Iterate over all valid 3-character sequences from the previous length (currentLen - 1)
            // and their associated counts.
            for (const [prevSeqKey, prevCount] of memoTable[currentLen - 1].entries()) {
                // For each previous sequence, try appending every possible DNA base
                for (const nextBase of dnaBases) {
                    // Create a 4-character candidate sequence by appending the new base
                    const candidateSequence = prevSeqKey + nextBase;
                    let isForbidden = false;

                    // Check if this candidate sequence violates any of the prohibited patterns
                    for (const patternRegex of prohibitedTriplets) {
                        if (patternRegex.test(candidateSequence)) {
                            isForbidden = true;
                            break; // If a forbidden pattern is found, no need to check further
                        }
                    }

                    // If the candidate sequence contains a forbidden pattern, skip this branch
                    if (isForbidden) {
                        continue;
                    }

                    // If the sequence is valid, determine the new 3-character state.
                    // The DP state only cares about the last 3 characters.
                    const newSeqKey = candidateSequence.slice(1); // Get the last 3 characters

                    // Retrieve the current count for this new state, defaulting to 0 if not present
                    const currentTotalForNewState = memoTable[currentLen].get(newSeqKey) || 0;

                    // Update the DP table by adding the count from the previous state.
                    // Apply modulo arithmetic at each addition to prevent overflow.
                    memoTable[currentLen].set(
                        newSeqKey,
                        ProblemSolver.addWithModulo(currentTotalForNewState, prevCount, PRIME_MODULO)
                    );
                }
            }
        }

        // After filling the DP table, sum all counts for sequences of the target length.
        let totalValidSequences = 0;
        // Iterate through all values (counts) in the Map for the final sequenceLength
        for (const count of memoTable[sequenceLength].values()) {
            totalValidSequences = ProblemSolver.addWithModulo(totalValidSequences, count, PRIME_MODULO);
        }

        // Output the final calculated total of valid sequences
        console.log(totalValidSequences);
    }
}

// Instantiate the problem solver and execute its main logic.
const problemInstance = new ProblemSolver();
problemInstance.executeProblem();
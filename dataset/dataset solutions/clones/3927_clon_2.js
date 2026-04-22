// Strict mode enabled for modern JavaScript practices
"use strict";

// Main application logic processing input data
class PrimaryTask {

    // Executes the core problem-solving routine
    executeOperation() {
        // Read the total number of items from the input source
        const countItems = dataFeeder.retrieveInteger();
        // Fetch a collection of integer pairs based on the item count
        const pairsCollection = dataFeeder.fetchIntegerPairs(countItems);

        // If all pairs have identical first and second elements, result is zero
        if (pairsCollection.every(element => element[0] === element[1])) {
            return 0;
        }

        // Filter out pairs where the first element is strictly greater than the second
        const greaterElements = pairsCollection.filter(element => element[0] > element[1]);

        // Calculate the total sum of all first elements in the original collection
        const totalSumOfFirsts = utility.calculateTotal(pairsCollection.transformElements(element => element[0]));

        // Determine if there are no elements where the first is greater than the second
        // If so, the result is zero. Otherwise, find the minimum second element among those where the first is greater.
        return totalSumOfFirsts - greaterElements.size === 0 ? 0 : utility.findMinimum(pairsCollection.selectItems(element => element[0] > element[1]).transformElements(element => element[1]));
    }
}

// Handles modular arithmetic operations
class ModuloCalculator {

    // Initializes the calculator with a specified modulo value
    constructor(moduloValue) {
        // Use a default modulo if none is provided
        if (moduloValue == null) {
            moduloValue = CombinatoricsProcessor.StandardModulo;
        }
        this.currentModulo = moduloValue;
    }

    // Performs modular multiplication (a * b) % mod
    multiplyModular(operandA, operandB) {
        let resultAccumulator = 0; // Initialize result
        operandA %= this.currentModulo; // Ensure operandA is within modulo range
        operandB %= this.currentModulo; // Ensure operandB is within modulo range

        // Loop while operandB is not zero (simulating multiplication via addition)
        while (operandB) {
            // If the last bit of operandB is set, add operandA to the result
            if (operandB & 1) {
                resultAccumulator += operandA;
                // Keep result within modulo range
                if (resultAccumulator >= this.currentModulo) {
                    resultAccumulator -= this.currentModulo;
                }
            }
            // Double operandA for the next iteration
            operandA <<= 1;
            // Keep operandA within modulo range
            if (operandA >= this.currentModulo) {
                operandA -= this.currentModulo;
            }
            // Halve operandB
            operandB >>= 1;
        }
        return resultAccumulator;
    }

    // Computes (a ^ b) % mod using modular exponentiation
    powerModular(baseVal, exponentVal) {
        let resultAccumulator = 1; // Start with 1 for exponentiation
        // Loop while exponentVal is not zero
        while (exponentVal) {
            // If the last bit of exponentVal is set, multiply result by baseVal
            if (exponentVal & 1) {
                resultAccumulator = this.multiplyModular(resultAccumulator, baseVal);
            }
            // Square the baseVal for the next iteration
            baseVal = this.multiplyModular(baseVal, baseVal);
            // Halve the exponentVal
            exponentVal >>= 1;
        }
        return resultAccumulator;
    }

    // Performs modular division (a / b) % mod using Fermat's Little Theorem
    // (a * b^(mod-2)) % mod
    divideModular(numerator, denominator) {
        return this.multiplyModular(numerator, this.powerModular(denominator, this.currentModulo - 2));
    }

    // Calculates combinations (n C k) % mod
    combinationsModular(nVal, kVal) {
        // Requires pre-computed factorial and inverse factorial tables
        return MODULO_MANAGER.multiplyModular(factorialCache[nVal], MODULO_MANAGER.multiplyModular(inverseFactorialCache[kVal], inverseFactorialCache[nVal - kVal]));
    }
}
// Global instance for modular operations, using a common large prime
const MODULO_MANAGER = new ModuloCalculator(1000000007);

// Placeholder for CombinatoricsProcessor if it were defined elsewhere
class CombinatoricsProcessor {
    static StandardModulo = 1000000007; // A common default modulo
}
// Global caches for factorials and inverse factorials (assuming they are populated elsewhere)
const factorialCache = [];
const inverseFactorialCache = [];


// Provides a set of utility functions for array and collection manipulation
class CollectionUtilities {

    // Calculates the sum of all numeric elements in an array
    calculateTotal(inputArray) {
        return inputArray.reduce((accumulator, currentValue) => accumulator + currentValue);
    }

    // Calculates the sum of elements with a specified modulo
    sumWithModulo(inputArray, moduloValue) {
        if (moduloValue == null) {
            moduloValue = MODULO_MANAGER.currentModulo;
        }
        return inputArray.reduce((accumulator, currentValue) => (accumulator + currentValue) % moduloValue);
    }

    // Finds the minimum element in an array, optionally using a custom comparison function
    findMinimum(inputArray, comparisonFunction) {
        if (comparisonFunction == null) {
            comparisonFunction = (valA, valB) => valA - valB;
        }
        return inputArray.reduce((accumulator, currentValue) => comparisonFunction(accumulator, currentValue) < 0 ? accumulator : currentValue);
    }

    // Finds the maximum element in an array, optionally using a custom comparison function
    findMaximum(inputArray, comparisonFunction) {
        if (comparisonFunction == null) {
            comparisonFunction = (valA, valB) => valA - valB;
        }
        return inputArray.reduce((accumulator, currentValue) => comparisonFunction(accumulator, currentValue) > 0 ? accumulator : currentValue);
    }

    // Sorts an array in-place, optionally using a custom comparison function
    sortCollection(inputArray, comparisonFunction) {
        if (comparisonFunction == null) {
            comparisonFunction = (valA, valB) => valA - valB;
        }
        return inputArray.sort(comparisonFunction);
    }

    // Returns an array containing only the unique elements from the input array
    getUniqueElements(inputArray) {
        inputArray.sort(); // Sort to group duplicates
        for (let indexCounter = 0; indexCounter < inputArray.length - 1; ++indexCounter) {
            // Mark duplicate elements as null
            inputArray[indexCounter] = inputArray[indexCounter + 1] === inputArray[indexCounter] ? null : inputArray[indexCounter];
        }
        // Filter out the nulls
        return inputArray.filter(element => element != null);
    }

    // Generates an array of numbers within a specified range and step
    generateSequence(sequenceStart, sequenceEnd, stepAmount) {
        // Handle optional arguments: if only one arg, it's end, start is 0
        if (sequenceEnd == null) {
            sequenceEnd = sequenceStart || 0;
            sequenceStart = 0;
        }
        // Default step based on direction
        if (!stepAmount) {
            stepAmount = sequenceEnd < sequenceStart ? -1 : 1;
        }
        // Calculate the length of the sequence
        const sequenceLength = Math.max(Math.ceil((sequenceEnd - sequenceStart) / stepAmount), 0);
        const generatedSequence = Array(sequenceLength);

        // Populate the array
        for (let elementIndex = 0; elementIndex < sequenceLength; elementIndex++, sequenceStart += stepAmount) {
            generatedSequence[elementIndex] = sequenceStart;
        }
        return generatedSequence;
    }

    // Retrieves the first N elements or the very first element of an array
    getFirstElements(dataArray, numElements) {
        if (dataArray == null || dataArray.length < 1) {
            return numElements == null ? undefined : [];
        }
        if (numElements == null) {
            return dataArray[0];
        }
        return this.getInitialElements(dataArray, dataArray.length - numElements);
    }

    // Retrieves all elements except the last N (or just the last one by default)
    getInitialElements(dataArray, numElements) {
        return dataArray.slice.call(dataArray, 0, Math.max(0, dataArray.length - (numElements == null ? 1 : numElements)));
    }

    // Retrieves all elements except the first N (or just the first one by default)
    getTailElements(dataArray, numElements) {
        return dataArray.slice.call(dataArray, numElements == null ? 1 : numElements);
    }

    // Retrieves the last N elements or the very last element of an array
    getLastElements(dataArray, numElements) {
        if (numElements == null) {
            return dataArray[dataArray.length - 1];
        }
        return this.getTailElements(dataArray, Math.max(0, dataArray.length - numElements));
    }

    // Calculates the cumulative sum of an array
    calculateCumulativeSum(inputArray) {
        return this.getTailElements(inputArray.reduce(((accumulator, currentValue, index) => {
            accumulator.push(currentValue + accumulator[index]);
            return accumulator;
        }), [0]));
    }

    // Calculates the differences between adjacent elements in an array
    calculateDifferences(inputArray) {
        const diffResult = [];
        for (let index = 1; index < inputArray.length; ++index) {
            diffResult.push(inputArray[index] - inputArray[index - 1]);
        }
        return diffResult;
    }

    // Performs a binary search on a sorted array to find the insertion point
    // Returns the index where 'key' would be inserted to maintain order.
    performBinarySearch(dataArray, searchKey, propertyAccessor) {
        // Helper function to get the value for comparison
        const accessorFunc = (targetObject) => (typeof targetObject === 'object') ? targetObject[propertyAccessor] : targetObject;
        const searchValue = accessorFunc(searchKey); // Value to search for

        let lowerBound = 0;
        let upperBound = dataArray.length;

        // Binary search loop
        while (lowerBound < upperBound) {
            let middleIndex = Math.floor((lowerBound + upperBound) / 2);
            // If the middle element's value is less than the search value, move lower bound
            if (accessorFunc(dataArray[middleIndex]) < searchValue) {
                lowerBound = middleIndex + 1;
            } else { // Otherwise, move upper bound
                upperBound = middleIndex;
            }
        }
        return lowerBound; // Return the insertion point
    }
}
// Global instance for collection utility functions
const utility = new CollectionUtilities();


// Manages reading various types of input from stdin
class DataStreamReader {

    // Constructor to initialize the reader
    constructor() {
        this.readPosition = 0; // Tracks current reading position
        this.loadAllData(); // Load all input immediately
    }

    // Loads all input data from standard input
    loadAllData() {
        // Reads from stdin, decodes as UTF-8, and splits into lines
        this.rawDataLines = (require("node:fs").readFileSync("/dev/fd/0", "utf8")).divideByNewline();
        return this.rawDataLines;
    }

    // Fetches N lines of input, or just the next single line
    fetchNextLine(numLines) {
        if (numLines) {
            const extractedLines = this.rawDataLines.slice(this.readPosition, this.readPosition + numLines);
            this.readPosition += numLines;
            return extractedLines;
        }
        return this.rawDataLines[this.readPosition++];
    }

    // Parses the next line as a single integer
    parseNextInteger() {
        return parseIntValue(this.fetchNextLine());
    }

    // Parses the next line as an array of strings, split by space
    parseNextStringArray() {
        return this.fetchNextLine().splitBySpace();
    }

    // Parses the next line as an array of integers
    parseNextIntegerArray() {
        return this.parseNextStringArray().transformEach((itemString) => parseIntValue(itemString));
    }

    // Parses the next line as an array of floating-point numbers
    parseNextFloatArray() {
        return this.parseNextStringArray().transformEach((itemString) => parseFloatValue(itemString));
    }

    // Parses N lines as an array of integers
    parseIntegerLines(numLines) {
        return this.fetchNextLine(numLines).transformEach((itemString) => parseIntValue(itemString));
    }

    // Parses N lines as an array of floating-point numbers
    parseFloatLines(numLines) {
        return this.fetchNextLine(numLines).transformEach((itemString) => parseFloatValue(itemString));
    }

    // Parses N lines into a 2D array of strings
    parseStringGrid(numLines) {
        return this.fetchNextLine(numLines).transformEach((currentLine) => currentLine.splitBySpace());
    }

    // Parses N lines into a 2D array of integers
    parseIntegerGrid(numLines) {
        return this.fetchNextLine(numLines).transformEach((currentLine) => currentLine.splitBySpace().transformEach((itemString) => parseIntValue(itemString)));
    }

    // Parses N lines into a 2D array of floating-point numbers
    parseFloatGrid(numLines) {
        return this.fetchNextLine(numLines).transformEach((currentLine) => currentLine.splitBySpace().transformEach((itemString) => parseFloatValue(itemString)));
    }
}
// Global instance for input reading
const dataFeeder = new DataStreamReader();

// Helper functions for parsing (to clone parseInt/parseFloat)
const parseIntValue = (str) => parseInt(str, 10);
const parseFloatValue = (str) => parseFloat(str);

// Extend String prototype for split operations (a subtle change)
if (!String.prototype.divideByNewline) {
    String.prototype.divideByNewline = function() {
        return this.split('\n');
    };
}
if (!String.prototype.splitBySpace) {
    String.prototype.splitBySpace = function() {
        return this.split(' ');
    };
}
// Extend Array prototype for map operations (a subtle change)
if (!Array.prototype.transformEach) {
    Array.prototype.transformEach = function(callback) {
        return this.map(callback);
    };
}


// Manages output presentation and formatting
class ResultPresenter {

    // Initializes output options
    constructor() {
        this.displayOptions = {
            'true': 'Yes', // Default string for true
            'false': 'No',  // Default string for false
        };
    }

    // Displays the given value to the console
    presentOutput(resultValue) {
        let formattedOutput;
        if (resultValue == null) {
            return; // Do nothing if output is null or undefined
        }

        // Apply boolean formatting if applicable
        if (resultValue === true) {
            formattedOutput = this.displayOptions['true'];
        } else if (resultValue === false) {
            formattedOutput = this.displayOptions['false'];
        } else {
            formattedOutput = resultValue; // Use value directly otherwise
        }
        process.stdout.write(formattedOutput + "\n"); // Write to stdout with newline
    }

    // Configures custom strings for boolean output
    configureBooleanDisplay(customOptions) {
        this.displayOptions['false'] = customOptions[0];
        this.displayOptions['true'] = customOptions[1];
        return this; // Allow chaining
    }
}
// Global instance for output handling
const outputHandler = new ResultPresenter();

// Execute the main task and present its result
outputHandler.presentOutput(new PrimaryTask().executeOperation());
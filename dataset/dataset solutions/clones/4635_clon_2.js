'use strict'; // This directive enforces stricter parsing and error handling in the code.

// The primary class responsible for orchestrating the ant simulation.
class SimulationCore {
    /**
     * Carries out the principal algorithm to determine the final positions of the ants.
     * @returns {string} A string representing the final locations, with each position on a new line.
     */
    executeSimulation() {
        const parameterSet = dataReader.fetchNextIntegerArray(); // Obtain N, L, T from the input stream.
        const numberOfAnts = parameterSet[0];
        const circuitLength = parameterSet[1];
        const timeElapsed = parameterSet[2];

        // Map the raw input data into structured objects, each representing an ant's initial state.
        const antConfigurations = dataReader.fetchIntegerMatrix(numberOfAnts)
            .map(individualData => {
                return {
                    initialPosition: individualData[0],
                    movementDirection: individualData[1] === 1 ? 1 : -1
                };
            });

        // Compute the theoretical final positions assuming ants pass through each other without collision.
        const theoreticalFinalLocations = antConfigurations.map(antObj =>
            (antObj.initialPosition + antObj.movementDirection * (timeElapsed % circuitLength) + circuitLength) % circuitLength
        );

        // Calculate the effective number of "crossings" that the first ant experiences with others.
        // This accounts for the relative shift in the final sorted order.
        let crossingTally = 0;
        const initialAntDetails = antConfigurations[0];

        for (let antIteration = 1; antIteration < numberOfAnts; ++antIteration) {
            const currentAntDetails = antConfigurations[antIteration];

            // If two ants move in the same direction, their relative order never changes, so they don't "cross".
            if (currentAntDetails.movementDirection === initialAntDetails.movementDirection) {
                continue;
            }

            // Calculate the initial distance between the reference ant and the current ant,
            // adjusted for circular track and direction.
            const relativeStartDistance = (initialAntDetails.movementDirection * (currentAntDetails.initialPosition - initialAntDetails.initialPosition) + circuitLength) % circuitLength;

            // Determine how many times the current ant effectively passes the first ant.
            // Relative speed is 2 units. This formula finds the number of full 'circuitLength'
            // cycles covered by the relative motion, plus one for the initial segment.
            const completedPassages = 1 + (((2 * timeElapsed - relativeStartDistance) / circuitLength) | 0);
            crossingTally += completedPassages;
            crossingTally %= numberOfAnts; // Keep the tally within the bounds of [0, N-1].
        }

        // Compute the final index shift based on the crossing tally and the first ant's direction.
        const effectiveIndexShift = (initialAntDetails.movementDirection * crossingTally + numberOfAnts) % numberOfAnts;
        const initialAntFinalLocation = theoreticalFinalLocations[0];

        // Sort the theoretically computed final locations to establish a base ordered sequence.
        utilityTool.sortCollection(theoreticalFinalLocations);

        // Determine the adjustment needed to place the first ant's initial sorted position correctly.
        let sortingOffset = (initialAntDetails.movementDirection === 1
            ? utilityTool.findInsertionPoint(theoreticalFinalLocations, initialAntFinalLocation + 1) - 1
            : utilityTool.findInsertionPoint(theoreticalFinalLocations, initialAntFinalLocation));

        // Apply a circular shift to the sorted array to achieve the final, correct ant order.
        const finalAntOrdering = utilityTool.circularShift(theoreticalFinalLocations, sortingOffset - effectiveIndexShift);

        return finalAntOrdering.join('\n'); // Consolidate the results into a single string.
    }
}

// This class provides functionalities for modular arithmetic operations.
class ArithmeticModule {
    /**
     * Constructs an instance of the modular arithmetic utility with a given modulus.
     * @param {number} [modulusValue] - The modulus to be used for all calculations. Defaults to a predefined value if none is supplied.
     */
    constructor(modulusValue) {
        if (modulusValue == null) {
            modulusValue = Combinatorics.DefaultMod; // Assumes 'Combinatorics' global or placeholder.
        }
        this.modulusValue = modulusValue;
    }

    /**
     * Computes the product of two numbers modulo the set modulus.
     * It employs a binary multiplication method to manage large intermediate products.
     * @param {number} valueA - The first operand for multiplication.
     * @param {number} valueB - The second operand for multiplication.
     * @returns {number} The modular product (valueA * valueB) % modulusValue.
     */
    multiplyModulo(valueA, valueB) {
        let currentResult = 0;
        valueA %= this.modulusValue;
        valueB %= this.modulusValue;
        while (valueB > 0) {
            if (valueB & 1) { // Check if the least significant bit of valueB is 1.
                currentResult += valueA;
                if (currentResult >= this.modulusValue) {
                    currentResult -= this.modulusValue;
                }
            }
            valueA <<= 1; // Left shift (multiply by 2).
            if (valueA >= this.modulusValue) {
                valueA -= this.modulusValue;
            }
            valueB >>= 1; // Right shift (divide by 2).
        }
        return currentResult;
    }

    /**
     * Calculates the power of a base to an exponent modulo the set modulus.
     * This uses the efficient exponentiation by squaring algorithm.
     * @param {number} baseValue - The base number.
     * @param {number} exponentValue - The power to which the base is raised.
     * @returns {number} The result of (baseValue ^ exponentValue) % modulusValue.
     */
    powerModulo(baseValue, exponentValue) {
        let finalOutcome = 1;
        while (exponentValue > 0) {
            if (exponentValue & 1) { // If the exponent is odd.
                finalOutcome = this.multiplyModulo(finalOutcome, baseValue);
            }
            baseValue = this.multiplyModulo(baseValue, baseValue); // Square the base.
            exponentValue >>= 1; // Halve the exponent.
        }
        return finalOutcome;
    }
}
const PRIME_MODULUS = new ArithmeticModule(1e9 + 7); // An instance for a commonly used large prime modulus.

// A comprehensive utility class for various array manipulations and helper functions.
class UtilityToolkit {
    /**
     * Aggregates all numeric elements in an array to compute their sum.
     * @param {Array<number>} dataCollection - The array of numbers to sum.
     * @returns {number} The total sum of the elements.
     */
    calculateSum(dataCollection) {
        return dataCollection.reduce((accumulatedValue, currentElement) => accumulatedValue + currentElement);
    }

    /**
     * Computes the sum of array elements, applying a modulus to the final result.
     * @param {Array<number>} dataCollection - The array of numbers.
     * @param {number} [modulusValue] - The modulus to apply. Defaults to the global PRIME_MODULUS if not specified.
     * @returns {number} The modular sum of the elements.
     */
    calculateModSum(dataCollection, modulusValue) {
        if (modulusValue == null) {
            modulusValue = PRIME_MODULUS.modulusValue;
        }
        return dataCollection.reduce((accumulatedValue, currentElement) => (accumulatedValue + currentElement) % modulusValue);
    }

    /**
     * Identifies the minimum element within an array, optionally using a custom comparison function.
     * @param {Array<any>} dataCollection - The array to search.
     * @param {function(any, any): number} [comparisonFunction] - A function that defines the sort order (e.g., `(a,b) => a-b` for ascending).
     * @returns {any} The smallest element found in the collection.
     */
    findMinimum(dataCollection, comparisonFunction) {
        if (comparisonFunction == null) {
            comparisonFunction = (valA, valB) => valA - valB;
        }
        return dataCollection.reduce((currentMin, element) => comparisonFunction(currentMin, element) < 0 ? currentMin : element);
    }

    /**
     * Identifies the maximum element within an array, optionally using a custom comparison function.
     * @param {Array<any>} dataCollection - The array to search.
     * @param {function(any, any): number} [comparisonFunction] - A function that defines the sort order (e.g., `(a,b) => a-b` for ascending).
     * @returns {any} The largest element found in the collection.
     */
    findMaximum(dataCollection, comparisonFunction) {
        if (comparisonFunction == null) {
            comparisonFunction = (valA, valB) => valA - valB;
        }
        return dataCollection.reduce((currentMax, element) => comparisonFunction(currentMax, element) > 0 ? currentMax : element);
    }

    /**
     * Sorts an array in place using an optional comparison function.
     * @param {Array<any>} dataCollection - The array to be sorted.
     * @param {function(any, any): number} [comparisonFunction] - A function that defines the sort order.
     * @returns {Array<any>} The reference to the sorted array.
     */
    sortCollection(dataCollection, comparisonFunction) {
        if (comparisonFunction == null) {
            comparisonFunction = (valA, valB) => valA - valB;
        }
        return dataCollection.sort(comparisonFunction);
    }

    /**
     * Generates an array containing a sequence of numbers within a specified range.
     * @param {number} startPoint - The starting value of the range (inclusive).
     * @param {number} [endPoint] - The ending value of the range (exclusive). If omitted, it becomes the `endPoint` and `startPoint` defaults to 0.
     * @param {number} [incrementStep] - The step value for incrementing/decrementing. Defaults to 1 or -1.
     * @returns {Array<number>} An array populated with the generated sequence.
     */
    generateRange(startPoint, endPoint, incrementStep) {
        if (endPoint == null) {
            endPoint = startPoint || 0;
            startPoint = 0;
        }
        if (!incrementStep) {
            incrementStep = endPoint < startPoint ? -1 : 1;
        }
        const calculatedLength = Math.max(Math.ceil((endPoint - startPoint) / incrementStep), 0);
        const generatedArray = Array(calculatedLength);
        for (let currentCounter = 0; currentCounter < calculatedLength; currentCounter++, startPoint += incrementStep) {
            generatedArray[currentCounter] = startPoint;
        }
        return generatedArray;
    }

    /**
     * Retrieves the leading element(s) of an array.
     * @param {Array<any>} sourceArray - The array from which to retrieve elements.
     * @param {number} [elementsCount] - The number of elements to retrieve from the beginning.
     * @returns {any|Array<any>} The first element if `elementsCount` is null, otherwise an array of the first `elementsCount` elements.
     */
    getHead(sourceArray, elementsCount) {
        if (sourceArray == null || sourceArray.length < 1) return elementsCount == null ? void 0 : [];
        if (elementsCount == null) return sourceArray[0];
        return this.getInitialElements(sourceArray, sourceArray.length - elementsCount);
    }

    /**
     * Extracts all elements from an array except for a specified number from the end.
     * @param {Array<any>} sourceArray - The array to process.
     * @param {number} [elementsToExclude] - The quantity of elements to omit from the end. Defaults to 1.
     * @returns {Array<any>} A new array containing the initial elements.
     */
    getInitialElements(sourceArray, elementsToExclude) {
        return sourceArray.slice(0, Math.max(0, sourceArray.length - (elementsToExclude == null ? 1 : elementsToExclude)));
    }

    /**
     * Extracts all elements from an array except for a specified number from the beginning.
     * @param {Array<any>} sourceArray - The array to process.
     * @param {number} [elementsToExclude] - The quantity of elements to omit from the beginning. Defaults to 1.
     * @returns {Array<any>} A new array containing the tail elements.
     */
    getTailElements(sourceArray, elementsToExclude) {
        return sourceArray.slice(elementsToExclude == null ? 1 : elementsToExclude);
    }

    /**
     * Retrieves the trailing element(s) of an array.
     * @param {Array<any>} sourceArray - The array from which to retrieve elements.
     * @param {number} [elementsCount] - The number of elements to retrieve from the end.
     * @returns {any|Array<any>} The last element if `elementsCount` is null, otherwise an array of the last `elementsCount` elements.
     */
    getLastElements(sourceArray, elementsCount) {
        if (elementsCount == null) return sourceArray[sourceArray.length - 1];
        return this.getTailElements(sourceArray, Math.max(0, sourceArray.length - elementsCount));
    }

    /**
     * Calculates the cumulative sum (prefix sum) for a numeric array.
     * @param {Array<number>} sourceArray - The input array of numbers.
     * @returns {Array<number>} An array where each element is the sum of all preceding elements plus itself.
     */
    computeCumulativeSum(sourceArray) {
        return this.getTailElements(sourceArray.reduce(((accumulatedSums, currentElement, index) => {
            accumulatedSums.push(currentElement + accumulatedSums[index]);
            return accumulatedSums;
        }), [0]));
    }

    /**
     * Generates an array of differences between adjacent elements in the input array.
     * @param {Array<number>} sourceArray - The input array.
     * @returns {Array<number>} An array where each element is the difference between an element and its predecessor (e.g., [arr[1]-arr[0], ...]).
     */
    computeDifferenceArray(sourceArray) {
        const differences = [];
        for (let k = 1; k < sourceArray.length; ++k) {
            differences.push(sourceArray[k] - sourceArray[k - 1]);
        }
        return differences;
    }

    /**
     * Executes a binary search on a sorted array to find the appropriate insertion point for a given key.
     * This method returns the index of the first element that is greater than or equal to the search key.
     * @param {Array<any>} sortedCollection - The array to perform the search on (must be pre-sorted).
     * @param {any} targetKey - The value for which to find the insertion point.
     * @param {string} [propertyAccessor] - An optional string representing the property name to access if array elements are objects.
     * @returns {number} The index where the `targetKey` could be inserted to maintain the sorted order.
     */
    findInsertionPoint(sortedCollection, targetKey, propertyAccessor) {
        const getValue = (item) => (typeof item === 'object' && propertyAccessor) ? item[propertyAccessor] : item;
        const lookupValue = getValue(targetKey);
        let lowerBound = 0,
            upperBound = sortedCollection.length;
        while (lowerBound < upperBound) {
            let midIndex = Math.floor((lowerBound + upperBound) / 2);
            if (getValue(sortedCollection[midIndex]) < lookupValue) lowerBound = midIndex + 1;
            else upperBound = midIndex;
        }
        return lowerBound;
    }

    /**
     * Performs a circular rotation on an array by a specified number of positions.
     * A positive `shiftAmount` moves elements from the end to the beginning (right rotation).
     * A negative `shiftAmount` moves elements from the beginning to the end (left rotation).
     * @param {Array<any>} originalArray - The array to be rotated.
     * @param {number} shiftAmount - The number of positions to shift the elements.
     * @returns {Array<any>} A new array representing the rotated version of the original array.
     */
    circularShift(originalArray, shiftAmount) {
        let normalizedShift = shiftAmount % originalArray.length;
        if (normalizedShift < 0) {
            normalizedShift += originalArray.length;
        }
        return originalArray.slice(normalizedShift).concat(originalArray.slice(0, normalizedShift));
    }
}
const utilityTool = new UtilityToolkit(); // Create a global instance of the utility toolkit.

// A class dedicated to handling input operations from standard input.
class DataAcquisition {
    /**
     * Initializes the data acquisition system, preparing to read input.
     */
    constructor() {
        this.currentLinePointer = 0; // Pointer to the next line to be read.
        this.readAllInput();
    }

    /**
     * Reads all available input lines from the standard input stream.
     * @returns {Array<string>} An array where each element is a line from the input.
     */
    readAllInput() {
        this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
        return this.inputLines;
    }

    /**
     * Fetches one or more lines from the input data.
     * @param {number} [linesToRetrieve] - The number of lines to fetch. If omitted, only one line is fetched.
     * @returns {string|Array<string>} A single string line or an array of string lines.
     */
    fetchNextLine(linesToRetrieve) {
        if (linesToRetrieve) {
            const retrievedChunk = this.inputLines.slice(this.currentLinePointer, this.currentLinePointer + linesToRetrieve);
            this.currentLinePointer += linesToRetrieve;
            return retrievedChunk;
        }
        return this.inputLines[this.currentLinePointer++];
    }

    /**
     * Fetches the subsequent line and converts it into an integer.
     * @returns {number} The parsed integer value.
     */
    fetchNextInteger() {
        return parseInt(this.fetchNextLine());
    }

    /**
     * Fetches the subsequent line, splits it by spaces, and returns the result as an array of strings.
     * @returns {Array<string>} An array of string tokens.
     */
    fetchNextStringArray() {
        return this.fetchNextLine().split(' ');
    }

    /**
     * Fetches the subsequent line, splits it by spaces, and parses each token as an integer.
     * @returns {Array<number>} An array of integer values.
     */
    fetchNextIntegerArray() {
        return this.fetchNextStringArray().map((token) => parseInt(token));
    }

    /**
     * Fetches the subsequent line, splits it by spaces, and parses each token as a floating-point number.
     * @returns {Array<number>} An array of floating-point values.
     */
    fetchNextFloatArray() {
        return this.fetchNextStringArray().map((token) => parseFloat(token));
    }

    /**
     * Fetches a specified number of lines and parses each line as an integer.
     * @param {number} count - The number of lines to fetch and parse.
     * @returns {Array<number>} An array of integers, one for each fetched line.
     */
    fetchIntegerLines(count) {
        return this.fetchNextLine(count).map((lineContent) => parseInt(lineContent));
    }

    /**
     * Fetches a specified number of lines and parses each line as a floating-point number.
     * @param {number} count - The number of lines to fetch and parse.
     * @returns {Array<number>} An array of floats, one for each fetched line.
     */
    fetchFloatLines(count) {
        return this.fetchNextLine(count).map((lineContent) => parseFloat(lineContent));
    }

    /**
     * Fetches multiple lines and processes each into an array of strings (a string matrix).
     * @param {number} count - The number of lines to fetch.
     * @returns {Array<Array<string>>} A 2D array where each inner array represents tokens from a line.
     */
    fetchStringMatrix(count) {
        return this.fetchNextLine(count).map((lineContent) => lineContent.split(' '));
    }

    /**
     * Fetches multiple lines, splits each line by spaces, and parses the tokens as integers (an integer matrix).
     * @param {number} count - The number of lines to fetch.
     * @returns {Array<Array<number>>} A 2D array where each inner array contains integers from a line.
     */
    fetchIntegerMatrix(count) {
        return this.fetchNextLine(count).map((lineContent) => lineContent.split(' ').map((token) => parseInt(token)));
    }

    /**
     * Fetches multiple lines, splits each line by spaces, and parses the tokens as floating-point numbers (a float matrix).
     * @param {number} count - The number of lines to fetch.
     * @returns {Array<Array<number>>} A 2D array where each inner array contains floats from a line.
     */
    fetchFloatMatrix(count) {
        return this.fetchNextLine(count).map((lineContent) => lineContent.split(' ').map((token) => parseFloat(token)));
    }
}
const dataReader = new DataAcquisition(); // Instantiate the global data reader.

// A dedicated function to manage and format the program's output.
const DisplayResult = (simulationOutcome) => {
    let outputString;
    if (simulationOutcome == null) { // If there's no result to display, the function exits.
        return;
    }
    if (simulationOutcome === true) {
        outputString = 'Yes';
    } else if (simulationOutcome === false) {
        outputString = 'No';
    } else {
        outputString = simulationOutcome;
    }
    console.log(outputString); // Prints the prepared string to the console.
};

// Initiate the simulation by creating a new `SimulationCore` instance and executing its main method,
// then display the computed outcome.
DisplayResult(new SimulationCore().executeSimulation());
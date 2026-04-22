// A constant defining the standard input stream path for system operations.
const SYSTEM_INPUT_FILE_PATH = "/dev/stdin";

/**
 * Encapsulates the logic for simulating ant movements on a circular track.
 * This class determines the final positions of ants after a given time,
 * accounting for their interactions and relative order changes.
 */
class AntSimulator {
    /**
     * Initiates and runs the ant simulation.
     * @returns {string} A string containing the final positions of all ants,
     *                   each on a new line, sorted by their final order.
     */
    executeSimulation() {
        // Parse the initial simulation parameters: total ants, track circumference, and elapsed time.
        const simulationParameters = SYSTEM_INPUT_PARSER.fetchIntegerArray();
        const totalAntCount = simulationParameters[0];
        const trackCircumference = simulationParameters[1];
        const elapsedTime = simulationParameters[2];

        // Perform a basic validation on the track length to ensure meaningful calculations.
        if (trackCircumference <= 0) {
            throw new Error("Simulation error: Track circumference must be a positive value.");
        }

        // Read the initial state for each ant: its starting coordinate and movement direction.
        // Direction '1' implies clockwise movement, '-1' implies counter-clockwise.
        const initialAntStates = SYSTEM_INPUT_PARSER.fetchIntegerMatrix(totalAntCount);

        // First, calculate each ant's position assuming no collisions (ants pass through each other).
        // The `+ 2 * trackCircumference` ensures that the modulo operator always yields a non-negative result.
        const nonCollisionEndPositions = initialAntStates.map(antData => {
            const currentAntPosition = antData[0];
            const antMovementDirection = antData[1];
            // Calculate the raw displacement based on direction and time.
            const totalDisplacement = antMovementDirection === 1 ? elapsedTime : -elapsedTime;
            // Apply displacement and wrap around the track.
            return (currentAntPosition + totalDisplacement + (2 * trackCircumference)) % trackCircumference;
        });

        // Next, determine the overall shift in the relative order of ants due to actual collisions.
        // This is calculated by observing how many times the first ant effectively "crosses" other ants.
        let cumulativeOrderShift = 0;
        const firstAntInitialState = initialAntStates[0];
        const firstAntDirection = firstAntInitialState[1];

        // Iterate through all ants, starting from the second one, to compare with the first ant.
        for (let otherAntIndex = 1; otherAntIndex < totalAntCount; ++otherAntIndex) {
            const otherAntState = initialAntStates[otherAntIndex];
            const otherAntDirection = otherAntState[1];

            // If two ants move in the same direction, their relative order never changes; they don't "collide" in this context.
            if (firstAntDirection === otherAntDirection) {
                continue;
            }

            // Calculate the initial relative distance between the first ant and the current 'other' ant.
            // This distance needs to be considered in the context of their opposing movements.
            let initialRelativeSeparation;
            if (firstAntDirection === 1) { // If the first ant moves clockwise (right)
                // Distance from first ant to other ant, in clockwise direction.
                initialRelativeSeparation = otherAntState[0] - firstAntInitialState[0];
            } else { // If the first ant moves counter-clockwise (left)
                // Distance from first ant to other ant, in counter-clockwise direction.
                initialRelativeSeparation = (trackCircumference - otherAntState[0]) + firstAntInitialState[0];
            }

            // Ensure the relative separation is positive and within the track bounds.
            if (initialRelativeSeparation < 0) {
                initialRelativeSeparation += trackCircumference;
            }

            // When two ants move towards each other, their relative speed is effectively 2 units/second.
            // Over time 'T', their combined relative travel distance is '2 * T'.
            // We calculate how many times this relative travel "wraps" around the track length
            // to determine the number of effective collisions/order changes.
            const totalRelativeMovementDistance = 2 * elapsedTime;
            const numberOfWraps = Math.floor((totalRelativeMovementDistance - initialRelativeSeparation + trackCircumference) / trackCircumference);
            
            cumulativeOrderShift = (cumulativeOrderShift + numberOfWraps) % totalAntCount;
        }

        // Apply the calculated order shift to the theoretical final positions.
        // This re-maps each ant's final position to its correct logical index after collisions.
        const finalAntOrderMapping = nonCollisionEndPositions.map((finalCoordinate, originalAntLogicalIndex) => {
            let effectiveFinalIndex;
            if (firstAntDirection === 1) { // If the first ant moved right, the order shifts cyclically forward.
                effectiveFinalIndex = (originalAntLogicalIndex + cumulativeOrderShift + totalAntCount) % totalAntCount;
            } else { // If the first ant moved left, the order shifts cyclically backward.
                effectiveFinalIndex = (originalAntLogicalIndex - cumulativeOrderShift + totalAntCount) % totalAntCount;
            }
            return [effectiveFinalIndex, finalCoordinate];
        });

        // Sort the ants based on their new logical indices to get the final ordered sequence of positions.
        finalAntOrderMapping.sort((antA, antB) => antA[0] - antB[0]);

        // Extract only the final coordinates and format them as a newline-separated string for output.
        return finalAntOrderMapping.map(antEntry => antEntry[1]).join('\n');
    }
}

/**
 * Provides mathematical operations within a finite field (modulo arithmetic).
 * Useful for problems involving large numbers where results need to be contained
 * within a specific range, preventing overflow and ensuring correctness.
 */
class ModularArithmeticCalculator {
    /**
     * Initializes the modular calculator with a specific modulus.
     * @param {number} modulusValue The positive integer modulus for all operations.
     */
    constructor(modulusValue) {
        // Set a default modulus if none is provided, common in competitive programming.
        this.baseModulus = modulusValue == null ? 1000000007 : Number(modulusValue);
        // Validate the modulus to ensure it's a valid positive number.
        if (isNaN(this.baseModulus) || this.baseModulus <= 0) {
             throw new Error("ModularArithmeticCalculator: Invalid modulus provided. Must be a positive number.");
        }
    }

    /**
     * Computes the modular product of two numbers: (operandA * operandB) % modulus.
     * Uses BigInt to safely handle intermediate products that might exceed JavaScript's
     * standard number precision before applying the modulo.
     * @param {number} operandA The first number.
     * @param {number} operandB The second number.
     * @returns {number} The result of the modular multiplication.
     */
    multiplyModulo(operandA, operandB) {
        // Convert operands and modulus to BigInt for high-precision multiplication.
        const bigA = BigInt(operandA);
        const bigB = BigInt(operandB);
        const bigMod = BigInt(this.baseModulus);
        // Perform multiplication and modulo, then convert back to standard number.
        return Number((bigA * bigB) % bigMod);
    }

    /**
     * Computes modular exponentiation: (base ^ exponent) % modulus.
     * This method uses the "binary exponentiation" or "exponentiation by squaring" algorithm
     * for efficient calculation, especially with large exponents.
     * @param {number} baseValue The base number.
     * @param {number} exponentValue The exponent.
     * @returns {number} The result of the modular exponentiation.
     */
    powerModulo(baseValue, exponentValue) {
        let resultAccumulator = 1;
        // Ensure the base is within the modulus range from the start.
        let currentBaseTerm = this.multiplyModulo(baseValue, 1);
        let currentExponent = exponentValue;

        // Loop until the exponent is reduced to zero.
        while (currentExponent > 0) {
            // If the current exponent bit is 1 (i.e., exponent is odd),
            // incorporate the current base term into the result.
            if (currentExponent % 2 === 1) {
                resultAccumulator = this.multiplyModulo(resultAccumulator, currentBaseTerm);
            }
            // Square the base term for the next iteration.
            currentBaseTerm = this.multiplyModulo(currentBaseTerm, currentBaseTerm);
            // Halve the exponent (integer division).
            currentExponent = Math.floor(currentExponent / 2);
        }
        return resultAccumulator;
    }
}
const GLOBAL_MATH_CONTEXT = new ModularArithmeticCalculator(1000000007);

/**
 * A comprehensive collection of utility functions for common array manipulations,
 * mathematical operations, and data processing.
 */
class ArrayAndDataUtilities {
    /**
     * Computes the sum of all numerical elements within an array.
     * Handles empty arrays by returning 0.
     * @param {number[]} numericData The array of numbers.
     * @returns {number} The total sum.
     */
    calculateArraySum(numericData) {
        if (!Array.isArray(numericData) || numericData.length === 0) return 0;
        return numericData.reduce((acc, val) => acc + val, 0);
    }

    /**
     * Computes the sum of all numerical elements in an array, applying a modulus.
     * @param {number[]} numericData The array of numbers.
     * @param {number} [modulusValue] An optional modulus. Defaults to GLOBAL_MATH_CONTEXT's modulus.
     * @returns {number} The modular sum.
     */
    calculateModularSum(numericData, modulusValue) {
        const activeModulus = modulusValue ?? GLOBAL_MATH_CONTEXT.baseModulus;
        if (!Array.isArray(numericData) || numericData.length === 0) return 0;
        return numericData.reduce((acc, val) => (acc + val) % activeModulus, 0);
    }

    /**
     * Identifies the minimum element in an array using an optional comparison callback.
     * @param {Array<any>} dataElements The array to search.
     * @param {Function} [comparisonFunction] A function (a, b) => number, similar to `Array.prototype.sort`.
     * @returns {any|undefined} The minimum element, or `undefined` for an empty array.
     */
    findArrayMinimum(dataElements, comparisonFunction = (a, b) => a - b) {
        if (!Array.isArray(dataElements) || dataElements.length === 0) return undefined;
        return dataElements.reduce((minElement, currentElement) =>
            comparisonFunction(minElement, currentElement) < 0 ? minElement : currentElement
        );
    }

    /**
     * Identifies the maximum element in an array using an optional comparison callback.
     * @param {Array<any>} dataElements The array to search.
     * @param {Function} [comparisonFunction] A function (a, b) => number.
     * @returns {any|undefined} The maximum element, or `undefined` for an empty array.
     */
    findArrayMaximum(dataElements, comparisonFunction = (a, b) => a - b) {
        if (!Array.isArray(dataElements) || dataElements.length === 0) return undefined;
        return dataElements.reduce((maxElement, currentElement) =>
            comparisonFunction(maxElement, currentElement) > 0 ? maxElement : currentElement
        );
    }

    /**
     * Sorts an array in-place using an optional custom comparison function.
     * @param {Array<any>} dataElements The array to sort.
     * @param {Function} [comparisonFunction] A function (a, b) => number.
     * @returns {Array<any>} The sorted array (reference to the original array).
     */
    sortArrayInPlace(dataElements, comparisonFunction = (a, b) => a - b) {
        if (!Array.isArray(dataElements)) return [];
        return dataElements.sort(comparisonFunction);
    }

    /**
     * Generates an array of numbers within a specified range.
     * @param {number} [startPoint=0] The starting value (inclusive).
     * @param {number} endPoint The ending value (exclusive if step is positive, inclusive if negative).
     * @param {number} [stepAmount] The increment/decrement step. Defaults to 1 or -1.
     * @returns {number[]} An array of numbers.
     */
    generateNumericRange(startPoint, endPoint, stepAmount) {
        let currentStart = startPoint;
        let currentEnd = endPoint;
        let currentStep = stepAmount;

        // Handle flexible parameter signatures (e.g., `range(5)` means `[0,1,2,3,4]`).
        if (currentEnd === undefined) {
            currentEnd = currentStart || 0;
            currentStart = 0;
        }
        if (currentStep === undefined) {
            currentStep = currentEnd < currentStart ? -1 : 1;
        }

        const calculatedLength = Math.max(Math.ceil((currentEnd - currentStart) / currentStep), 0);
        const sequenceArray = Array(calculatedLength);

        for (let k = 0; k < calculatedLength; k++, currentStart += currentStep) {
            sequenceArray[k] = currentStart;
        }
        return sequenceArray;
    }

    /**
     * Retrieves the first 'count' elements from an array.
     * @param {Array<any>} sourceArray The array.
     * @param {number} [count] The number of elements to get. If omitted, returns the first single element.
     * @returns {any|Array<any>} A single element or an array of elements.
     */
    retrieveFirstElements(sourceArray, count) {
        if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
            return count == null ? undefined : [];
        }
        if (count == null) return sourceArray[0];
        return sourceArray.slice(0, Math.max(0, count));
    }

    /**
     * Retrieves all elements of an array except the last 'numToRemove' elements.
     * @param {Array<any>} sourceArray The array.
     * @param {number} [numToRemove=1] The number of elements to exclude from the end.
     * @returns {Array<any>} A new array with the initial elements.
     */
    getInitialSlice(sourceArray, numToRemove = 1) {
        if (!Array.isArray(sourceArray)) return [];
        return sourceArray.slice(0, Math.max(0, sourceArray.length - numToRemove));
    }

    /**
     * Retrieves all elements of an array except the first 'numToSkip' elements.
     * @param {Array<any>} sourceArray The array.
     * @param {number} [numToSkip=1] The number of elements to exclude from the beginning.
     * @returns {Array<any>} A new array with the tail elements.
     */
    getTailSlice(sourceArray, numToSkip = 1) {
        if (!Array.isArray(sourceArray)) return [];
        return sourceArray.slice(Math.max(0, numToSkip));
    }

    /**
     * Retrieves the last 'count' elements from an array.
     * @param {Array<any>} sourceArray The array.
     * @param {number} [count] The number of elements to get. If omitted, returns the last single element.
     * @returns {any|Array<any>} A single element or an array of elements.
     */
    retrieveLastElements(sourceArray, count) {
        if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
            return count == null ? undefined : [];
        }
        if (count == null) return sourceArray[sourceArray.length - 1];
        return this.getTailSlice(sourceArray, Math.max(0, sourceArray.length - count));
    }

    /**
     * Computes the prefix sums (cumulative sums) of a numeric array.
     * The result array `R` has `R[i] = sum(array[0]...array[i])`.
     * @param {number[]} numericData The input array.
     * @returns {number[]} An array of prefix sums.
     */
    computeCumulativeSums(numericData) {
        if (!Array.isArray(numericData)) return [];
        const cumulativeSums = [];
        let currentSum = 0;
        for (const value of numericData) {
            currentSum += value;
            cumulativeSums.push(currentSum);
        }
        return cumulativeSums;
    }

    /**
     * Computes the differences between adjacent elements in a numeric array.
     * The result array `R` has `R[i] = array[i+1] - array[i]`.
     * @param {number[]} numericData The input array.
     * @returns {number[]} An array of differences.
     */
    computeAdjacentDifferences(numericData) {
        const differences = [];
        if (!Array.isArray(numericData) || numericData.length < 2) return differences;
        for (let k = 1; k < numericData.length; ++k) {
            differences.push(numericData[k] - numericData[k - 1]);
        }
        return differences;
    }

    /**
     * Performs a binary search on a sorted array to find the insertion point for a value.
     * This returns the index where `searchValue` would be inserted to maintain the array's sort order.
     * @param {Array<any>} sortedArray The array to search (must be sorted).
     * @param {any} searchValue The value whose insertion point is sought.
     * @param {string|Function} [valueExtractor] A property name string or a function to get the comparable value from array elements.
     * @returns {number} The index (0-based) where the value should be inserted.
     */
    findInsertionPointBinary(sortedArray, searchValue, valueExtractor) {
        if (!Array.isArray(sortedArray)) return 0;

        // Helper function to extract the comparable value from an element.
        const getComparableValue = (element) => {
            if (typeof valueExtractor === 'string') return element[valueExtractor];
            if (typeof valueExtractor === 'function') return valueExtractor(element);
            return element;
        };

        const targetComparableValue = getComparableValue(searchValue);
        let lowerBound = 0;
        let upperBound = sortedArray.length; // Exclusive upper bound

        while (lowerBound < upperBound) {
            const midIndex = Math.floor((lowerBound + upperBound) / 2);
            if (getComparableValue(sortedArray[midIndex]) < targetComparableValue) {
                lowerBound = midIndex + 1;
            } else {
                upperBound = midIndex;
            }
        }
        return lowerBound;
    }
}
const COMMON_UTILITIES = new ArrayAndDataUtilities();

/**
 * Manages reading and parsing input data from a specified source (typically stdin).
 * Provides methods to fetch various data types (integers, strings, arrays, matrices).
 */
class InputDataSourceParser {
    constructor() {
        this.currentLineIndex = 0; // Tracks the current line being read.
        // Read all input lines once upon instantiation for efficiency.
        this.rawInputLines = this.readAllInputData();
    }

    /**
     * Reads the entire content from the standard input file and splits it into lines.
     * @returns {string[]} An array where each element is a line from the input.
     */
    readAllInputData() {
        try {
            // Node.js specific: use 'fs' module to read from the file system.
            return require("fs").readFileSync(SYSTEM_INPUT_FILE_PATH, "utf8").split('\n');
        } catch (error) {
            console.error(`Failed to read input from ${SYSTEM_INPUT_FILE_PATH}: ${error.message}`);
            // In case of an error, return an empty array to prevent further processing issues.
            return [];
        }
    }

    /**
     * Retrieves one or more lines from the parsed input data.
     * @param {number} [countOfLines] The number of lines to retrieve. If omitted, fetches a single line.
     * @returns {string|string[]|undefined} A single line string, an array of line strings, or `undefined` if no more lines.
     */
    fetchNextLine(countOfLines) {
        if (countOfLines !== undefined) {
            // Calculate the end index, ensuring it doesn't exceed the available lines.
            const endIndex = Math.min(this.currentLineIndex + countOfLines, this.rawInputLines.length);
            const retrievedLines = this.rawInputLines.slice(this.currentLineIndex, endIndex);
            this.currentLineIndex = endIndex; // Update the pointer.
            return retrievedLines;
        }
        // If no count is specified, fetch a single line.
        if (this.currentLineIndex >= this.rawInputLines.length) {
            return undefined; // Indicate end of input.
        }
        return this.rawInputLines[this.currentLineIndex++];
    }

    /**
     * Parses the next available line as an integer.
     * @returns {number} The parsed integer, or `NaN` if the line is not available or not a valid number.
     */
    parseNextInteger() {
        const line = this.fetchNextLine();
        return line !== undefined ? parseInt(line, 10) : NaN;
    }

    /**
     * Parses the next line into an array of strings, using space as a delimiter.
     * @returns {string[]} An array of strings. Returns an empty array if no line is available.
     */
    getStringArray() {
        const line = this.fetchNextLine();
        return line !== undefined ? line.split(' ') : [];
    }

    /**
     * Parses the next line into an array of integers.
     * @returns {number[]} An array of integers.
     */
    fetchIntegerArray() {
        return this.getStringArray().map(str => parseInt(str, 10));
    }

    /**
     * Parses the next line into an array of floating-point numbers.
     * @returns {number[]} An array of floating-point numbers.
     */
    fetchFloatArray() {
        return this.getStringArray().map(str => parseFloat(str));
    }

    /**
     * Fetches a specified number of lines and parses each into an integer.
     * @param {number} count The number of lines to parse.
     * @returns {number[]} An array of integers. Returns an empty array if `lines` is not an array.
     */
    fetchIntegerLines(count) {
        const lines = this.fetchNextLine(count);
        return Array.isArray(lines) ? lines.map(line => parseInt(line, 10)) : [];
    }

    /**
     * Fetches a specified number of lines and parses each into a floating-point number.
     * @param {number} count The number of lines to parse.
     * @returns {number[]} An array of floating-point numbers.
     */
    fetchFloatLines(count) {
        const lines = this.fetchNextLine(count);
        return Array.isArray(lines) ? lines.map(line => parseFloat(line)) : [];
    }

    /**
     * Fetches a specified number of lines and splits each line into an array of strings,
     * forming a 2D array (matrix) of strings.
     * @param {number} count The number of lines to fetch.
     * @returns {string[][]} A 2D array of strings.
     */
    fetchStringMatrix(count) {
        const lines = this.fetchNextLine(count);
        return Array.isArray(lines) ? lines.map(line => line.split(' ')) : [];
    }

    /**
     * Fetches a specified number of lines and parses each line into an array of integers,
     * forming a 2D array (matrix) of integers.
     * @param {number} count The number of lines to fetch.
     * @returns {number[][]} A 2D array of integers.
     */
    fetchIntegerMatrix(count) {
        const lines = this.fetchNextLine(count);
        return Array.isArray(lines) ? lines.map(line => line.split(' ').map(str => parseInt(str, 10))) : [];
    }

    /**
     * Fetches a specified number of lines and parses each line into an array of floating-point numbers,
     * forming a 2D array (matrix) of floats.
     * @param {number} count The number of lines to fetch.
     * @returns {number[][]} A 2D array of floating-point numbers.
     */
    fetchFloatMatrix(count) {
        const lines = this.fetchNextLine(count);
        return Array.isArray(lines) ? lines.map(line => line.split(' ').map(str => parseFloat(str))) : [];
    }
}
const SYSTEM_INPUT_PARSER = new InputDataSourceParser();

/**
 * A utility function to display output to the console.
 * It handles various data types and formats boolean values specifically.
 * @param {any} contentToDisplay The data to be printed to the console.
 */
const outputToConsole = (contentToDisplay) => {
    let finalFormattedOutput;
    // Explicitly handle null or undefined results, typically by not printing anything or an empty line.
    if (contentToDisplay === undefined || contentToDisplay === null) {
        return;
    } else if (typeof contentToDisplay === 'boolean') {
        // Convert boolean values to 'Yes' or 'No' strings.
        finalFormattedOutput = contentToDisplay ? 'Yes' : 'No';
    } else if (typeof contentToDisplay === 'object' && contentToDisplay.toString) {
        // For objects (including arrays), use their toString method if available.
        finalFormattedOutput = contentToDisplay.toString();
    } else {
        // For all other types, coerce to a string.
        finalFormattedOutput = String(contentToDisplay);
    }
    console.log(finalFormattedOutput);
};

// Instantiate the ant simulation engine and execute the main process.
// Then, display the computed result to the standard output.
outputToConsole(new AntSimulator().executeSimulation());
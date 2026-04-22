var INPUT_HANDLER = (function() {

    /**
     * Factory function to create an input parsing utility.
     * It takes the raw input string and prepares it for sequential reading.
     * @param {string} sourceString - The complete text content to be processed.
     * @returns {InputReader} An instance capable of reading structured input.
     */
    function createInputProcessor(sourceString) {
        return new InputReader(sourceString);
    }

    /**
     * @class InputReader
     * @description A class designed to manage and extract data from a multi-line string input.
     * @param {string} rawSource - The unprocessed string containing all input data.
     */
    function InputReader(rawSource) {
        // Internal array holding each line of the input, trimmed to remove outer whitespace.
        this._sourceLines = rawSource.trim().split("\n");
        // Index indicating the current line being processed.
        this._currentLineIdx = 0;
    }

    /**
     * Retrieves the next available item from the current line. Items are assumed to be space-separated.
     * It processes lines from right-to-left for efficiency in popping.
     * @param {boolean} [returnAsString=false] - If true, the item is returned as a string; otherwise, it's converted to a number.
     * @returns {(string|number)} The extracted item.
     */
    InputReader.prototype.retrieveNextItem = function(returnAsString) {
        let lineData = this._sourceLines,
            currentIdx = this._currentLineIdx,
            retrievedValue;

        // If the current line is still a single string, split it into an array of items and reverse it.
        // Reversing allows `pop()` to get items in their original order.
        if (typeof lineData[currentIdx] === "string") {
            lineData[currentIdx] = lineData[currentIdx].split(" ").reverse();
        }

        // Extract the last item from the (reversed) current line.
        retrievedValue = lineData[currentIdx].pop();

        // If the current line is now empty after popping, advance to the next line.
        if (!lineData[currentIdx].length) {
            this._currentLineIdx++;
        }

        // Return the value, converting to a number if not explicitly requested as a string.
        return returnAsString ? retrievedValue : +retrievedValue;
    };

    /**
     * Reads the entire next line, splits it by spaces, and returns the resulting array of items.
     * @param {boolean} [returnAsStrings=false] - If true, items are returned as strings; otherwise, they are mapped to numbers.
     * @returns {Array<(string|number)>} An array containing all items from the next line.
     */
    InputReader.prototype.readNextLine = function(returnAsStrings) {
        // Fetch the current line, split by space, and then increment the line index.
        let lineContent = this._sourceLines[this._currentLineIdx++].split(" ");

        // Return the array, with items optionally converted to numbers.
        return returnAsStrings ? lineContent : lineContent.map(val => +val);
    };

    /**
     * Reads a specified number of lines, treating each as a row in a matrix,
     * splitting each row by spaces, and returning a 2D array.
     * @param {number} numRows - The count of lines (rows) to read for the matrix.
     * @param {boolean} [returnRaw=false] - If true, items are returned as strings; otherwise, they are mapped to numbers.
     * @returns {Array<Array<(string|number)>>} A matrix (array of arrays) of parsed values.
     */
    InputReader.prototype.readMatrix = function(numRows, returnRaw) {
        // Slice the source lines to get the desired number of rows, then process each row.
        let resultMatrix = this._sourceLines.slice(this._currentLineIdx, this._currentLineIdx += numRows)
                                            .map(rowStr => rowStr.split(" "));

        // Return the matrix, with all nested items optionally converted to numbers.
        return returnRaw ? resultMatrix : resultMatrix.map(row => row.map(item => +item));
    };

    /**
     * Reads a specified number of lines directly, without splitting them, returning an array of raw line strings.
     * @param {number} lineCount - The quantity of lines to extract.
     * @param {boolean} [keepStrings=false] - If true, lines are returned as raw strings; otherwise, they are mapped to numbers.
     * @returns {Array<(string|number)>} An array where each element is a full line.
     */
    InputReader.prototype.readBlock = function(lineCount, keepStrings) {
        // Directly extract a block of lines from the source.
        let extractedBlock = this._sourceLines.slice(this._currentLineIdx, this._currentLineIdx += lineCount);

        // Return the block, with each line optionally converted to a number.
        return keepStrings ? extractedBlock : extractedBlock.map(lineTxt => +lineTxt);
    };

    // The module exposes only the factory function to create input processors.
    return createInputProcessor;
})();


// Instantiate the input processor by reading the entire content of standard input.
var processorInstance = INPUT_HANDLER(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 * Dynamically constructs and initializes a multi-dimensional array.
 * @param {*} initialValue - The default value to fill the array elements with.
 * @param {...number} dimensions - A sequence of numbers defining the size of each dimension.
 * @returns {Array} A new multi-dimensional array structured according to the given dimensions.
 */
function buildMultiDimArray(initialValue) {
    let dimensionArgs = arguments,
        argCount = dimensionArgs.length,
        // Start building the string representation for the innermost array.
        arrayCreationString = "Array(dimensionArgs[" + --argCount + "]).fill(0).map(x => { return " + initialValue + "; })";

    // Loop backwards through dimensions to wrap the array creation string for outer dimensions.
    while (--argCount) {
        arrayCreationString = "Array(dimensionArgs[" + argCount + "]).fill(0).map(x => " + arrayCreationString + ")";
    }

    // Use eval to execute the dynamically generated string and create the array.
    return eval(arrayCreationString);
}


// A large prime number used as the modulus for all modular arithmetic operations.
const primeModulus = 1_000_003;


/**
 * Performs modular multiplication for an arbitrary number of operands.
 * It uses a technique to prevent intermediate overflow by splitting numbers into high/low parts.
 * @param {...number} operands - The numbers to be multiplied.
 * @returns {number} The product of all operands, modulo `primeModulus`.
 */
function performModMultiplication() {
    var operands = arguments,
        currentProduct = operands[0],
        argIndex = 1;

    // Iterate through the remaining operands.
    while (argIndex < operands.length) {
        // This calculation splits the current product into two parts (high 16 bits and low 16 bits)
        // to perform multiplication, reducing the chance of overflow before the modulo operation.
        currentProduct = (
            ( (currentProduct >>> 16) * operands[argIndex] % primeModulus * 65_536 ) +
            ( (currentProduct & 65_535) * operands[argIndex++] )
        ) % primeModulus;
    }
    return currentProduct;
}


// An array to store precomputed factorial values for quick lookup.
var cachedFactorials = [1, 1];


/**
 * Precomputes and caches factorial values up to a specified limit, modulo `primeModulus`.
 * This function modifies the `cachedFactorials` array.
 * @param {number} limitValue - The maximum number for which to calculate and store the factorial.
 */
function precomputeFactorials(limitValue) {
    // Start from 2 because 0! and 1! are already initialized.
    for (var loopCounter = 2; loopCounter <= limitValue; ) {
        cachedFactorials[loopCounter] = performModMultiplication(cachedFactorials[loopCounter - 1], loopCounter++);
    }
}


/**
 * Computes the modular multiplicative inverse of a number 'numerator' modulo `primeModulus`.
 * This is done using the Extended Euclidean Algorithm.
 * @param {number} numerator - The number whose inverse is to be found.
 * @returns {number} The modular inverse of 'numerator' modulo `primeModulus`.
 */
function calculateModInverse(numerator) {
    var denominator = primeModulus,
        tempU = 1,
        tempV = 0,
        tempVal; // Temporary variable for swaps and intermediate calculations.

    // The Extended Euclidean Algorithm to find 'u' such that (numerator * u) % primeModulus = 1.
    while (denominator) {
        tempVal = numerator / denominator | 0; // Integer division.
        numerator -= tempVal * denominator;
        tempU -= tempVal * tempV;

        // Perform simultaneous swaps.
        tempVal = numerator;
        numerator = denominator;
        denominator = tempVal;

        tempVal = tempU;
        tempU = tempV;
        tempV = tempVal;
    }

    // Ensure the resulting inverse is positive.
    tempU %= primeModulus;
    return tempU < 0 ? tempU + primeModulus : tempU;
}


/**
 * Calculates the number of permutations (nPr) modulo `primeModulus`.
 * nPr = n! / (n-r)! = n! * ( (n-r)! )^-1 mod `primeModulus`.
 * @param {number} totalItems - The total count of items (n).
 * @param {number} itemsToChoose - The number of items to select (r).
 * @returns {number} The result of nPr modulo `primeModulus`.
 */
function calculatePermutationMod(totalItems, itemsToChoose) {
    // Uses precomputed factorials and modular inverse.
    // (totalItems - itemsToChoose + primeModulus) % primeModulus ensures the index is positive before lookup.
    return performModMultiplication(
        cachedFactorials[totalItems],
        calculateModInverse(cachedFactorials[(totalItems - itemsToChoose + primeModulus) % primeModulus])
    );
}


/**
 * Computes modular exponentiation (baseVal ^ exponentVal) modulo `primeModulus` using binary exponentiation.
 * This method efficiently calculates large powers by repeatedly squaring the base.
 * @param {number} baseVal - The base number.
 * @param {number} exponentVal - The exponent.
 * @returns {number} (baseVal ^ exponentVal) % primeModulus.
 */
function calculateModPower(baseVal, exponentVal) {
    var resultVal = 1;
    // Loop while the exponent is greater than zero.
    while (exponentVal) {
        // If the least significant bit of the exponent is 1, multiply result by current baseVal.
        if (exponentVal & 0x1) { // Using hexadecimal literal for 1.
            resultVal = performModMultiplication(baseVal, resultVal);
        }
        // Square the base and half the exponent.
        baseVal = performModMultiplication(baseVal, baseVal);
        exponentVal >>= 0x1; // Right shift by 1, equivalent to integer division by 2.
    }
    return resultVal;
}


// Execute the main program logic and output the final result to the console.
console.log(executeMainLogic());


/**
 * The main entry point for the program's logic.
 * It reads a series of queries, performs calculations based on specific conditions
 * involving modular arithmetic, and aggregates the results.
 * @returns {string} A string where each calculated answer is separated by a newline.
 */
function executeMainLogic() {
    // Read the total number of queries from the input.
    var queryCount = processorInstance.retrieveNextItem();
    // Initialize an array to hold the answers for each query, pre-filled with zeros.
    var finalResults = Array(queryCount).fill(0);

    // Precompute factorials up to the prime modulus. This is essential for permutation calculations.
    precomputeFactorials(primeModulus);

    // Iterate through each query to process it.
    for (var loopIter = 0; loopIter < queryCount; loopIter++) {
        // Read the three parameters (x, d, n) for the current query.
        var currentQueryData = processorInstance.readNextLine(),
            baseX = currentQueryData[0],
            diffD = currentQueryData[1],
            powerN = currentQueryData[2];

        // Special handling: if 'n' is greater than or equal to the prime modulus,
        // it often implies a result of 0 in combinatorics problems involving factorials modulo a prime.
        // For example, N! mod P = 0 if N >= P.
        if (powerN >= primeModulus) {
            continue; // The answer for this query remains 0, as initialized.
        }

        // Case 1: If 'd' is zero.
        if (diffD === 0x0) { // Using hexadecimal literal for 0.
            finalResults[loopIter] = calculateModPower(baseX, powerN);
        } else {
            // Case 2: If 'd' is non-zero.
            // This involves a more complex calculation using modular inverse and permutations.
            // The intermediate 'intermediateA' is derived from 'x' and 'd'.
            var intermediateA = ( (primeModulus - performModMultiplication(baseX, calculateModInverse(diffD))) % primeModulus + primeModulus ) % primeModulus;
            // Calculate the permutation part.
            var permutationResult = calculatePermutationMod(intermediateA, powerN);
            // Calculate the modular power part.
            var modPowerResult = calculateModPower(primeModulus - diffD, powerN);
            // The final answer is the product of the two parts, modulo primeModulus.
            finalResults[loopIter] = performModMultiplication(permutationResult, modPowerResult);
        }
    }

    // Concatenate all calculated results into a single string, separated by newlines.
    return finalResults.join("\n");
}
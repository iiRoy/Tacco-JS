const DataStreamReader = (function() {
    /**
     * Factory function to create a new input stream reader.
     * It takes raw text input and prepares it for sequential reading.
     * @param {string} sourceText The complete string of input data.
     * @returns {StreamContext} An object capable of parsing the input.
     */
    function establishReader(sourceText) {
        return new StreamContext(sourceText);
    }

    /**
     * Constructor for the internal state of the input stream.
     * Initializes the source lines and the current reading position.
     * @param {string} rawInput The full input string to be processed.
     */
    function StreamContext(rawInput) {
        // Stores each line of the input as an element in an array.
        this._sourceLines = rawInput.trim().split("\n");
        // Tracks the current line number being processed by the reader.
        this._currentLineNum = 0;
    }

    /**
     * Extracts a single token (word) from the current line of input.
     * If the line has not been tokenized yet, it will be split.
     * Moves to the next line if the current one is exhausted after extraction.
     * @param {boolean} returnAsText If true, the token is returned as a string; otherwise, it's converted to a number.
     * @returns {string|number} The extracted data item.
     */
    StreamContext.prototype.fetchSingleItem = function(returnAsText) {
        let currentSource = this._sourceLines;
        let currentLineIdx = this._currentLineNum;
        let extractedValue;

        // On first access, tokenize the current line by splitting on spaces.
        if (typeof currentSource[currentLineIdx] === "string") {
            currentSource[currentLineIdx] = currentSource[currentLineIdx].split(" ").reverse();
        }

        // Retrieve the last token from the (reversed) array of tokens.
        extractedValue = currentSource[currentLineIdx].pop();

        // If the current line is now empty, increment the line pointer.
        if (!currentSource[currentLineIdx].length) {
            this._currentLineNum++;
        }
        // Conditionally return the value as text or parsed number.
        return returnAsText ? extractedValue : +extractedValue;
    };

    /**
     * Reads and processes an entire line of input, returning all its tokens.
     * The line pointer is advanced after reading.
     * @param {boolean} getTextOnly If true, tokens are returned as strings; otherwise, they are converted to numbers.
     * @returns {Array<string|number>} An array containing all tokens from the read line.
     */
    StreamContext.prototype.obtainLineItems = function(getTextOnly) {
        // Splits the current line into an array of strings and then advances the line index.
        let sourceRow = this._sourceLines[this._currentLineNum++].split(" ");
        // Maps the string tokens to numbers if getTextOnly is false.
        return getTextOnly ? sourceRow : sourceRow.map(entryStr => +entryStr);
    };

    /**
     * Retrieves a block of lines, treating each as a row in a matrix.
     * Each line is tokenized. The line pointer is advanced by `numRowsToRead`.
     * @param {number} numRowsToRead The count of lines to read as matrix rows.
     * @param {boolean} asStringArray If true, matrix elements are strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix data.
     */
    StreamContext.prototype.getMatrixData = function(numRowsToRead, asStringArray) {
        // Extracts a slice of lines and splits each into tokens.
        let retrievedMatrix = this._sourceLines.slice(this._currentLineNum, this._currentLineNum += numRowsToRead).map(lineData => lineData.split(" "));
        // Converts all matrix elements to numbers if `asStringArray` is false.
        return asStringArray ? retrievedMatrix : retrievedMatrix.map(row => row.map(cellStr => +cellStr));
    };

    /**
     * Fetches a specified number of raw lines without further tokenization.
     * Advances the internal line pointer by the number of lines read.
     * @param {number} rowsCount The total number of lines to retrieve.
     * @param {boolean} keepAsStrings If true, lines are returned as raw strings; otherwise, converted to numbers.
     * @returns {Array<string|number>} An array containing the raw lines or their numeric equivalents.
     */
    StreamContext.prototype.retrieveRawLines = function(rowsCount, keepAsStrings) {
        // Slices the required number of lines from the source.
        let resultLines = this._sourceLines.slice(this._currentLineNum, this._currentLineNum += rowsCount);
        // Maps the lines to numbers if `keepAsStrings` is false.
        return keepAsStrings ? resultLines : resultLines.map(lineValue => +lineValue);
    };

    return establishReader;
})();


// Instantiate the input reader by consuming standard input.
const dataInput = DataStreamReader(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically constructs a multi-dimensional array filled with a specified initial value.
 * This function uses `eval` to create the nested array structure based on provided dimension sizes.
 * @param {any} initialFillValue The value to populate the innermost elements of the array.
 * @param {...number} dimensionSizes Variable number of arguments specifying the size of each dimension.
 * @returns {Array} A new multi-dimensional array.
 */
function buildMultiArray(initialFillValue) {
    const dimensionSizes = arguments;
    let argCount = dimensionSizes.length;
    // Constructs the string representation for the innermost array.
    let creationString = `Array(dimensionSizes[${--argCount}]).fill(0).map(_val => { return ${initialFillValue}; })`;

    // Iteratively wraps the string with outer array creation calls.
    while (--argCount) {
        creationString = `Array(dimensionSizes[${argCount}]).fill(0).map(_val => ${creationString})`;
    }
    // Executes the constructed string to create the array.
    return eval(creationString);
}


// A constant representing the prime modulus for all modular arithmetic operations.
const PRIME_MODULO = 1000003;

/**
 * Computes the modular product of multiple numbers.
 * It's optimized to prevent overflow in intermediate calculations by splitting numbers into high/low bits.
 * @param {...number} factors A variable number of numeric arguments to multiply.
 * @returns {number} The product of all factors modulo PRIME_MODULO.
 */
function computeModProduct() {
    const factors = arguments;
    let currentProduct = factors[0];
    let factorIndex = 1;

    // Iterate through additional factors, applying modular multiplication.
    while (factorIndex < factors.length) {
        // This calculation splits the current product and the factor into 16-bit parts
        // to handle numbers larger than 2^31-1 before applying the modulo,
        // preventing overflow for intermediate results in standard JS number types.
        currentProduct = (
            ( (currentProduct >>> 16) * factors[factorIndex] % PRIME_MODULO * 65536) + // High 16 bits * factor
            ( (currentProduct & 65535) * factors[factorIndex++])                       // Low 16 bits * factor
        ) % PRIME_MODULO;
    }
    return currentProduct;
}


// An array used to cache precomputed factorial values.
// Initialized with 0! = 1 and 1! = 1.
const factorialStorage = [1, 1];

/**
 * Populates the `factorialStorage` array with factorial values modulo `PRIME_MODULO`
 * up to the specified `upperBound`.
 * @param {number} upperBound The maximum integer for which to compute the factorial.
 */
function generateFactorials(upperBound) {
    let loopCounter = 2; // Start from 2 as 0! and 1! are already set.
    while (loopCounter <= upperBound) {
        // Calculate current factorial using the previous one and modular multiplication.
        factorialStorage[loopCounter] = computeModProduct(factorialStorage[loopCounter - 1], loopCounter++);
    }
}

/**
 * Calculates the modular multiplicative inverse of a number `firstNum` modulo `PRIME_MODULO`.
 * Uses the Extended Euclidean Algorithm.
 * @param {number} firstNum The number for which to find the inverse.
 * @returns {number} The modular inverse, always a positive value within [0, PRIME_MODULO-1].
 */
function calculateModInverse(firstNum) {
    let secondNum = PRIME_MODULO;
    let coeffX = 1, coeffY = 0; // Coefficients for the Bezout's identity (ax + by = gcd(a,b))
    let tempVar;

    // The core of the Extended Euclidean Algorithm.
    while (secondNum) {
        tempVar = Math.floor(firstNum / secondNum); // Quotient
        firstNum -= tempVar * secondNum;
        coeffX -= tempVar * coeffY;

        // Swap (firstNum, secondNum) and (coeffX, coeffY)
        tempVar = firstNum;
        firstNum = secondNum;
        secondNum = tempVar;

        tempVar = coeffX;
        coeffX = coeffY;
        coeffY = tempVar;
    }

    // Ensure the result is positive and within the modulo range.
    coeffX %= PRIME_MODULO;
    return coeffX < 0 ? coeffX + PRIME_MODULO : coeffX;
}

/**
 * Computes the number of permutations nPr (n choose r) modulo `PRIME_MODULO`.
 * nPr = n! / (n-r)! = n! * ((n-r)!)^(-1) mod M
 * @param {number} totalElements The total number of items 'n'.
 * @param {number} selectCount The number of items to choose 'r'.
 * @returns {number} The calculated nPr value modulo PRIME_MODULO.
 */
function getPermutationMod(totalElements, selectCount) {
    // Uses precomputed factorials and modular inverse.
    return computeModProduct(
        factorialStorage[totalElements],
        calculateModInverse(factorialStorage[(totalElements - selectCount + PRIME_MODULO) % PRIME_MODULO])
    );
}

/**
 * Calculates (baseValue ^ exponentValue) modulo `PRIME_MODULO` using binary exponentiation (exponentiation by squaring).
 * @param {number} baseValue The base of the exponentiation.
 * @param {number} exponentValue The exponent.
 * @returns {number} The result of the modular exponentiation.
 */
function performModPower(baseValue, exponentValue) {
    let powerResult = 1; // Initialize result to 1 (base^0).
    // Loop continues as long as the exponent is greater than zero.
    while (exponentValue > 0) {
        // If the least significant bit of the exponent is 1, multiply result by current base.
        if (exponentValue & 1) {
            powerResult = computeModProduct(baseValue, powerResult);
        }
        // Square the base for the next iteration (effectively processing the next bit of the exponent).
        baseValue = computeModProduct(baseValue, baseValue);
        // Right shift the exponent by 1 (integer division by 2).
        exponentValue >>= 1;
    }
    return powerResult;
}


// Executes the main application logic and prints its return value to the console.
console.log(runApplication());

/**
 * The main entry point for the application's logic.
 * It reads a series of queries from the input, performs specific modular arithmetic calculations
 * for each query, and compiles the results.
 * @returns {string} A string containing all the computed answers, each on a new line.
 */
function runApplication() {
    // Read the total number of queries to process.
    let numberOfQueries = dataInput.fetchSingleItem();
    // Initialize an array to store the answer for each query, pre-filled with zeros.
    let outputResults = Array(numberOfQueries).fill(0);

    // Precompute all necessary factorial values up to the modulo.
    generateFactorials(PRIME_MODULO);

    // Iterate through each query to perform calculations.
    for (let queryIterator = 0; queryIterator < numberOfQueries; queryIterator++) {
        // Read the three parameters for the current query from a single line.
        let currentQueryData = dataInput.obtainLineItems();
        let initialValueX = currentQueryData[0];
        let differenceD = currentQueryData[1];
        let countN = currentQueryData[2];

        // Handle specific conditions:
        // If 'countN' is too large (greater than or equal to PRIME_MODULO), or 'initialValueX' is zero,
        // the result for this query is implicitly 0 (due to zero-filled array and skip).
        if (countN >= PRIME_MODULO || initialValueX === 0) {
            outputResults[queryIterator] = 0; // Explicitly set to 0 for clarity.
            continue; // Move to the next query.
        }

        // Branch based on the value of 'differenceD'.
        if (differenceD === 0) {
            // If difference is zero, calculate (initialValueX ^ countN) mod PRIME_MODULO.
            outputResults[queryIterator] = performModPower(initialValueX, countN);
        } else {
            // If difference is non-zero, perform a more complex calculation.
            // Step 1: Calculate an intermediate term 'a'.
            let intermediateTermA = ((PRIME_MODULO - computeModProduct(initialValueX, calculateModInverse(differenceD))) % PRIME_MODULO + PRIME_MODULO) % PRIME_MODULO;
            // Step 2: Calculate a permutation term 'p'.
            let permutationTermP = getPermutationMod(intermediateTermA, countN);
            // Step 3: Calculate a multiplier term 'm'.
            let multiplierTermM = performModPower(PRIME_MODULO - differenceD, countN);
            // Step 4: Combine 'p' and 'm' with modular multiplication.
            outputResults[queryIterator] = computeModProduct(permutationTermP, multiplierTermM);
        }
    }

    // Join all computed results with newline characters for final output.
    return outputResults.join("\n");
}
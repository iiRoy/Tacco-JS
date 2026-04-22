"use strict"; /* This directive enforces stricter parsing and error handling for cleaner code. */

/* --- Input Handling Utilities --- */
var dataStream = require("fs")
                     . readFileSync(
                           "/dev/stdin", // Standard input file path
                           "utf8"        // Encoding for reading the file
                       );
var tokenArray = dataStream . split(  / |\n/  ), // Split input into tokens by spaces or newlines
    tokenIndex = 0;                              // Current index in the token array

/**
 * Retrieves the next token from the input array and converts it to a numeric type.
 * @returns {number} The next numerical token.
 */
function getNextNumeric() {
    return +tokenArray[ tokenIndex++ ];
}

/**
 * Fetches the next token from the input array as a string.
 * @returns {string} The next string token.
 */
function getNextString() {
    return tokenArray[ tokenIndex++ ];
}

/**
 * Extracts the next token from the input array and converts it to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function getNextBigInt() {
    return BigInt(  tokenArray[ tokenIndex++ ]  );
}

/**
 * Reads a sequence of `countElements` tokens from the input.
 * @param {number} countElements - The number of elements to read.
 * @param {boolean} asStringFlag - If true, elements are returned as strings; otherwise, as numbers.
 * @returns {Array<string|number>} An array containing the sequence of tokens.
 */
function getSequence( countElements, asStringFlag ) {
    if ( asStringFlag ) {
        return tokenArray.slice( tokenIndex, tokenIndex += countElements );
    }
    return tokenArray.slice( tokenIndex, tokenIndex += countElements )
                     .map(  element => +element  ); // Convert to number if not as string
}

/**
 * Reads a matrix of `numRows` by `numCols` from the input tokens.
 * @param {number} numRows - The number of rows in the matrix.
 * @param {number} numCols - The number of columns in each row.
 * @param {boolean} asStringsFlag - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} The parsed matrix.
 */
function getMatrix( numRows, numCols, asStringsFlag ) {
    var resultMatrix = [], // Array to store the matrix rows
        rowIterator = 0;   // Iterator for rows

    if ( asStringsFlag ) {
        for ( ; rowIterator < numRows; rowIterator++ ) {
            resultMatrix.push(  tokenArray.slice( tokenIndex, tokenIndex += numCols )  );
        }
    } else {
        for ( ; rowIterator < numRows; rowIterator++ ) {
            resultMatrix.push(  tokenArray.slice( tokenIndex, tokenIndex += numCols )
                                          .map(  element => +element  )  ); // Convert elements to numbers
        }
    }
    return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array with specified dimensions and initial value.
 * @param {*} initialValue - The value to initialize all elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., d1, d2, d3).
 * @returns {Array} The initialized multi-dimensional array.
 */
function createMultiDimArray( initialValue ) {
    var dimArgs = arguments, // All arguments passed to the function
        argCount = dimArgs.length, // Number of arguments
        arrayDefString = "Array(dimArgs[" + --argCount + "]).fill().map(_val_=>{return " + initialValue + ";})";

    while ( --argCount ) {
        arrayDefString = "Array(dimArgs[" + argCount + "]).fill().map(_val_=>" + arrayDefString + ")";
    }
    return eval( arrayDefString ); // Execute the generated array definition string
}

/* --- Mathematical Utilities for Modular Arithmetic --- */

/**
 * Computes the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
 * @param {BigInt} firstNum - The first number.
 * @param {BigInt} secondNum - The second number.
 * @returns {BigInt} The greatest common divisor.
 */
function greatestCommonDivisor( firstNum, secondNum ) {
    return secondNum ? greatestCommonDivisor( secondNum, firstNum % secondNum ) : firstNum;
}

var currentModulo = 1000000007; // A common prime modulus (10^9 + 7) used in competitive programming.

/**
 * Performs modular multiplication of multiple arguments.
 * This function uses a split multiplication trick to handle large `Number` types
 * within JavaScript's limits before applying the modulo, reducing intermediate overflow.
 * @param {...number} factors - Numbers to multiply.
 * @returns {number} The product modulo `currentModulo`.
 */
function modularMultiply() {
    var factorList = arguments,
        currentResult = factorList[0],
        loopCounter = factorList.length;

    for ( ; --loopCounter ; ) {
        // This trick effectively splits the multiplication into parts to prevent overflow
        // for `Number` types before taking the modulo.
        currentResult = ( ( currentResult >> 16 ) * factorList[ loopCounter ] % currentModulo * 65536 + ( currentResult & 65535 ) * factorList[ loopCounter ] ) % currentModulo;
    }
    return currentResult;
}

var factorialCache = [],        // Stores pre-computed factorials
    invFactorialCache = [],     // Stores pre-computed inverse factorials
    modularInversesCache = [],  // (Declared but not used in this specific problem's logic)
    powerOfTwoCache = [];       // (Declared but not used in this specific problem's logic)

/**
 * Pre-computes factorials and inverse factorials up to `upperBound` modulo `currentModulo`.
 * @param {number} upperBound - The maximum value for which to compute factorials.
 */
function setupFactorials( upperBound ) {
    factorialCache.length = upperBound + 1;
    factorialCache[0] = 1;
    factorialCache[1] = 1;

    for ( var counterVar = 2; counterVar <= upperBound; ) {
        factorialCache[ counterVar ] = modularMultiply( factorialCache[ counterVar - 1 ], counterVar++ );
    }

    invFactorialCache.length = upperBound + 1;
    invFactorialCache[0] = 1;
    invFactorialCache[1] = 1;
    invFactorialCache[ upperBound ] = calculateModularInverse( factorialCache[ upperBound ] );

    for ( counterVar = upperBound; 2 < counterVar; ) {
        invFactorialCache[ counterVar - 1 ] = modularMultiply( invFactorialCache[ counterVar ], counterVar-- );
    }

    // The following cache pre-computations were commented out in the original source,
    // but their declarations are maintained to preserve the structural intent.
    // modularInversesCache.length = upperBound + 1;
    // modularInversesCache[0] = 1;
    // modularInversesCache[1] = 1;
    // for(counterVar = 2; counterVar <= upperBound;) modularInversesCache[counterVar] = modularMultiply(factorialCache[counterVar-1], invFactorialCache[counterVar++]);
    // powerOfTwoCache.length = upperBound + 1;
    // powerOfTwoCache[0] = 1;
    // for(counterVar = 1; counterVar <= upperBound; counterVar++) powerOfTwoCache[counterVar] = powerOfTwoCache[counterVar-1] * 2 % currentModulo;
}

/**
 * Calculates the modular multiplicative inverse of `targetValue` modulo `currentModulo`
 * using the extended Euclidean algorithm.
 * @param {number} targetValue - The number for which to find the inverse.
 * @returns {number} The modular inverse.
 */
function calculateModularInverse( targetValue ) {
    var tempModulo = currentModulo,
        currentU = 0,
        currentV = 1,
        tempVar;

    while ( targetValue ) {
        tempVar = tempModulo / targetValue | 0; // Integer division
        tempModulo -= tempVar * targetValue;
        currentU -= tempVar * currentV;

        // Swap (tempModulo, targetValue) and (currentU, currentV)
        tempVar = tempModulo;
        tempModulo = targetValue;
        targetValue = tempVar;

        tempVar = currentU;
        currentU = currentV;
        currentV = tempVar;
    }
    currentU %= currentModulo;
    return currentU < 0 ? currentU + currentModulo : currentU; // Ensure positive result
}

/**
 * Computes (baseValue ^ exponentValue) % currentModulo efficiently using binary exponentiation (exponentiation by squaring).
 * @param {number} baseValue - The base number.
 * @param {number} exponentValue - The exponent.
 * @returns {number} The result of the modular exponentiation.
 */
function modularExponentiation( baseValue, exponentValue ) {
    var resultAccumulator = 1; // Initialize result to 1
    while ( exponentValue ) {
        if ( exponentValue & 1 ) { // If exponent is odd
            resultAccumulator = modularMultiply( baseValue, resultAccumulator );
        }
        baseValue = modularMultiply( baseValue, baseValue ); // Square the base
        exponentValue >>= 1; // Halve the exponent
    }
    return resultAccumulator;
}

/**
 * Calculates "n choose k" (C(n,k)) modulo `currentModulo` using pre-computed factorials.
 * @param {number} totalItems - Total number of items.
 * @param {number} chosenItems - Number of items to choose.
 * @returns {number} The number of combinations modulo `currentModulo`.
 */
function combinationsMod( totalItems, chosenItems ) {
    return modularMultiply( factorialCache[ totalItems ], invFactorialCache[ chosenItems ], invFactorialCache[ totalItems - chosenItems ] );
}

/**
 * Calculates "n permute k" (P(n,k)) modulo `currentModulo` using pre-computed factorials.
 * @param {number} totalItems - Total number of items.
 * @param {number} chosenItems - Number of items to permute.
 * @returns {number} The number of permutations modulo `currentModulo`.
 */
function permutationsMod( totalItems, chosenItems ) {
    return modularMultiply( factorialCache[ totalItems ], invFactorialCache[ chosenItems ] );
}

/**
 * Ensures a number is within the [0, currentModulo-1] range by taking the modulo.
 * Handles negative numbers correctly.
 * @param {number} inputNumber - The number to normalize.
 * @returns {number} The normalized number within the modulo range.
 */
function normalizeModulo( inputNumber ) {
    return ( ( inputNumber % currentModulo ) + currentModulo ) % currentModulo;
}


/* --- Main Program Logic --- */
// Execute the primary function and store its return value.
var finalOutput = primaryExecution();

// If the primary function returned a value (i.e., not undefined), print it to the console.
if ( finalOutput !== undefined ) {
    console.log( finalOutput );
}

/**
 * The main execution function of the program.
 * It reads pairs of BigInts, categorizes them, and calculates a final result
 * based on specific geometric/combinatorial logic involving modular arithmetic.
 * @returns {number} The final calculated result modulo `currentModulo`.
 */
function primaryExecution() {
    var countPairs = getNextNumeric(); // Number of (A, B) pairs to read

    var zeroA_count = 0,    // Count of pairs where A is 0, B is non-zero
        zeroB_count = 0,    // Count of pairs where B is 0, A is non-zero
        bothZero_count = 0; // Count of pairs where both A and B are 0

    var pairCounts = {},           // Stores counts of normalized (A, B) pairs
        distinctA_values = [];     // List of unique A values encountered after normalization

    // Loop through each input pair (currentA_val, currentB_val)
    for ( var pairIterator = 0; pairIterator < countPairs; pairIterator++ ) {
        var currentA_val = getNextBigInt(),
            currentB_val = getNextBigInt();

        // Handle special cases where A or B or both are zero
        if ( currentA_val === 0n && currentB_val === 0n ) {
            bothZero_count++;
            continue; // Move to the next pair
        }
        if ( currentA_val === 0n ) {
            zeroA_count++;
            continue; // Move to the next pair
        }
        if ( currentB_val === 0n ) {
            zeroB_count++;
            continue; // Move to the next pair
        }

        // Normalize the pair (A, B) by dividing by their greatest common divisor
        var commonDivisor = greatestCommonDivisor( currentA_val, currentB_val );
        currentA_val /= commonDivisor;
        currentB_val /= commonDivisor;

        // Ensure 'currentA_val' is positive for consistent mapping (e.g., (1, -2) vs (-1, 2))
        if ( currentA_val < 0n ) {
            currentA_val = -currentA_val;
            currentB_val = -currentB_val;
        }

        // Store counts of normalized pairs in a nested map (object used as map)
        if ( pairCounts[ currentA_val ] ) {
            if ( pairCounts[ currentA_val ][ currentB_val ] ) {
                pairCounts[ currentA_val ][ currentB_val ]++;
            } else {
                pairCounts[ currentA_val ][ currentB_val ] = 1;
            }
        } else {
            pairCounts[ currentA_val ] = {}; // Initialize sub-map for new A value
            pairCounts[ currentA_val ][ currentB_val ] = 1;
            distinctA_values.push( currentA_val ); // Keep track of distinct 'A' values
        }
    }

    // Calculate initial answer based on counts of zero-containing pairs.
    // Each set of zero-A or zero-B pairs can form 2^count combinations, minus 1 for the empty set.
    var finalResult = modularExponentiation( 2, zeroA_count ) + modularExponentiation( 2, zeroB_count ) - 1;

    // Iterate through distinct A values to process pairs and their perpendicular counterparts
    for ( var distinctA_iterator = 0; distinctA_iterator < distinctA_values.length; distinctA_iterator++ ) {
        var currentDistinctA = distinctA_values[ distinctA_iterator ];

        for ( var currentB_key in pairCounts[ currentDistinctA ] ) {
            var tempSum = 0;

            // Handle the case of negative 'B' keys. These represent pairs (A, -B)
            // or (A, B) where B was originally negative and normalized to positive A, negative B.
            // The logic here is to avoid double counting perpendicular pairs.
            if ( currentB_key < 0 ) {
                // If the perpendicular pair ( -B, A ) has already been processed, skip this one.
                // For example, if we have (3, -5) and later encounter (5, 3), we want to process it once.
                // `currentB_key` is a string (e.g., "-5n"). `currentB_key.substring(1)` gives "5n".
                // `currentDistinctA` is a BigInt (e.g., 3n). It will be stringified when used as a key.
                if ( pairCounts[ currentB_key.substring(1) ] && pairCounts[ currentB_key.substring(1) ][ currentDistinctA ] ) {
                    continue; // This perpendicular pair has already been considered.
                }
            } else {
                // If a perpendicular pair ( B, -A ) exists, add its contribution.
                // `currentB_key` is a string (e.g., "5n"). `negativeA_key` is "-3n".
                const negativeA_key = "-" + currentDistinctA.toString();
                if ( pairCounts[ currentB_key ] && pairCounts[ currentB_key ][ negativeA_key ] ) {
                    tempSum = modularExponentiation( 2, pairCounts[ currentB_key ][ negativeA_key ] ) - 1;
                }
            }
            // Add the contribution from the current pair (currentDistinctA, currentB_key)
            tempSum += modularExponentiation( 2, pairCounts[ currentDistinctA ][ currentB_key ] );

            // Multiply the total result with the computed 'tempSum' modulo 'currentModulo'
            finalResult = modularMultiply( finalResult, tempSum % currentModulo );
        }
    }
    // Final adjustment: subtract 1 (for the empty set) and add the count of (0,0) pairs.
    return normalizeModulo( finalResult - 1 + bothZero_count );
}
/**
 * This is the primary function for processing input.
 * It takes raw string input and performs calculations.
 * @param {String} raw_input The raw input string provided to the program.
 */
function   Main ( raw_input )
{

    const [n, aList] = raw_input.split("\n"); // Deconstructs input into 'n' and 'aList' parts.

    const a = toNumArray(aList).map(item => BigInt(item)); // Converts string list to an array of BigInts.
    const DIV = BigInt(10 ** 9 + 7); // Defines the modulo divisor as a BigInt.

    let sum = 0n; // Initialize the sum accumulator as a BigInt.

    // Outer loop iterates through each element 'a1'
    for ( let i = 0 ; i < a.length ; i++ )
    {
        const a1 = a[i]; // First element of the pair.

        // Inner loop iterates through elements after 'a1'
        for ( let j = i + 1 ; j < a.length ; j++ )
        {
            const a2 = a[j]; // Second element of the pair.
            sum += a1 * a2; // Accumulate the product of the pair.

        } // End of inner loop.
    } // End of outer loop.

    sum %= DIV; // Apply modulo operation to the final sum.

    console.log(sum.toString()); // Output the result as a string.

} // End of Main function.

// !!! IMPORTANT: DO NOT MODIFY THE FOLLOWING LINE(S) !!!
// This section handles reading from standard input and invoking the Main function.
// It ensures compatibility with the execution environment.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// ==================================================================
//                        Utility Functions
// ==================================================================

/**
 * Converts a string into an array of numbers.
 * @param {String} str The input string to convert.
 * @param {String} [delimitor=' '] The delimiter character to split the string by. Defaults to a space.
 * @returns {Array<Number>} An array of parsed integer numbers.
 */
function   toNumArray ( str , delimitor = ' ' )
{
    return str . split ( delimitor ) . map ( s => parseInt ( s , 10 ) ) ; // Splits and parses each part.
} // End of toNumArray.


/**
 * Transforms a string into an array of BigInts.
 * @param {String} str The input string.
 * @param {String} [delimitor=' '] The character used to separate numbers in the string. Defaults to a space.
 * @returns {Array<BigInt>} An array containing BigInt representations of the numbers.
 */
function   toBitIntArray ( str , delimitor = ' ' )
{
    return str . split ( delimitor ) . map ( s => BigInt ( s ) ) ; // Splits the string by delimiter and converts to BigInt.
} // End of toBitIntArray.


/**
 * Converts a one-dimensional array of strings into a 2D matrix (array of arrays).
 * Each string in the input array represents a row, which is then split by a delimiter.
 * @param {Array<String>} array The input array of strings, where each string is a row.
 * @param {String} [delimitor=' '] The delimiter used within each string to separate columns. Defaults to a space.
 * @returns {Array<Array<String>>} A 2D array (matrix) of strings.
 */
function   toMatrix ( array , delimitor = ' ' )
{
    const result = array . map ( v => v . split ( delimitor ) ) ; // Maps each string row to an array of strings.
    return result ; // Returns the resulting matrix.
} // End of toMatrix.


/**
 * Calculates the sum of all numbers in a given numeric array.
 * This is a generic sum function.
 * @param {Array<Number>} n An array of numbers to be summed.
 * @returns {Number} The total sum of all elements in the array.
 */
function   sum ( n )
{
    return n . reduce ( ( a , b ) => a + b ) ; // Uses reduce to sum all elements.
} // End of sum function.
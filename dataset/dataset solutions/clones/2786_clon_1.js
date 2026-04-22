/* This script processes input data to calculate a specific difference.
 * It's designed to read from standard input, parse numerical data,
 * and then perform a specific calculation based on sorted values.
 * This is typically used in competitive programming contexts.
 */

'use strict'; // Enforce strict mode for JavaScript, which helps catch common coding errors.

// This is an Immediately Invoked Function Expression (IIFE).
// It encapsulates the code to prevent global variable pollution and executes immediately.
( function ( input ) {

    // Step 1: Prepare the input data.
    // The 'input' string is first trimmed to remove leading/trailing whitespace,
    // then split into an array of strings based on newline characters.
    // Each line from the input file becomes an element in the 'input' array.
    input = input . trim () . split ( /\n/ ) ;

    // Step 2: Parse and process the numerical data.
    // Declare two constant variables: 'N' and 'd'.
    const N = input [ 0 ] - 0 , // 'N' is the first line of input, converted to a number.
                               // Subtracting 0 is a common trick to cast a string to a number.
          d = input [ 1 ]      // 'd' processes the second line of input.
                . split ( /\s+/ ) // First, split the second line by one or more whitespace characters
                                 // to get an array of number strings.
                . map ( x => x - 0 ) // Then, map each string element 'x' to its numerical equivalent.
                                     // Again, 'x - 0' is used for type conversion.
                . sort ( ( a , b ) => a - b ) ; // Finally, sort the array of numbers in ascending order.
                                               // The comparison function (a, b) => a - b ensures numerical sort.

    // Step 3: Perform the final calculation and output the result.
    // This calculates the difference between two elements from the sorted array 'd'.
    // It specifically targets the element at index N/2 and the element at index N/2 - 1.
    // This implies 'N' is likely the total count of elements and is expected to be an even number,
    // and the problem might be related to finding a median or a specific difference in a sorted set.
    console . log ( d [ N / 2 ] - d [ N / 2 - 1 ] ) ;

} ) (
    // The argument passed to the IIFE is the content of the standard input file.
    // 'require('fs').readFileSync('/dev/stdin', 'utf8')' reads the entire content
    // of '/dev/stdin' (standard input) as a UTF-8 encoded string synchronously.
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
) ; // End of the IIFE execution.
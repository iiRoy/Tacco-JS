/*
 *   This JavaScript file contains the implementation of a Counting Sort algorithm
 *   and its application to sort an array of numbers read from standard input.
 *
 *   The 'sort' function performs the core sorting logic.
 *   The main script then reads data, calls 'sort', and outputs the result.
 */


/**
 *   Implements the Counting Sort algorithm.
 *   This function sorts an array 'A' into an array 'B', assuming elements
 *   in 'A' are non-negative integers up to a maximum value 'k'.
 *
 *   @param {Array<number>} A - The input array of numbers to be sorted.
 *   @param {Array<number>} B - The output array where the sorted numbers will be stored.
 *   @param {number} k      - The maximum possible value in the input array 'A'.
 *                            (i.e., all elements in A must be between 0 and k, inclusive).
 */
function sort ( A, B, k )
{
    // Declare and initialize the counting array 'C'.
    // This array will store the frequency of each number.
    var C = [];


    // Step 1: Initialize all elements of the counting array 'C' to zero.
    // 'C' needs to be large enough to hold counts for values from 0 up to 'k'.
    for ( var i = 0; i <= k; i++ )
    {
        C[ i ] = 0;
    }


    // Step 2: Populate the counting array 'C'.
    // Iterate through the input array 'A' and increment the count for each number encountered.
    // IMPORTANT NOTE: The loop condition `j <= A.length` means that `A[A.length]` will be accessed.
    // In JavaScript, `A[A.length]` is `undefined`. If `A` can contain `0`, then `C[undefined]`
    // would effectively be `C["undefined"]`, creating a property on the array, which is a common
    // source of bugs if not intended. This behavior is preserved as per Type I cloning rules.
    for ( var j = 0; j <= A.length; j++ )
    {
        C[ A[ j ] ]++;
    }


    // Step 3: Modify the counting array 'C' to store cumulative counts.
    // After this step, C[i] will contain the number of elements less than or equal to 'i'.
    for ( var i = 1; i <= k; i++ )
    {
        C[ i ] += C[ i - 1 ];
    }


    // Step 4: Place elements from the input array 'A' into their correct sorted positions in 'B'.
    // This loop iterates backwards through 'A' to ensure stability (preserving the relative order
    // of equal elements if multiple instances exist).
    for ( var j = A.length - 1; j >= 0; j-- )
    {
        // The value C[A[j]] gives the correct position (plus one) for A[j] in the sorted array.
        // We subtract 1 because array indices are zero-based.
        B[ C[ A[ j ] ] - 1 ] = A[ j ];

        // After placing an element, decrement its count in C. This is crucial for handling
        // duplicate elements correctly, ensuring the next identical element gets the preceding position.
        C[ A[ j ] ]--;
    }
}



// --- Main script execution starts here ---

// Use the Node.js 'fs' module to read all data from standard input ('/dev/stdin').
// The input is read as a UTF-8 encoded string.
var input = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' );


// Split the entire input string into an array of individual lines.
// Each element in the 'lines' array will correspond to one line from stdin.
var lines = input . split( '\n' );


// The first line of input typically contains 'n', the number of elements.
// The unary plus operator '+' converts the string to a number.
// 'shift()' removes the first element from the 'lines' array and returns it.
var n = +lines . shift();


// The second line of input contains the actual numbers to be sorted, space-separated.
// 'shift()' gets this line.
// 'split(' ')' divides the string into an array of string numbers.
// 'map(function(i){return +i;})' converts each string number in the array to an actual number.
var A = lines . shift() . split( ' ' ) . map( function ( i ) {
                                                    return +i;
                                                } );


// Declare an empty array 'B'. This array will be populated by the 'sort' function
// with the sorted elements from array 'A'.
var B = [];


// Call the 'sort' function to sort array 'A' into array 'B'.
// The maximum value 'k' is hardcoded here as 10000, implying that all input
// numbers are expected to be between 0 and 10000.
sort( A, B, 10000 );


// After sorting, join the elements of the sorted array 'B' back into a single
// string, with each element separated by a space.
// Finally, print this string to standard output using 'console.log()'.
console . log( B . join( ' ' ) );
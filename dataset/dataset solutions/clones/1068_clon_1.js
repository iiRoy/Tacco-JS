/* This JavaScript file implements a Counting Sort algorithm to sort an array of integers.
 * It reads input from standard input, processes it, sorts the data, and then prints the sorted array.
 */

// We begin by importing the 'fs' (file system) module, which is necessary for reading input.
// The input is read synchronously from '/dev/stdin', decoded as 'utf-8', and then split into lines.
const line = require('fs') . readFileSync ( '/dev/stdin' , 'utf-8' ) . split ( '\n' ) ;


/*
 * The `csort` function performs a Counting Sort on the given array.
 * Counting Sort is an efficient algorithm for sorting a collection of objects
 * according to keys that are small non-negative integers.
 *
 * @param {Array<number>} arr - The input array of non-negative integers to be sorted.
 * @returns {Array<number>} - A new array containing the elements of `arr` in ascending order.
 */
const csort = ( arr ) =>
{
    // Step 1: Determine the maximum value (k) present in the input array.
    // This value is crucial for defining the range of our counting array.
    const k = arr . reduce ( ( acc , x ) => acc < x ? x : acc ) ;

    // Step 2: Initialize a counting array `c`.
    // Its size will be `k + 1` to accommodate counts for values from 0 up to `k`.
    // All elements are initially set to 0.
    const c = [ ... Array ( k + 1 ) ] . map ( _ => 0 ) ;

    // Step 3: Create an empty array `result` of the same length as the input array.
    // This array will store the sorted elements.
    const result = [ ... Array ( arr . length ) ] ;

    // Step 4: Populate the counting array.
    // Iterate through the input array `arr`. For each element `arr[i]`,
    // increment the count at `c[arr[i]]`.
    // After this loop, `c[j]` will hold the number of times `j` appears in `arr`.
    for ( let i = 0 ; i < arr . length ; i ++ )
    {
        c [ arr [ i ] ] ++ ;
    } // End of first `for` loop (counting frequencies).


    // Step 5: Modify the counting array to store cumulative counts.
    // Iterate from 1 up to `k`. For each `i`, update `c[i]` to be `c[i] + c[i-1]`.
    // Now, `c[j]` will hold the number of elements in `arr` that are less than or equal to `j`.
    // This also indicates the final position of `j` in the sorted array (minus one).
    for ( let i = 1 ; i <= k ; i ++ )
    {
        c [ i ] += c [ i - 1 ] ;
    } // End of second `for` loop (cumulative sums).

    // Step 6: Build the sorted `result` array.
    // Iterate through the input array `arr` from right to left (from `arr.length - 1` down to 0).
    // This backward iteration ensures stability for equal elements.
    for ( let i = arr . length - 1 ; i >= 0 ; i -- )
    {
        // The correct sorted position for `arr[i]` is `c[arr[i]] - 1`.
        // Place `arr[i]` into its final position in the `result` array.
        result [ c [ arr [ i ] ] - 1 ] = arr [ i ] ;
        // Decrement `c[arr[i]]`. This is important because if there are duplicate elements,
        // the next occurrence of `arr[i]` should be placed at the position just before this one.
        c [ arr [ i ] ] -- ;
    } // End of third `for` loop (placing elements).

    // Finally, return the fully sorted array.
    return result ;
} ; // End of `csort` function definition.


// The second line of input (`line[1]`) is expected to contain space-separated numbers.
// We split this string by spaces and then convert each part to a number using `map(Number)`.
// This creates the `data` array which will be sorted.
const data = line [ 1 ] . split ( ' ' ) . map ( Number ) ;

// Call the `csort` function with our `data` array.
// The returned sorted array is then joined back into a single string with spaces between elements.
// This final string is then printed to the console.
console . log ( csort ( data ) . join ( ' ' ) ) ;

// The program concludes after printing the sorted output.
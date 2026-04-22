/*
 * This configuration object holds essential settings
 * for file input and line processing.
 */
const    config   =   {
    input:   '/dev/stdin', // Specifies the input source as standard input.
    newline:   '\n'        // Defines the newline character for splitting lines.
}
; /* End of configuration object definition */


// This section reads the input from the specified source,
// decodes it as UTF-8, and splits it into an array of lines.
const   line   =   require('fs')   /* File system module import */
.readFileSync(config.input,   'utf-8')   // Read the file content synchronously.
.split(config.newline)   ; /* Split the content by the configured newline character */


let   count   =   0   ; /* Initialize a counter for tracking swaps in the bubble-like process. */


/**
 * Implements a recursive 'bubbling' step for the bubble sort algorithm.
 * It inserts an element 'n' into a sorted or partially sorted array 'arr'
 * while maintaining sorted order and counting inversions.
 *
 * @param {number} n   The number to be inserted/bubbled.
 * @param {Array<number>} arr   The array (or part of it) into which 'n' is bubbled.
 * @returns {Array<number>}   A new array with 'n' correctly placed.
 */
const   bubbleing   =   (n,   arr)   =>
{
    // Base case: if the array is empty, 'n' is the only element.
    if   (arr.length   ===   0)
    {
        return   [n]   ;
    }

    // Deconstruct the array into its head and tail.
    const   head   =   arr[0]   ;
    const   tail   =   arr.slice(1)   ;

    // If 'n' is smaller than the current head, it means 'n' should come before 'head'.
    // 'head' then needs to be bubbled into the rest of the tail.
    if   (n   <   head)
    {
        return   [n]   .concat(bubbleing(head,   tail))   ;
    }
    // Otherwise, 'n' is greater than or equal to 'head', so 'head' stays in place,
    // and 'n' continues to bubble down the rest of the tail.
    else
    {
        count   ++   ; // Increment the swap counter as 'head' is effectively "swapped" past 'n'.
        return   [head]   .concat(bubbleing(n,   tail))   ;
    }
}
; /* End of bubbleing function */


/**
 * Implements a recursive bubble sort algorithm.
 * It sorts an array by repeatedly calling the 'bubbleing' function.
 *
 * @param {Array<number>} arr   The array to be sorted.
 * @returns {Array<number>}   The sorted array.
 */
const   bsort   =   arr   =>
{
    // Base case: an array with 0 or 1 element is already sorted.
    if   (arr.length   <=   1)
    {
        return   arr   ;
    }

    // Take the first element as the 'head'.
    const   head   =   arr[0]   ;
    // Take the rest of the array as the 'tail'.
    const   tail   =   arr.slice(1)   ;

    // Recursively sort the tail, then bubble the head into the sorted tail.
    return   bubbleing(head,   bsort(tail))   ;
}
; /* End of bsort function */


// Process the input:
// 1. Get the second line (index 1) from the input array.
// 2. Split it by spaces.
// 3. Convert each part to an integer.
// 4. Sort the resulting array using the custom bubble sort.
// 5. Join the sorted numbers back into a space-separated string.
// 6. Print the sorted string to the console.
console.log(
    bsort(
        line[1]   .split(' ')   .map(x   =>   parseInt(x))
    )   .join(' ')
)   ;


// Finally, print the total count of 'swaps' (inversions encountered during bubbling).
console.log(count)   ; /* Display the final count value */
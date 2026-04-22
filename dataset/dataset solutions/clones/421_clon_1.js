/*
 * This file contains a JavaScript implementation of a binary search algorithm
 * along with a main program to read input data, process it, and
 * demonstrate the use of the binary search function.
 */

function   binarySearch  ( A ,  key )
{
    // Initialize the 'left' pointer for the search range to the beginning of the array.
    var   left   =   0 ;

    // Initialize the 'right' pointer for the search range to the array's length.
    // This represents an exclusive upper bound, meaning the element at 'right' is not included.
    var   right   =   A . length ;

    // Initialize a counter to keep track of the number of iterations or comparisons made
    // during the binary search process.
    var   cnt   =   0 ;

    // Begin an infinite loop for the binary search.
    // The loop will terminate explicitly when the key is found or the search space is exhausted.
    while   ( true )
    {
        // Increment the counter for each iteration of the search loop.
        cnt ++ ;

        // Check if the search space has collapsed (left pointer meets or crosses the right pointer).
        // If they are equal, it means the element is not present in the array.
        if   ( left   ==   right )
            break ; // Exit the loop if the search space is empty.

        // Calculate the middle index of the current search segment.
        // Math.floor ensures we get an integer index, rounding down.
        var   mid   =   Math . floor ( ( left   +   right )   /   2 ) ;

        // Compare the element at the middle index with the target key.
        if   ( A [ mid ]   ==   key )
            return   cnt ; // If the key is found, return the current iteration count.

        // If the key is less than the element at the middle index,
        // the key must be in the left half of the current segment.
        if   ( key   <   A [ mid ] )
            right   =   mid ; // Adjust the 'right' pointer to 'mid', excluding 'mid'.
        // Otherwise, the key must be greater than or equal to the element at the middle index,
        // implying it's in the right half of the current segment.
        else
            left   =   mid   +   1 ; // Adjust the 'left' pointer to 'mid + 1', including 'mid + 1'.
    }
    // If the loop completes (due to 'break' when `left == right`),
    // return the final count, indicating the number of steps taken to determine absence.
    return   cnt ;
}


// --- Main program execution block ---

// Require the built-in 'fs' (file system) module for Node.js.
// Read the entire content of standard input synchronously as a UTF-8 string.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// Process the raw input string:
// 1. `trim()`: Remove any leading or trailing whitespace.
// 2. `split("\n")`: Split the string into an array of lines, using newline characters as delimiters.
var   Arr   =   input . trim ( ) . split ( "\n" ) ;

// Start a main processing loop. This loop is designed to handle multiple test cases
// or sets of data provided in the input.
while   ( true )
{
    // Extract the first element from the `Arr` array.
    // `shift()` removes and returns the first element.
    // `-0` is a common JavaScript idiom to convert a string to a number.
    var   n   =   Arr . shift ( )   -   0 ;

    // Check for the termination condition for the main loop.
    // If `n` is 0, it signifies the end of input or test cases.
    if   ( n   ==   0 )
        break ; // Exit the main processing loop.

    // Initialize an empty array `arr` which will hold the numbers for the current binary search.
    var   arr   =   [ ] ;

    // Loop `n` times to populate the `arr` with the next `n` numbers from `Arr`.
    for   ( var   i   =   0 ;   i   <   n ;   i ++ )
        arr . push ( Arr . shift ( )   -   0 ) ; // Add each shifted and converted number to `arr`.

    // Perform the binary search:
    // - `arr` is the sorted array to search within.
    // - `Arr.shift() - 0` gets the next number from the input as the key to search for.
    // The result (the count of iterations) is then printed to the console.
    console . log ( binarySearch ( arr ,   Arr . shift ( )   -   0 ) ) ;
}
// End of the main script. All input has been processed.
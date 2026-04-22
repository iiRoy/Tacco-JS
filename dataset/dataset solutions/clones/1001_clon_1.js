// This file contains a JavaScript implementation of a sorting algorithm.
// It reads input from standard input, sorts an array, and prints the result.

/**
 * The main function that processes input, sorts an array using Bubble Sort,
 * and outputs the sorted array and the number of swaps.
 * @param {string} _stdin - The raw input string from standard input.
 */
function main ( _stdin )
{
    // Split the input string by newlines to get individual lines.
    const stdin = _stdin . split ( '\n' ) ;

    // The first line contains the length of the array.
    const len = Number ( stdin . shift ( ) ) ;

    // The second line contains the array elements, space-separated.
    // Convert them to numbers.
    const arr = stdin . shift ( ) . split ( ' ' ) . map ( Number ) ;


    // Initialize a counter for the number of swaps performed.
    let count = 0 ;

    // Keep track of the number of elements already in their final sorted position
    // at the end of the array.
    let sorted = 0 ;

    // A flag to indicate if any swaps occurred in the current pass.
    // If no swaps occur, the array is sorted.
    let flag = 1 ;

    // Main sorting loop (Bubble Sort variant).
    // Continues as long as swaps are being made.
    while ( flag )
    {
        // Reset the flag at the beginning of each pass.
        flag = 0 ;

        // Iterate through the unsorted portion of the array.
        // Elements from 'len - 1' down to 'sorted' are compared and swapped.
        for ( let i = len - 1 ; i > sorted ; i -- )
        {
            // Compare adjacent elements.
            // If the current element is smaller than the previous one, swap them.
            if ( arr [ i ] < arr [ i - 1 ] )
            {
                // Perform the swap using a temporary variable.
                const t = arr [ i ] ;
                arr [ i ] = arr [ i - 1 ] ;
                arr [ i - 1 ] = t ;

                // Set the flag to 1 because a swap occurred.
                flag = 1 ;

                // Increment the swap counter.
                count ++ ;
            }
        }
        // After each pass, one more element is guaranteed to be in its correct
        // sorted position at the end of the unsorted part.
        sorted ++ ;
    }

    // Output the sorted array elements joined by spaces.
    console . log ( arr . join ( ' ' ) ) ;

    // Output the total number of swaps performed.
    console . log ( count ) ;
}


// Read input from /dev/stdin (standard input) and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
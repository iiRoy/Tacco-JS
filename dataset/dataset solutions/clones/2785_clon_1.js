function Main(  input  )
{
    /*
     * This function serves as the entry point for processing the given input.
     * It performs several steps:
     * 1. Parses the input string into meaningful data.
     * 2. Sorts an array using a custom merge sort implementation.
     * 3. Computes and logs a specific difference from the sorted array.
     */

    // First, split the entire input string into an array of lines based on newline characters.
    var tmp = input . split ( '\n' ) ;

    // The first line of the input is assigned to the variable 'n'.
    // Note: In this specific program, 'n' is declared but not subsequently used.
    var n   =   tmp[0]  ;

    // The second line of the input is expected to contain space-separated values.
    // These values are split and stored in the 'arr' array as strings.
    var arr = tmp[1] . split ( ' ' ) ;

    // Iterate through the 'arr' array to convert each string element into an integer.
    // This is crucial for numerical operations later on.
    for ( var i = 0 ; i < arr . length ; i ++ )
    {
        arr[i] = parseInt ( arr[i] ) ;
    } // End of integer conversion loop.


    // Now, sort the array 'arr' using the custom 'margeSort' function.
    // The result of the sort operation replaces the original 'arr'.
    arr = margeSort ( arr ) ;


    // Finally, print the difference between two specific elements in the sorted array:
    // the element at the middle index and the element immediately preceding it.
    // Integer division is implicitly used for the index calculation.
    console.log ( arr [ arr . length / 2 ] - arr [ arr . length / 2 - 1 ] ) ;

} /* End of the Main function definition. */



/*
 * This function implements a recursive merge sort algorithm.
 * It's named 'margeSort' (with an 'a') to match the original code's identifier.
 *
 * @param {Array} a - The array to be sorted.
 * @returns {Array} - The sorted array.
 */
function margeSort ( a )
{
    // Define an inner helper function 'split' which handles the recursive division of the array.
    var split = function ( array )
    {
        // Base case for the recursion: if the array has less than 2 elements, it's already sorted.
        if ( array . length < 2 )
        {
            return array ;
        }

        // Declare variables for the two halves of the array and the middle index.
        var a , b , mid = array . length / 2 | 0 ; // '| 0' performs a floor division, ensuring an integer index.

        // Recursively split the first half of the array.
        a = split ( array . slice ( 0 , mid ) ) ;
        // Recursively split the second half of the array.
        b = split ( array . slice ( mid , array . length ) ) ;

        // Once both halves are sorted, merge them.
        return marge ( array , a , b ) ;
    } , // Semicolon separating 'split' from 'marge' declaration.

    // Define another inner helper function 'marge' which handles the merging of two sorted arrays.
    marge = function ( array , a , b )
    {
        // If the second array 'b' is undefined, there's nothing to merge, so return the first array as is.
        if ( b === undefined )
        {
            return array ;
        }

        // Initialize an empty array 'c' to store the merged result.
        var c = [ ] , i , j ;

        // While both sub-arrays 'a' and 'b' still contain elements, compare their first elements.
        while ( a . length > 0 && b . length > 0 )
        {
            i = a[0] , j = b[0] ; // Get the first elements of 'a' and 'b'.

            // If the first element of 'a' is smaller, push it to 'c' and remove it from 'a'.
            if ( i < j )
            {
                c . push ( a . shift ( ) ) ;
            }
            // Otherwise, push the first element of 'b' to 'c' and remove it from 'b'.
            else
            {
                c . push ( b . shift ( ) ) ;
            }
        }

        // After the loop, one of the arrays (a or b) might still have remaining elements.
        // If 'a' is empty, concatenate the rest of 'b' to 'c'.
        if ( a . length === 0 )
        {
            c = c . concat ( b ) ;
        }
        // If 'b' is empty, concatenate the rest of 'a' to 'c'.
        else if ( b . length === 0 )
        {
            c = c . concat ( a ) ;
        }
        return c ; // Return the fully merged and sorted array.
    } ; // Semicolon for the end of the 'marge' function declaration.

    // Initiate the merge sort process by calling the 'split' function with the original array 'a'.
    return split ( a ) ;
} // End of the margeSort function definition.


// This line is responsible for reading input from the standard input stream (e.g., '/dev/stdin' in Unix-like systems).
// It uses Node.js's 'fs' module to synchronously read the file content as a UTF-8 string,
// and then passes this string to the 'Main' function for processing.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
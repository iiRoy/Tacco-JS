/*
 * This is a Type I clone of an existing JavaScript program.
 * It demonstrates extensive modifications to whitespace and comments
 * while maintaining the exact original code structure and identifiers.
 */

// Define the main function that processes the input string.
function Main ( input )
{
    // The input string is initially split by newline characters.
    input = input.split ( "\n" ) ;

    // Temporary variable to hold the elements from the first line of input.
    tmp = input [ 0 ] .split ( " " ) ;

    /*
     * Parse the first element of the 'tmp' array to obtain the
     * integer value of 'n', which typically represents the number of elements.
     */
    var n = parseInt ( tmp [ 0 ] ) ;

    // Another temporary variable for the elements on the second line of input.
    tmp2 = input [ 1 ] .split ( " " ) ;


    // Initialize an array 'a' with a size of 'n' to store parsed integers.
    a = new Array ( n ) ;


    var max = 0 ; // Variable to store the maximum difference found so far.
    var ans = 0 ; // Variable to store the count of times the maximum difference has been achieved.
    var min = 0 ; // Variable to store the minimum value encountered during iteration.

    // Loop through the elements from index 0 up to (but not including) n.
    for ( i = 0 ; i < n ; i ++ )
    {
        // Convert the current element of tmp2 to an integer and store it in array 'a'.
        a [ i ] = parseInt ( tmp2 [ i ] ) ;

        // Check if the current element is smaller than the current minimum,
        // or if this is the very first element (i.e., i equals 0).
        if ( min > a [ i ] || i == 0 )
        {
            // If either condition is true, update the minimum value to the current element.
            min = a [ i ] ;
        }

        // Calculate the difference between the current element and the current minimum.
        // If this difference is equal to the current maximum difference, increment the answer count.
        if ( max == a [ i ] - min )
        {
            ans ++ ;
        }
        else if ( max < a [ i ] - min ) // If this difference is greater than the current maximum difference.
        {
            // Reset the answer count to 1 (since a new maximum is found)
            // and update the maximum difference to this new, larger value.
            ans = 1 ;
            max = a [ i ] - min ;
        }
    }

    // Output the final computed answer to the console, formatted as a string.
    console .log ( '%s' , ans ) ;
}

// Call the Main function with input read from standard input.
// This line typically handles reading input in competitive programming environments.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of the program.
/*
 * This concludes the Type I clone generation process.
 * All original identifiers, operators, and expressions have been preserved exactly.
 */
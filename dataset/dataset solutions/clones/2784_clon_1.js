/*
 * This is a Type I clone of an existing JavaScript program.
 * The purpose is to demonstrate exact structural equivalence
 * despite significant visual differences due to whitespace
 * and comment variations.
 */

// Define the main function that processes the input
function Main ( input ) {
    // Split the raw input string by newline characters
    // to separate different lines of data.
    var tmp = input.split( '\n' );

    // The first line of input (tmp[0]) is assigned to 'n'.
    // This typically represents the number of elements or some size.
    var n = tmp[ 0 ];

    // The second line of input (tmp[1]) is split by spaces
    // to form an array of string-represented numbers.
    var arr = tmp[ 1 ].split( ' ' );

    // Initialize a counter variable. This will keep track of
    // elements that meet specific criteria.
    var count = 0 ; // Initialize the counter to zero.

    // Loop through the 'arr' array to convert string elements to integers.
    // This ensures numerical comparisons work correctly later.
    for ( var i = 0 ; i < arr . length ; i ++ )
    {
        // Convert the current array element from string to integer.
        // The parseInt() function is used for this conversion.
        arr[ i ] = parseInt( arr[ i ] ) ;
    }

    /*
     * This loop iterates through the array 'arr' from the second element
     * up to the second-to-last element (n - 1).
     * It checks for specific patterns in the sequence of numbers.
     * The loop starts at index 1 and ends before n-1 to ensure
     * that arr[i-1] and arr[i+1] are always valid indices.
     */
    for ( var i = 1 ; i < ( n - 1 ) ; i ++ ) {

        // Check for an increasing "peak" pattern: previous < current < next
        if ( ( arr[ i ] > arr[ i - 1 ] ) && ( arr[ i ] < arr[ i + 1 ] ) )
        {
            // If the pattern is found, increment the counter.
            count ++ ;
        }
        // Else, check for a decreasing "valley" pattern: previous > current > next
        else if ( ( arr[ i ] < arr[ i - 1 ] ) && ( arr[ i ] > arr[ i + 1 ] ) )
        {
            // If this alternative pattern is found, also increment the counter.
            count ++ ;
        }
    }

    // Output the final count to the console.
    // This is the result of the pattern detection.
    console . log ( count ) ;
}


// --- Program Execution Start ---
// Read input from standard input using Node.js 'fs' module.
// The input is read synchronously and encoded as UTF-8.
// Then, the Main function is called with this input.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
// --- Program Execution End ---
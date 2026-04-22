// This is the primary function definition for processing input.
function   Main   (   input   )   {

    // Declare and initialize a variable 'N' by splitting the input string
    // at newline characters and taking the first element (index 0).
    var   N   =   input . split ( "\n" ) [ 0 ] ;

    // Declare and initialize a variable 'a'.
    // It's derived from the second line of the input (index 1),
    // which is then split by spaces.
    var   a   =   input . split ( "\n" ) [ 1 ] . split ( " " ) ;


    // Create a new variable 'as' which holds a sorted version of array 'a'.
    // The default sort order is lexicographical for strings.
    var   as   =   a . sort ( ) ;

    /*
     * Calculate the 'deviation' (dev).
     * This involves finding the difference between the largest and smallest numbers
     * present in the sorted array 'as'.
     * 'parseInt' is used to convert the string elements to integers for arithmetic operations.
     * N-1 is used to access the last element of the array (0-indexed).
     */
    var   dev   =   parseInt ( as [ ( N   -   1 ) ] ,   10 )   -   parseInt ( as [ 0 ] ,   10 ) ;

    // Output the final calculated 'dev' value to the standard console.
    console . log ( dev ) ;

}

// This section executes the 'Main' function.
// It reads content from the standard input file '/dev/stdin'
// using Node.js's 'fs' module, specifically 'readFileSync',
// and passes the content as a UTF-8 encoded string to the 'Main' function.
Main   (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   )   ;
// This JavaScript code snippet demonstrates a common pattern for competitive programming.
// It reads input from standard input, processes an array of numbers, and prints the sorted result.
// This is a Type I clone, preserving all logical and structural elements while varying whitespace and comments.

'use strict' ; // Enforces strict mode for cleaner code and fewer errors.

( function ( stdin ) { // The entire script is wrapped in a self-executing anonymous function,
                       // taking the standard input content as an argument.

    // First, the input string is split into an array of strings,
    // where each element represents a line from the standard input.
    var line = stdin . split ( '\n' ) ;

    // The 'param' variable is declared here. It takes the first line of input,
    // splits it by spaces, and converts each resulting string part into a number.
    // Note: In this specific problem, 'param' is initialized but not used later.
    var param = line [ 0 ] . split ( ' ' ) . map ( Number ) ;

    // The 'result' variable stores the outcome of another immediately invoked function expression (IIFE).
    var result = ( function ( data ) { // This anonymous function takes an array of numbers ('data').

        // Inside this function, the 'data' array is sorted numerically in ascending order.
        // The sort method's comparison function (a, b) => a - b achieves this.
        // After sorting, the array elements are joined back into a single string,
        // with each number separated by a single space.
        return data . sort ( function ( a , b ) { // The comparison function for sorting.
            // Returns a negative value if a < b, zero if a == b, and a positive value if a > b.
            return a - b ;
        } )
        . join ( ' ' ) ; // Joins the sorted numbers into a space-separated string.

    } (
        // This is the argument passed to the IIFE above.
        // It re-processes the first line of standard input:
        // splits it by spaces and maps the parts to numbers, creating a new array.
        line [ 0 ] . split ( ' ' ) . map ( Number )
    ) ) ; // The IIFE is closed and executed with the processed input array.

    // Finally, the computed 'result' string (the space-separated sorted numbers)
    // is printed to the console, which typically corresponds to standard output.
    console . log ( result ) ;

} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // The main IIFE is invoked,
                                                                  // passing the content of '/dev/stdin'
                                                                  // (read as UTF-8) as the 'stdin' argument.
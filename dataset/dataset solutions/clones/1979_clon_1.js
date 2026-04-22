/*
 * This JavaScript snippet processes user input.
 * It demonstrates reading a line, parsing it,
 * and performing a specific check on the result.
 */

// Declare a variable to hold the input string.
// The 'readline()' function is assumed to be available in the execution environment.
var     input     =      readline ( )     ;



// Now, let's process the input and display the outcome.
console . log    (

    /*
     * The 'parseInt()' function converts a string argument to an integer.
     * If the first character cannot be converted, NaN is returned.
     */
    parseInt   (    input   )

    // The 'indexOf()' method is called on the result of parseInt.
    // JavaScript will implicitly convert the number to a string before calling indexOf.
    .indexOf   (    7    )

    /*
     * 'indexOf()' returns the first index at which a given element can be found in the array,
     * or -1 if it is not present.
     * We check if the digit '7' is present in the string representation of the parsed number.
     */
    >=     0

)   ; // End of the console.log statement.
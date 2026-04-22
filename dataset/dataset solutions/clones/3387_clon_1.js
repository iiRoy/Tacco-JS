/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural equivalence.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered
 * to create a visually distinct but functionally identical version.
 */

// Define the main entry point function for processing input
function Main ( input ) {

    // Process the raw input string: split by newline, then convert each part to a Number
    input = input . split ( "\n" ) . map ( Number ) ;

    // Remove the very first element from the array.
    // In competitive programming, this often represents 'N' (count of elements).
    input . shift ( ) ;

    // Calculate the sum of the remaining numbers in the array using a helper function
    var n = arrsum ( input ) ;

    // Check if the calculated sum 'n' is an odd number
    if ( n % 2 == 1 ) {
        // If the sum is odd, print "first" to the console
        console . log ( "first" ) ;
    }
    // Otherwise, if the sum is not odd (i.e., it's even)
    else {
        // Print "second" to the console
        console . log ( "second" ) ;
    }

} // End of Main function definition


/**
 * Helper function to compute the sum of all numeric elements within an array.
 * @param {Array<number>} arr - The array of numbers whose sum is to be calculated.
 * @returns {number} The total sum of all elements in the provided array.
 */
function arrsum ( arr ) {

    // Initialize a variable to hold the running total sum
    var sum = 0 ;

    // Loop through each element of the array
    for ( var i = 0 , len = arr . length ; i < len ; ++i ) {
        // Add the current array element to the sum
        sum += arr [ i ] ;
    }
    ; // An optional, but valid, semicolon after the loop body

    // Return the final accumulated sum
    return sum ;

} // End of arrsum function definition


// The program execution starts here:
// Read input from standard input, decode as UTF-8, remove leading/trailing whitespace,
// and then pass it to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;
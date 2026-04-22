"use strict" ; // Enforce strict parsing and error handling for better code quality.


/*
 * This class, 'I', is designed to facilitate reading various types of input
 * from a single string, typically representing multi-line data.
 * It functions as a custom input stream parser.
 */
function I ( t , i ) {
    // The raw input string 't' is split by newline characters
    // and stored as an array of lines in '_s'.
    this . _s = t . split ( "\n" ) ;

    // '_c' serves as the current column (or token) index
    // within the current line being processed. Initialized to 0.
    this . _c = 0 ;

    // '_l' tracks the current line index being read from '_s'.
    // Also initialized to 0, pointing to the first line.
    this . _l = 0 ;

    // '_f' is the default parsing function. If 'i' (a custom parser)
    // is provided, it's used; otherwise, the built-in 'Number' function is used.
    this . _f = i || Number ;
}


/*
 * The 'a' method (short for 'atom' or 'advance') reads and returns
 * the next single value (token) from the input stream.
 *
 * @param {Function} t - An optional parsing function to apply to the read token.
 *                        If not provided, the instance's default '_f' is used.
 * @returns {any} The parsed value from the input.
 */
I . prototype . a = function ( t ) {
    // Retrieve the current line based on the '_l' (line) index.
    var i = this . _s [ this . _l ] ;

    // Proceed only if the current line 'i' is not undefined or null.
    if ( i ) {
        // Trim any leading/trailing whitespace from the line,
        // then split it into an array of strings ('s') using space as a delimiter.
        var s = i . trim ( ) . split ( " " ) ;

        // Extract the value 'h' at the current column '_c' from the 's' array.
        var h = s [ this . _c ] ;

        // Increment the column counter to point to the next token.
        this . _c ++ ;

        // Check if all tokens on the current line have been consumed.
        if ( s . length === this . _c ) {
            // If so, reset the column counter to 0 for the next line.
            this . _c = 0 ;

            // And advance to the next line.
            this . _l ++ ;
        }

        // Apply the provided custom parser 't' if it exists,
        // otherwise use the instance's default parser '_f' to 'h',
        // and return the result.
        return t ? t ( h ) : this . _f ( h ) ;
    }
} ;


/*
 * The 'l' method (short for 'line') reads and returns all values
 * from the current line as an array.
 *
 * @param {Function} t - An optional parsing function to apply to each value on the line.
 *                        If not provided, the instance's default '_f' is used.
 * @returns {Array<any>} An array of parsed values from the read line.
 */
I . prototype . l = function ( t ) {
    // Get the current line from the input string array.
    var i = this . _s [ this . _l ] ;

    // Only process if the line actually exists.
    if ( i ) {
        // When reading a full line, the column counter is reset.
        this . _c = 0 ;

        // Advance to the next line immediately after reading the current one.
        this . _l ++ ;

        // Split the line into tokens by spaces and then use the 'map' function
        // to apply either the provided parser 't' or the default '_f' to each token.
        // The resulting array of parsed values is then returned.
        return i . split ( " " ) . map ( t || this . _f ) ;
    }
} ;


// Export the 'I' constructor, making it available for other modules to import.
module . exports = I ;


// Define a constant 'mod' which is commonly used as a modulus
// in arithmetic operations, especially in competitive programming contexts.
var mod = 1000003 ;


/**
 * The primary function 'main' encapsulates the core logic of the program.
 * It takes the entire input as a string, processes it using the 'I' parser,
 * and outputs results based on problem requirements.
 *
 * @param {string} input - The complete input data received as a single string.
 */
function main ( input ) {
    // Instantiate a new input parser 'o' with the provided 'input' string.
    var o = new I ( input ) ;

    // Read the first value from the input, which is expected to be
    // the number of queries or test cases, assigned to 'Q'.
    var Q = o . a ( ) ;

    // Iterate through each of the 'Q' queries.
    for ( var i = 0 ; i < Q ; i ++ ) {
        // For each query, read three parameters: 'x', 'd', and 'n'.
        // These are typically integers from the input stream.
        var x = o . a ( ) ;
        var d = o . a ( ) ;
        var n = o . a ( ) ;

        // A debug line that was previously used; currently commented out.
        // console . log ( { x , d , n } ) ;

        // Check a specific condition: if 'n' is greater than or equal to 'mod'.
        if ( n >= mod ) {
            // If the condition is met, print '0'. This often happens
            // when 'n' is large enough to ensure a product becomes 0 modulo 'mod'.
            console . log ( 0 ) ;
        } else {
            // If 'n' is less than 'mod', proceed with the calculation.
            // Initialize 'ans' (answer) to 1 for product accumulation.
            var ans = 1 ;

            // Loop 'n' times to compute a product sequence.
            for ( var k = 0 ; k < n ; k ++ ) {
                // Calculate the current term: (x + k * d)
                // Multiply 'ans' by this term.
                ans *= x + k * d ;

                // Apply the modulo operation to 'ans' to keep its value
                // within the range [0, mod - 1] after each multiplication.
                ans %= mod ;
            }

            // After the loop, print the final calculated 'ans' for the current query.
            console . log ( ans ) ;
        }
    }
}


// This line is the entry point of the script.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string
// using Node.js's 'fs' module, and then passes this string to the 'main' function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
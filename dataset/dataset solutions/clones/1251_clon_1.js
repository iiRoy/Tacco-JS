/*
 * This JavaScript module processes standard input line by line.
 * Each line is expected to be a simple arithmetic expression (e.g., "1 + 2").
 * It performs the calculation and prints the result to standard output.
 * If the operator is '?', it signals a termination or invalid operation for that line.
 *
 * This code was generated as a Type I clone, focusing on extensive whitespace
 * and comment variations while preserving all functional elements identically.
 */


// Begin the process of reading data from standard input.
process.stdin.resume( ) ;

// Configure the encoding for incoming data streams to 'utf8'.
process.stdin.setEncoding( 'utf8' ) ;

// Attach an event listener to the 'data' event of standard input.
// This function will be executed whenever new data chunks are received.
process.stdin.on( 'data', function ( chunk ) { // Anonymous function handles incoming data

    // Split the received data chunk into an array of individual lines.
    var input = chunk.split( "\n" ) ;
    // Initialize an empty string variable; it's not actively used for aggregation
    // in this particular implementation, but it's part of the original structure.
    var output = "" ; // Variable for potential future output string concatenation


    // Iterate through each line of the parsed input array.
    for ( var i = 0 ; i < input.length ; i ++ ) { // Loop through all received lines

        // Call the 'calc' function to process the current input line.
        var r = calc( input[i] ) ; // 'r' stores the result of the calculation

        // Check if the calculation yielded a concrete result (i.e., not 'false').
        if ( r !== false ) { // If 'calc' successfully computed a value
            // Print the calculated result to the standard output.
            console.log( r ) ;
        }
    }


    /**
     * @function calc
     * @param {string} input - A string representing an arithmetic expression (e.g., "5 * 3").
     * @returns {(number|boolean)} The numerical result of the operation, or 'false' if the operator is '?'.
     *
     * This helper function parses a simple space-separated arithmetic expression.
     * It supports basic operations: addition (+), subtraction (-), multiplication (*), and division (/).
     * An operator of '?' is treated as a special case, returning 'false'.
     */
    function calc( input ) {

        // Split the input string into parts based on spaces to isolate numbers and operator.
        var nums = input.split( " " ) ;

        // Convert the first and third elements of the 'nums' array to numerical types.
        nums[0] = Number( nums[0] ) ; // First operand conversion
        nums[2] = Number( nums[2] ) ; // Second operand conversion


        // Perform the appropriate arithmetic operation based on the operator.
        if ( nums[1] == "+" ) { // If the operator is addition
            return nums[0] + nums[2] ;
        }
        else if ( nums[1] == "-" ) { // If the operator is subtraction
            return nums[0] - nums[2] ;
        }
        else if ( nums[1] == "*" ) { // If the operator is multiplication
            return nums[0] * nums[2] ;
        }
        else if ( nums[1] == "/" ) { // If the operator is division
            return nums[0] / nums[2] ;
        }
        else if ( nums[1] == "?" ) { // If the operator is a question mark (special case)
            return false ; // Indicate that no calculation was performed or it's a stop signal
        }

    } // End of the 'calc' function definition

} ) ; // End of the 'data' event handler callback
// Initialize an empty string to store all incoming data.
var input = '';


/*
 * Standard input setup.
 * Resumes the stdin stream.
 */
process.stdin.resume();


// Ensures data is interpreted as UTF-8 characters.
process.stdin.setEncoding( 'utf8' );


// Event listener for incoming data chunks.
process.stdin.on( 'data', function ( chunk ) {

    // Appends each chunk to the 'input' variable.
    input += chunk;

} );


// Event listener for the end of the input stream.
process.stdin.on( 'end', function ( ) {

    // Once all data is received, call the main processing function.
    main( input );

} );



/*
 * The primary function to process the input.
 * @param {string} input - The complete input received from stdin.
 */
function main( input ) {

    // Trim whitespace and split the input into an array of lines.
    var args = input . trim ( ) . split ( '\n' ) ;


    // Iterate through each line (argument set).
    for ( var i = 0 ; i < args . length ; i += 1 ) {

        // Split the current line by space and convert parts to numbers.
        var set = args[ i ] . split ( ' ' ) . map ( Number ) ;

        // Extract n and s from the parsed set.
        var n = set[ 0 ] , s = set[ 1 ] ;

        // Check for termination condition (n=0 and s=0).
        if ( ! n && ! s ) {
            // If both are zero, exit the main function.
            return ;
        }

        // Log the result of the solve function for the current set.
        console . log ( solve ( n , s ) ) ;

    }

}


/**
 * Solves the problem for given n and s.
 * @param {number} n - The number of steps.
 * @param {number} s - The target sum.
 * @returns {number} The count of ways to achieve the sum.
 */
function solve( n , s ) {

    // Delegates to the recursive counting function.
    return countRecursively ( s , -1 , n ) ;

}



/*
 * Recursive helper function to count combinations.
 * @param {number} nowS - The current remaining sum.
 * @param {number} numPos - The last digit chosen (to ensure non-decreasing order).
 * @param {number} step - The remaining number of digits to choose.
 * @returns {number} The number of valid combinations.
 */
function countRecursively ( nowS , numPos , step ) {

    // Base case: if no more steps are left.
    if ( step === 0 ) {
        // If the remaining sum is exactly 0, it's a success.
        var success = nowS === 0 ;
        // Return 1 for success, 0 for failure.
        return success ? 1 : 0 ;
    }

    // Initialize total count for this branch.
    var total = 0 ;

    // Iterate through possible digits (from numPos + 1 to 9).
    for ( var i = numPos + 1 ; i <= 9 ; i += 1 ) {

        // Only proceed if the current digit can be subtracted from the sum.
        if ( nowS >= i ) {
            // Recursively call with updated sum, last digit, and step count.
            total += countRecursively ( nowS - i , i , step - 1 ) ;
        }

    }

    // Return the accumulated total for this level of recursion.
    return total ;

}
var toInt = x => parseInt( x , 10 ) ; // Function to convert a value to an integer with base 10.
var toIntArr = arr => arr . map( x => toInt( x ) ) ; // Function to convert an array of strings to an array of integers.
var abs = x => x > 0 ? x : -x ; // Simple absolute value function.

// ----------------------------------------------------------------------------------------------------

/**
 * Calculates the minimum value among the provided arguments.
 * This function handles a variable number of arguments.
 * @returns {number} The minimum value.
 */
function min ( ) {
    var rest = arguments , v = rest[0] ; // Initialize 'v' with the first argument.
    for ( var i = 1 ; i < rest . length ; i ++ ) { // Iterate through the remaining arguments.
        if ( rest[i] < v ) {
            v = rest[i] ; // Update 'v' if a smaller value is found.
        }
    }
    return v ; // Return the smallest value found.
}

// ----------------------------------------------------------------------------------------------------

/**
 * Calculates the maximum value among the provided arguments.
 * This function handles a variable number of arguments.
 * @returns {number} The maximum value.
 */
function max ( ) {
    var rest = arguments , v = rest[0] ; // Initialize 'v' with the first argument.
    for ( var i = 1 ; i < rest . length ; i ++ ) { // Iterate through the remaining arguments.
        if ( rest[i] > v ) {
            v = rest[i] ; // Update 'v' if a larger value is found.
        }
    }
    return v ; // Return the largest value found.
}

// ----------------------------------------------------------------------------------------------------

/**
 * Calculates the greatest common divisor (GCD) of the provided arguments.
 * Uses Euclidean algorithm for GCD calculation.
 * @returns {number} The GCD of all arguments.
 */
function gcd ( ) {
    var rest = arguments , v = rest[0] ;
    // Helper function for GCD of two numbers.
    var temp = ( a , b ) => b ? temp( b , a % b ) : a ;
    for ( var i = 1 ; i < rest . length ; i ++ ) { // Iterate through the arguments to find the GCD.
        v = temp( v , rest[i] ) ;
    }
    return v ; // Return the final GCD.
}

// ----------------------------------------------------------------------------------------------------

// Main execution point: Reads input from stdin and passes it to the Main function.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;

// ----------------------------------------------------------------------------------------------------

/**
 * The primary function that processes the input and generates the output.
 * @param {string} input - The raw input string read from stdin.
 */
function Main ( input ) {
    var input = input . split( '\n' ) ; // Split the input string into an array of lines.
    var n = toInt( input[0] ) ; // Parse the first line as an integer 'n'.

    var xys = [ ] ; // Initialize an array to store coordinate pairs.

    // Loop to read 'n' coordinate pairs and perform initial validation.
    for ( var i = 0 ; i < n ; i ++ ) {
        xys[i] = toIntArr( input[i+1] . split( ' ' ) ) ; // Parse each line into an array of two integers.

        // Check if the sum of x and y coordinates (current and first) has different parity.
        // If it does, a solution is not possible, so print -1 and exit.
        if ( ( xys[i][0] + xys[i][1] + xys[0][0] + xys[0][1] ) % 2 !== 0 ) {
            console . log( -1 ) ; // Output -1.
            return 0 ; // Exit the program.
        }
    }

    // Determine the parity of the sum of the first coordinate pair.
    var po = ( xys[0][0] + xys[0][1] ) % 2 ;

    // If the parity is 1 (odd), adjust the coordinate pairs.
    // Ensure that for each pair, if e[0]%2 is 0 (even), keep it as is, otherwise reverse it.
    if ( po === 1 ) {
        xys = xys . map( e => e[0] % 2 === 0 ? e : e . reverse( ) ) ;
    }

    /*
     * This section seems to be related to determining the 'm' value,
     * which possibly represents the number of steps or a base dimension.
     * Original thought process for 'm':
     *  - Starting with a base 'm = 10' or 'm = 20'.
     *  - 'di = 1 * 10'
     *  - '2n -> 4: +'
     *  - '(10-4)/2: +,-'
     */
    var m = 20 ; // Initialize 'm' with a base value.

    // Adjust 'm' based on the parity of the first coordinate pair's components.
    if ( xys[0][0] % 2 === 1 ) m ++ ; // If x-coordinate is odd, increment 'm'.
    if ( xys[0][1] % 2 === 1 ) m ++ ; // If y-coordinate is odd, increment 'm'.

    console . log( m ) ; // Output the final calculated 'm' value.

    var ds = [ ] ; // Initialize an array for 'ds'.
    ds . length = m ; // Set its length to 'm'.
    ds . fill( 1 ) ; // Fill the array with ones.
    ds = ds . join( ' ' ) ; // Join the elements with spaces to form a string.
    console . log( ds ) ; // Output the 'ds' string.

    // Loop through each coordinate pair to generate movement strings.
    for ( var i = 0 ; i < n ; i ++ ) {
        var str = '' ; // Initialize an empty string for the current movements.
        var xy = xys[i] ; // Get the current coordinate pair.

        // Adjust coordinates and add 'R' to string based on parity of x.
        if ( xy[0] % 2 === 1 ) {
            str += 'R' ;
            xy[0] ++ ;
        }
        // Adjust coordinates and add 'R' to string based on parity of y.
        if ( xy[1] % 2 === 1 ) {
            str += 'R' ;
            xy[1] ++ ;
        }

        // Append 'R' characters based on (10 + x) / 2.
        str += '' . padEnd( ( 10 + xy[0] ) / 2 , 'R' ) ;
        // Append 'L' characters based on (10 - x) / 2.
        str += '' . padEnd( ( 10 - xy[0] ) / 2 , 'L' ) ;
        // Append 'U' characters based on (10 + y) / 2.
        str += '' . padEnd( ( 10 + xy[1] ) / 2 , 'U' ) ;
        // Append 'D' characters based on (10 - y) / 2.
        str += '' . padEnd( ( 10 - xy[1] ) / 2 , 'D' ) ;

        console . log( str ) ; // Output the generated movement string for the current pair.
    }

    return 0 ; // Indicate successful execution.
}
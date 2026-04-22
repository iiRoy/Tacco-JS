/* This is a Type I clone of the original JavaScript code.
 * It maintains the exact same logical and structural integrity,
 * with only variations in whitespace and comments.
 * All identifiers, operators, and expressions remain unchanged.
 */

var GET = ( function ( ) {

    // Inner function 'f' acts as the public interface for GET
    function f ( s ) {

        return new g ( s ) ;

    }

    // Inner constructor function 'g' for processing input strings
    function g ( s ) {

        /* Initialize _s with trimmed and split lines,
         * and _y as the current line index.
         */
        this . _s = s . trim ( ) . split ( "\n" ) ;
        this . _y = 0 ;

    }

    // Prototype method 'a' to get a single value (number or string)
    g . prototype . a = function ( f ) {

        var s = this . _s ,
            y = this . _y ,
            r ;

        /* If the current line is a string,
         * split it by space and reverse it for pop operation.
         */
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // Pop the last element from the current line
        r = s [ y ] . pop ( ) ;

        // If the line becomes empty, advance to the next line
        if ( ! s [ y ] . length ) {
            this . _y ++ ;
        }

        // Return as string if 'f' is true, else convert to number
        return f ? r : + r ;

    } ;

    // Prototype method 'l' to get a line of values
    g . prototype . l = function ( f ) {

        // Get the current line, split by space, and advance line index
        var s = this . _s [ this . _y ++ ] . split ( " " ) ;

        // Return as strings if 'f' is true, else convert all to numbers
        return f ? s : s . map ( a => + a ) ;

    } ;

    // Prototype method 'm' to get a matrix (n lines of space-separated values)
    g . prototype . m = function ( n , f ) {

        // Slice 'n' lines, split each by space
        var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

        /* Return as string matrix if 'f' is true,
         * else convert all elements in the matrix to numbers.
         */
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;

    } ;

    // Prototype method 'r' to get 'n' raw lines
    g . prototype . r = function ( n , f ) {

        // Slice 'n' lines directly
        var r = this . _s . slice ( this . _y , this . _y += n ) ;

        // Return as strings if 'f' is true, else convert all to numbers
        return f ? r : r . map ( a => + a ) ;

    } ;

    // Return the public interface function 'f'
    return f ;

} ) ( ) ; // End of IIFE for GET utility


// Initialize 'o' with input data read from standard input
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * Function 'xArray' for creating multi-dimensional arrays.
 * This function uses `eval` and is generally not recommended for security reasons
 * in production environments with untrusted input, but it's part of the original code.
 */
function xArray ( v ) {

    var a = arguments ,
        l = a . length ,
        r = "Array(a[" + -- l + "]).fill(v)" ;

    // Build the string representation of the array creation
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to create the array
    return eval ( r ) ;

}


// Execute the main function and log its return value to the console.
console . log ( main ( ) ) ;


/*
 * The main function where the core logic of the program resides.
 * It reads input using the 'o' (GET) utility and performs calculations.
 */
function main ( ) {

    // Read the number of elements 'n' from input
    var n = o . a ( ) ;

    // Read a line of heights 'h' from input
    var h = o . l ( ) ;

    // Initialize 'ans' to count visible elements
    var ans = 0 ;

    // Initialize 'mx' to store the maximum height encountered so far
    var mx = 0 ;

    /*
     * Loop through the heights array to determine
     * how many elements are visible from the left.
     */
    for ( var i = 0 ; i < n ; i ++ ) {

        // If the current height is greater than or equal to the maximum seen so far
        if ( mx <= h [ i ] ) {
            // Update the maximum height
            mx = h [ i ] ;
            // Increment the answer counter
            ans ++ ;
        }

    }

    // Return the final count of visible elements
    return ans ;

}
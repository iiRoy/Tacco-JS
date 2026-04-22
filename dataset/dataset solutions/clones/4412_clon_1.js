/*
 * This file contains a solution to a programming problem.
 * It uses a custom input reader and a main function for logic.
 *
 * Author: [Anonymous]
 * Date: [Today's Date]
 * Version: 1.0.0
 */


// The GET function is an immediately invoked function expression (IIFE)
// that returns a factory function 'f' for creating 'g' objects.
var   GET = ( function ( ) {

    // Inner function 'f' acts as a factory for 'g' instances.
    function f ( s ) {
        return new g ( s ) ;
    } // End of function f


    // Constructor function 'g' for processing input strings.
    function g ( s ) {
        // Initialize _s by trimming the input string 's', then splitting it by newlines.
        this. _s = s . trim ( ) . split ( "\n" ) ;
        // _y acts as a line counter or index.
        this. _y = 0 ;
    } // End of function g


    // 'a' prototype method: Reads an item from the current line.
    // 'f' is a flag; if true, returns string, otherwise returns number.
    g. prototype . a = function ( f ) {
        var s = this . _s , // Reference to the array of input lines.
            y = this . _y , // Current line index.
            r ;             // Variable to hold the result.

        // If the current line hasn't been processed into an array of words yet, do it.
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ; // Split by space and reverse for easy popping.
        }

        r = s [ y ] . pop ( ) ; // Get the last element (original first element) from the current line.

        // If the current line is now empty, advance to the next line.
        if ( ! s [ y ] . length ) {
            this . _y ++ ;
        }

        // Return 'r' as a string if 'f' is true, otherwise convert to number.
        return f ? r : + r ;
    } ; // End of g.prototype.a


    // 'l' prototype method: Reads an entire line.
    // 'f' is a flag; if true, returns array of strings, otherwise array of numbers.
    g. prototype . l = function ( f ) {
        // Get the current line, increment line index, then split by space.
        var s = this . _s [ this . _y ++ ] . split ( " " ) ;
        // Return based on 'f' flag.
        return f ? s : s . map ( a => + a ) ;
    } ; // End of g.prototype.l


    // 'm' prototype method: Reads 'n' lines as a matrix.
    // 'f' is a flag; if true, returns string matrix, otherwise number matrix.
    g. prototype . m = function ( n , f ) {
        var r = this . _s . slice ( this . _y , this . _y += n ) // Get 'n' lines.
                      . map ( a => a . split ( " " ) ) ;        // Split each line by space.
        // Return based on 'f' flag.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ; // End of g.prototype.m


    // 'r' prototype method: Reads 'n' lines as a raw array.
    // 'f' is a flag; if true, returns string array, otherwise number array.
    g. prototype . r = function ( n , f ) {
        var r = this . _s . slice ( this . _y , this . _y += n ) ; // Get 'n' lines.
        // Return based on 'f' flag.
        return f ? r : r . map ( a => + a ) ;
    } ; // End of g.prototype.r


    return f ; // The IIFE returns the factory function 'f'.

} ) ( ) ; // End of GET IIFE


// MA function: Creates a 2D array (matrix) initialized with zeros.
// h: height (number of rows), w: width (number of columns).
function MA ( h , w ) {
    return Array ( h ) . fill ( 0 ) . map ( a => Array ( w ) . fill ( 0 ) ) ;
} // End of MA function


// Initialize the input reader 'o' by reading from /dev/stdin.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// Define a modulo constant.
var mod = 1e9 + 7 ; // Common large prime number for modulo operations.


// Execute the main logic and print the result to console.
console . log ( main ( ) ) ;


// Main function containing the core logic of the program.
function main ( ) {

    var n = o . a ( ) ;      // Read the first integer 'n'.
    var s = o . a ( 1 ) ;    // Read the string 's' (first character of input).
    var t = o . a ( 1 ) ;    // Read the string 't' (second character of input).

    // Initialize answer, 'l' (last character was a pair), and 'i' (loop index).
    var ans = 3 ,
        l   = 0 ,
        i   = 1 ;

    // Initial check for the first characters.
    if ( s [ 0 ] !== t [ 0 ] ) {
        ans = 6 ; // If different, base is 6.
        l   = 1 ; // Mark that the last characters were different.
        i   = 2 ; // Start loop from index 2 as first two are handled.
    }

    // Loop through the remaining characters.
    for ( ; i < n ; i ++ ) {

        if ( s [ i ] === t [ i ] ) {
            // Current characters are the same.
            if ( ! l ) { // If previous characters were also same (or start of sequence)
                ans *= 2 ; // Multiply by 2.
            }
            l = 0 ; // Reset 'l' as current characters are same.
        } else {
            // Current characters are different.
            i ++ ; // Advance 'i' again, because different characters are always processed in pairs (s[i], s[i+1] vs t[i], t[i+1]).
            if ( l ) { // If previous characters were also different.
                ans *= 3 ; // Multiply by 3.
            } else { // If previous characters were the same.
                ans *= 2 ; // Multiply by 2.
            }
            l = 1 ; // Mark that current characters are different.
        }

        ans %= mod ; // Apply modulo operation to keep 'ans' within bounds.

    } // End of for loop

    return ans ; // Return the final calculated answer.

} // End of main function

/*
 * End of program.
 * Thank you for reviewing!
 */
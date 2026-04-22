var GET = ( function ( ) {

    // This function acts as a factory for the data parser.
    function f ( s ) {
        return new g( s ) ;
    }

    // The main data parsing class.
    function g ( s ) {
        // Store the raw input string, trimmed and split by newlines.
        this._s = s . trim ( ) . split ( "\n" ) ;
        // Initialize the current line index.
        this._y = 0 ;
    }

    // Method 'a': Reads a single item.
    // If 'f' is true, returns as a string; otherwise, as a number.
    g . prototype . a = function ( f ) {
        var s = this._s ,
            y = this._y ,
            r ;

        // If the current line hasn't been processed yet, split and reverse it.
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // Pop the last item (which was originally the first due to reverse).
        r = s [ y ] . pop ( ) ;

        // If the current line is now empty, advance to the next line.
        if ( ! s [ y ] . length ) {
            this._y ++ ;
        }

        // Return the item, converting to number if 'f' is false.
        return f ? r : + r ;
    } ;

    // Method 'l': Reads an entire line as an array of items.
    // If 'f' is true, returns as strings; otherwise, as numbers.
    g . prototype . l = function ( f ) {
        // Get the current line, split by spaces, and advance the line index.
        var s = this._s [ this._y ++ ] . split ( " " ) ;

        // Return the array, mapping to numbers if 'f' is false.
        return f ? s : s . map ( a => + a ) ;
    } ;

    // Method 'm': Reads 'n' lines as a matrix.
    // If 'f' is true, returns as strings; otherwise, as numbers.
    g . prototype . m = function ( n , f ) {
        // Slice 'n' lines from the input, split each line by spaces.
        var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

        // Return the matrix, mapping to numbers if 'f' is false.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;

    // Method 'r': Reads 'n' lines as a list.
    // If 'f' is true, returns as strings; otherwise, as numbers.
    g . prototype . r = function ( n , f ) {
        // Slice 'n' lines from the input.
        var r = this._s . slice ( this._y , this._y += n ) ;

        // Return the list, mapping to numbers if 'f' is false.
        return f ? r : r . map ( a => + a ) ;
    } ;

    // The IIFE returns the 'f' function (the factory).
    return f ;

} ) ( ) ;


// Initialize the data reader 'o' by reading from standard input.
// This uses Node.js 'fs' module to read the entire file synchronously.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Execute the main logic and print its result to the console.
console . log ( main ( ) ) ;


/**
 * The main function containing the core logic of the program.
 * It reads input, performs calculations, and returns the final answer.
 */
function main ( ) {

    // Read the first number 'n' from the input.
    var n = o . a ( ) ;

    // Read 'n' lines as strings, representing a square matrix 's'.
    var s = o . r ( n , 1 ) ;

    // Duplicate the matrix rows for easier circular checks.
    // This effectively creates a matrix of size 2n x n, where the bottom half
    // is a copy of the top half.
    for ( var i = 0 ; i < n ; i ++ ) {
        s [ i + n ] = s [ i ] ;
    }

    // Initialize the answer variable.
    var ans = 0 ;

    // Outer loop: Iterate 'n' times, representing different starting shifts.
    for ( i = 0 ; i < n ; i ++ ) {

        // Flag 'f' to indicate if the current configuration is valid.
        // 1 means valid, 0 means invalid.
        var f = 1 ;

        // Label 'j' for breaking out of the inner nested loops.
        j :
        // Nested loops to check for symmetry property.
        // This checks if s[j+i][k] is equal to s[k+i][j] for all relevant j, k.
        for ( var j = 0 ; j < n ; j ++ ) {
            for ( var k = j + 1 ; k < n ; k ++ ) {

                // If the elements are not equal, the configuration is invalid.
                if ( s [ j + i ] [ k ] === s [ k + i ] [ j ] ) {
                    continue ; // Continue to the next pair if equal.
                }

                // If not equal, set flag to 0 and break from the 'j' labeled loop.
                f = 0 ;
                break j ;
            }
        }

        // If the flag 'f' is still 1 (meaning all checks passed for this 'i'),
        // add 'n' to the total answer.
        if ( f ) {
            ans += n ;
        }
    }

    // Return the final calculated answer.
    return ans ;
}
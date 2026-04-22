/* This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered.
 * No identifiers, variable names, function names, operators, or expressions have been changed.
 */

var GET = (

    function (  )  {
        // This is the factory function 'f'
        function f ( s ) {
             return   new g ( s ) ;
        }

        /*
         * Constructor function 'g'
         * Initializes the internal state for parsing input.
         */
        function g ( s ) {
            this . _s = s.trim(  )  .split( "\n" ) ;
            this . _y = 0 ;
        }

        // Prototype method 'a' for reading a single item
        g . prototype . a = function ( f ) {
            var s = this . _s ,
                y = this . _y ,
                r ;

            // If the current line is a string, process it
            if ( typeof s [ y ] === "string" ) {
                s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
            }

            r = s [ y ] . pop ( ) ;

            // If the current line is exhausted, move to the next line
            if ( ! s [ y ] . length ) {
                this . _y ++ ;
            }

            // Return the result, converted to number if 'f' is falsy
            return f ? r : + r ;
        } ;

        // Prototype method 'l' for reading a line of space-separated items
        g . prototype . l = function ( f ) {
            var s = this . _s [ this . _y ++ ] . split ( " " ) ;

            // Return as strings or numbers based on 'f'
            return f ? s : s . map ( a => + a ) ;
        } ;

        /*
         * Prototype method 'm' for reading a matrix (n lines)
         * Each line is space-separated.
         */
        g . prototype . m = function ( n , f ) {
            var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

            // Return as strings or numbers based on 'f'
            return f ? r : r . map ( a => a . map ( a => + a ) ) ;
        } ;

        // Prototype method 'r' for reading raw lines (n lines)
        g . prototype . r = function ( n , f ) {
            var r = this . _s . slice ( this . _y , this . _y += n ) ;

            // Return as strings or numbers based on 'f'
            return f ? r : r . map ( a => + a ) ;
        } ;

        // The IIFE returns the factory function 'f'
        return f ;
    }
) (  ) ;

// Initialize the input object 'o' by reading from /dev/stdin
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

/**
 * Creates a multi-dimensional array initialized with a value.
 * The last argument is the initial value.
 * All preceding arguments are dimensions.
 * @param {*} v The initial value.
 * @returns {Array} The initialized array.
 */
function xArray ( v ) {
    var a = arguments ,
        l = a . length ,
        r = "Array(a[" + --l + "]).fill(v)" ;

    while ( --l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    return eval ( r ) ;
}


// Call the main function and print its result to the console.
console . log ( main ( ) ) ;


/*
 * The main logic of the program.
 * Reads input, performs calculations, and returns the answer.
 */
function main ( ) {

    var n = o . a ( ) ; // Read an integer 'n'
    var s = o . a ( 1 ) ; // Read a string 's'

    var ans = 9e9 ; // Initialize answer with a large value (infinity)

    // Initialize two arrays 'w' and 'b' with dimensions n+1, filled with 0
    var w = xArray ( 0 , n + 1 ) ;
    var b = xArray ( 0 , n + 1 ) ;

    // Calculate prefix sums for '#' characters in 's'
    for ( var i = 0 ; i < n ; i ++ ) {
        w [ i + 1 ] = w [ i ] ;
        if ( s [ i ] === "#" ) {
            w [ i + 1 ] ++ ;
        }
    }

    // Calculate suffix sums for '.' characters in 's'
    // Loop goes backwards from n-1 down to 0
    for ( var i = i - 1 ; i >= 0 ; i -- ) {
        b [ i ] = b [ i + 1 ] ;
        if ( s [ i ] === "." ) {
            b [ i ] ++ ;
        }
    }

    // Find the minimum sum of 'w' and 'b' at each index
    for ( var i = 0 ; i <= n ; i ++ ) {
        var t = w [ i ] + b [ i ] ; // Current total
        if ( t < ans ) {
            ans = t ; // Update minimum answer if 't' is smaller
        }
    }

    return ans ; // Return the final minimum answer
}
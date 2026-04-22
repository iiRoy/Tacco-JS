/*
 * This is a self-executing anonymous function (IIFE)
 * that initializes a GET object for parsing input.
 */
var GET = (

    function ( ) {

        // Internal function to create a new parser instance.
        function f ( s ) {
            return new g ( s ) ;
        }

        // Constructor for the parser object.
        function g ( s ) {
            // Store lines after trimming and splitting.
            this . _s = s . trim ( ) . split ( "\n" ) ;
            // Initialize line index.
            this . _y = 0 ;
        }


        // Method 'a': Reads a single item, optionally as a string.
        g . prototype . a = function ( f ) {
            var s = this . _s ,
                y = this . _y ,
                r ;

            /*
             * If the current line hasn't been processed yet,
             * split it by spaces and reverse it for stack-like access.
             */
            if ( typeof s [ y ] === "string" )
                s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;

            // Pop the last element.
            r = s [ y ] . pop ( ) ;

            // If the line is now empty, move to the next line.
            if ( ! s [ y ] . length )
                this . _y ++ ;

            // Return as string if 'f' is true, otherwise as number.
            return f ? r : + r ;
        } ;


        // Method 'l': Reads a whole line, optionally as strings.
        g . prototype . l = function ( f ) {
            // Get current line, split by spaces, then increment line index.
            var s = this . _s [ this . _y ++ ] . split ( " " ) ;

            // Return as strings if 'f' is true, otherwise map to numbers.
            return f ? s : s . map ( a => + a ) ;
        } ;


        // Method 'm': Reads a matrix (multiple lines), optionally as strings.
        g . prototype . m = function ( n , f ) {
            /*
             * Slice 'n' lines from _s, increment _y,
             * then map each line to an array of strings.
             */
            var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

            // Return as string arrays if 'f' is true, otherwise map inner arrays to numbers.
            return f ? r : r . map ( a => a . map ( a => + a ) ) ;
        } ;


        // Method 'r': Reads raw lines, optionally as strings.
        g . prototype . r = function ( n , f ) {
            // Slice 'n' lines from _s, increment _y.
            var r = this . _s . slice ( this . _y , this . _y += n ) ;

            // Return as strings if 'f' is true, otherwise map to numbers.
            return f ? r : r . map ( a => + a ) ;
        } ;

        // The IIFE returns the 'f' function, which is the public API.
        return f ;

    }
) ( ) ;


/*
 * Initialize the input parser 'o' by reading
 * from standard input (stdin) using Node.js 'fs' module.
 */
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * Helper function to create multi-dimensional arrays
 * initialized with a specified value 'v'.
 * The dimensions are passed as additional arguments.
 */
function xArray ( v ) {
    var a = arguments ,
        l = a . length ,
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ;

    // Build the array creation string dynamically.
    while ( --l )
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;

    // Evaluate the constructed string to create the array.
    return eval ( r ) ;
}


// Declare global variables used across functions.
var n , s , a ;


// Call the main function and print its result to the console.
console . log ( main ( ) ) ;


/*
 * The primary function that orchestrates
 * the problem-solving logic.
 */
function main ( ) {
    // Read 'n' from input.
    n = o . a ( ) ;

    // Read a list of numbers 's' from input.
    s = o . l ( ) ;

    // Sort 's' in descending order.
    s . sort ( ( a , b ) => b - a ) ;

    // Initialize a boolean array 'a' of size 2^n.
    a = xArray ( 0 , 1 << n ) ;

    // Set the first element of 'a' to 1.
    a [ 0 ] = 1 ;

    // Start the BFS process and return "Yes" or "No" based on its result.
    return bfs ( [ [ s [ 0 ] , 1 ] ] ) ? "Yes" : "No" ;
}


/*
 * Performs a Breadth-First Search (BFS) like operation
 * to determine if a certain condition is met.
 *
 * @param {Array<Array<number>>} b - The current queue/list of elements.
 * @returns {number} - 1 if successful, 0 if not.
 */
function bfs ( b ) {
    var l = b . length ;
    var al = a . length ;

    // Base case: If the length of 'b' equals 'a.length', return 1 (success).
    if ( l === al )
        return 1 ;

    // Create a new queue 'q' by concatenating 'b'.
    var q = b . concat ( ) ,
        c = 1 ; // Initialize counter 'c'.

    // Iterate through elements in 'b'.
    for ( var i = 0 ; i < l ; i ++ ) {
        // Update 'c' if b[i][1] is greater.
        if ( c < b [ i ] [ 1 ] )
            c = b [ i ] [ 1 ] ;

        // Inner loop to find a suitable 'c'.
        for ( ; c < al ; c ++ ) {
            // If a[c] is already set, skip.
            if ( a [ c ] )
                continue ;

            // If s[c] is less than b[i][0], break the inner loop.
            if ( s [ c ] < b [ i ] [ 0 ] )
                break ;
        }

        // If 'c' reached 'al', it means no suitable element was found.
        if ( c === al )
            return 0 ; // Return 0 (failure).

        // Mark a[c] as 1.
        a [ c ] = 1 ;

        // Push a new pair [s[c], ++c] to the queue 'q'.
        q . push ( [ s [ c ] , ++ c ] ) ;
    }

    // Recursively call bfs with the sorted queue 'q'.
    return bfs ( q . sort ( ( a , b ) => b [ 0 ] - a [ 0 ] ) ) ;
}
var    GET    =    (  function   (  )   {
    // This is an immediately invoked function expression (IIFE)
    // It encapsulates the GET utility.

    /**
     * Factory function to create a new input reader instance.
     * @param {string} s - The raw input string.
     * @returns {g} A new input reader object.
     */
    function f ( s ) {
        return new g(s); /* Return new instance */
    }

    /*
     * Constructor for the input reader.
     * Initializes the internal state.
     */
    function g ( s ) {
        // Trim whitespace and split by newline to get individual lines.
        this._s = s . trim ( ) . split ( "\n" ) ;
        // Initialize the current line index.
        this._y = 0 ;
    }

    /**
     * Reads a single item from the current line.
     * If the current line hasn't been processed, it's reversed and split by space.
     * @param {boolean} f - If true, return as string; otherwise, return as number.
     * @returns {string|number} The read item.
     */
    g . prototype . a = function ( f ) {
        var s = this . _s ,
            y = this . _y ,
            r ;

        // Check if the current line needs to be processed (split and reversed).
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        r = s [ y ] . pop ( ) ; // Pop the last element (which is the first after reverse).

        // If the current line is exhausted, move to the next.
        if ( ! s [ y ] . length ) {
            this . _y ++ ;
        }

        // Return based on the 'f' flag.
        return f ? r : + r ;
    } ;

    /*
     * Reads an entire line of space-separated items.
     * @param {boolean} f - If true, return as array of strings; otherwise, array of numbers.
     * @returns {Array<string|number>} The array of items from the line.
     */
    g. prototype . l = function ( f ) {
        // Split the current line by space and increment line index.
        var s = this . _s [ this . _y ++ ] . split ( " " ) ;

        // Map to numbers if 'f' is false.
        return f ? s : s . map ( a => + a ) ;
    } ;

    /**
     * Reads 'n' lines as a matrix (array of arrays).
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return matrix of strings; otherwise, matrix of numbers.
     * @returns {Array<Array<string|number>>} The matrix.
     */
    g . prototype . m = function ( n , f ) {
        // Slice 'n' lines, split each by space.
        var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

        // Map inner arrays to numbers if 'f' is false.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;

    /*
     * Reads 'n' lines as a simple array.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return array of strings; otherwise, array of numbers.
     * @returns {Array<string|number>} The array of lines.
     */
    g . prototype . r = function ( n , f ) {
        // Slice 'n' lines directly.
        var r = this . _s . slice ( this . _y , this . _y += n ) ;

        // Map to numbers if 'f' is false.
        return f ? r : r . map ( a => + a ) ;
    } ;

    // Return the factory function 'f' from the IIFE.
    return f ;
} ) ( ) ;


// Initialize the input reader 'o' by reading from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;



// Execute the main logic and print its result to console.
console . log ( main ( ) ) ;


/*
 * Main function containing the problem's solution logic.
 * This function processes input and computes the final answer.
 */
function main ( ) {

    // Read initial parameters from input.
    var n = o . a ( ) ; // First number
    var a = o . a ( ) ; // Second number
    var b = o . a ( ) ; // Third number

    var x = 0 ; // Counter variable

    // Loop through bits to count set bits in a and b.
    for ( var i = 0 ; i < n ; i ++ ) {
        var t = 1 << i ; // Current bit mask

        // Check if the i-th bit is set in 'a'
        if ( a & t ) {
            x ++ ; // Increment if set
        }

        // Check if the i-th bit is set in 'b'
        if ( b & t ) {
            x ++ ; // Increment if set
        }
    }

    // If total set bits is even, it's impossible.
    if ( x % 2 === 0 ) {
        return "NO" ;
    }

    // Array to store the path/sequence of numbers.
    var ans = [ ] ;

    // Call the recursive helper function.
    f ( a , b , 0 ) ;

    // If a solution is found, print "YES" and the sequence.
    console . log ( "YES" ) ;
    return ans . join ( " " ) ; // Join elements with a space


    /**
     * Recursive helper function to find the transformation path.
     * @param {number} a - Current starting number.
     * @param {number} b - Target ending number.
     * @param {number} x - Mask of bits that have been "fixed" or used.
     */
    function f ( a , b , x ) {
        // Base case: if a and b are the same, we've found a path segment.
        if ( a === b ) {
            ans . push ( a ) ; // Add to the answer sequence.
            return ;
        }

        // Calculate XOR difference, and initialize temporary variables.
        var c = a ^ b ,
            y = a ,
            z = a ,
            u = 1 ,
            v = 1 ;

        // Iterate through each bit position.
        for ( var i = 0 ; i < n ; i ++ ) {
            var t = 1 << i ; // Current bit mask.

            // Skip if this bit is already in the 'fixed' mask 'x'.
            if ( t & x ) {
                continue ;
            }

            // Case 1: Bit 'i' is the same in 'a' and 'b' (c & t is 0).
            if ( ( c & t ) === 0 ) {
                if ( u ) { // Only perform this transformation once.
                    u = 0 ,
                    y ^= t , // Flip bit 'i' in 'y'.
                    z ^= t ; // Flip bit 'i' in 'z'.
                }
            } else { // Case 2: Bit 'i' is different in 'a' and 'b' (c & t is 1).
                if ( v ) { // Only perform this transformation once.
                    v = 0 ,
                    z ^= t , // Flip bit 'i' in 'z'.
                    x |= t ; // Mark bit 'i' as fixed in 'x'.
                }
            }
        }

        // Recursively call for the two subproblems.
        f ( a , y , x ) ; // Path from a to y.
        f ( z , b , x ) ; // Path from z to b.
    }
}
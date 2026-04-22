var GET = (

    function (  ) {

        /* This function acts as a factory for the 'g' object.
         * It takes a string 's' and returns a new instance of 'g'. */
        function f( s )
        {
            return new g ( s ) ;
        }

        /* The constructor function 'g' initializes the input string.
         * It processes the string by trimming whitespace and splitting it into lines. */
        function g ( s )
        {
            this._s = s . trim ( ) . split ( "\n" ) ; /* _s stores lines of input */
            this._y = 0 ; // _y is the current line index
        }


        // Prototype method 'a' for 'g' objects.
        // It retrieves and processes an item from the current line.
        g . prototype . a = function ( f )
        {
            var s = this._s ,
                y = this._y , // Current line index
                r ;

            // If the current line hasn't been processed into an array, do so.
            if ( typeof s [ y ] === "string" )
            {
                s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
            }

            // Pop the last element from the current line's array.
            r = s [ y ] . pop ( ) ;

            // If the current line is now empty, advance to the next line.
            if ( ! s [ y ] . length )
            {
                this._y ++ ;
            }

            // Return the value, optionally parsed as a number.
            return f ? r : + r ;
        } ;

        // Prototype method 'l' for 'g' objects.
        // It reads an entire line of space-separated values.
        g . prototype . l = function ( f )
        {
            // Get the current line, increment line index, and split by space.
            var s = this._s [ this._y ++ ] . split ( " " ) ;

            // Return values as strings or numbers.
            return f ? s : s . map ( a => + a ) ;
        } ;


        // Prototype method 'm' for 'g' objects.
        // It reads 'n' lines and treats them as a matrix of space-separated values.
        g . prototype . m = function ( n , f )
        {
            // Slice 'n' lines, and for each line, split it by space.
            var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

            // Return matrix of strings or numbers.
            return f ? r : r . map ( a => a . map ( a => + a ) ) ;
        } ;

        // Prototype method 'r' for 'g' objects.
        // It reads 'n' lines as a list of individual values.
        g . prototype . r = function ( n , f )
        {
            // Slice 'n' lines from the input.
            var r = this._s . slice ( this._y , this._y += n ) ;

            // Return values as strings or numbers.
            return f ? r : r . map ( a => + a ) ;
        } ;


        return f ; // The factory function is returned by the IIFE.

    }
) ( ) ;


// Initialize the 'o' object by reading input from stdin.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/* Main program execution starts here.
 * The result of the 'main' function is printed to the console. */
console . log ( main ( ) ) ;


/**
 * @function main
 * @description This is the primary function containing the core logic
 *              of the program. It reads input, performs calculations
 *              related to bit manipulation, and then calls a recursive
 *              helper function to generate a specific sequence.
 * @returns {string} The final result, either "NO" or "YES" followed by a space-separated sequence.
 */
function main ( )
{
    // Read the integer 'n' from input using the 'o' object's 'a' method.
    var n = o . a ( ) ;
    // Read the integer 'a' from input.
    var a = o . a ( ) ;
    // Read the integer 'b' from input.
    var b = o . a ( ) ;

    // Initialize a counter 'x' to zero.
    var x = 0 ;

    // Loop 'n' times to count set bits in 'a' and 'b'.
    for ( var i = 0 ; i < n ; i ++ )
    {
        // Calculate the bitmask for the current position 'i'.
        var t = 1 << i ;

        // If the 'i'-th bit is set in 'a', increment 'x'.
        if ( a & t )
        {
            x ++ ;
        }

        // If the 'i'-th bit is set in 'b', increment 'x'.
        if ( b & t )
        {
            x ++ ;
        }
    }


    // Check if the total count of set bits is even. If so, return "NO".
    if ( x % 2 === 0 )
    {
        return "NO" ;
    }

    // Initialize an array 'ans' with a size of 2^n.
    var ans = Array ( 1 << n ) ;

    // Call the recursive helper function 'f' with initial parameters.
    // This function populates the 'ans' array.
    f ( a , b , 0 , 0 ) ;

    // If the program reaches this point, the condition was met, so print "YES".
    console . log ( "YES" ) ;

    // Join the elements of the 'ans' array with spaces and return the string.
    return ans . join ( " " ) ;


    /*
     * @function f
     * @description This is a recursive helper function responsible for populating
     *              the 'ans' array based on bitwise operations and a specific
     *              Gray code-like sequence generation.
     * @param {number} a - Current 'a' value.
     * @param {number} b - Target 'b' value.
     * @param {number} x - Current 'x' bitmask, used to track processed bits.
     * @param {number} k - Current index for the 'ans' array.
     * @returns {void}
     */
    function f ( a , b , x , k )
    {
        // Base case: If 'a' equals 'b', we've found a path, store 'a' in 'ans' and return.
        if ( a === b )
        {
            ans [ k ] = a ;
            return ;
        }

        // Calculate bitwise difference 'c', and initialize 'y', 'z', 'u', 'v', 's'.
        var c = a ^ b ,
            y = a ,
            z = a ,
            u = 1 ,
            v = 1 ,
            s = 0 ;

        // Iterate through each bit position from 0 to n-1.
        for ( var i = 0 ; i < n ; i ++ )
        {
            var t = 1 << i ; // Bitmask for the current position.

            // If the current bit 't' is already part of 'x' (processed), increment 's' and continue.
            if ( t & x )
            {
                s ++ ;
                continue ;
            }

            // If the current bit 't' is NOT set in the difference 'c'.
            // This means 'a' and 'b' have the same bit at this position.
            if ( ( c & t ) === 0 )
            {
                // If 'u' is 1 (first such bit encountered), toggle this bit in 'y' and 'z'.
                if ( u )
                {
                    u = 0 ,
                    y ^= t ,
                    z ^= t ;
                }
            }
            // If the current bit 't' IS set in the difference 'c'.
            // This means 'a' and 'b' have different bits at this position.
            else
            {
                // If 'v' is 1 (first such bit encountered), toggle this bit in 'z' and add it to 'x'.
                if ( v )
                {
                    v = 0 ,
                    z ^= t ,
                    x |= t ;
                }
            }
        }

        // Recursive calls to explore the two branches.
        // The second call adjusts the 'k' index based on 'n' and 's'.
        f ( a , y , x , k ) ;
        f ( z , b , x , k + ( 1 << n - s - 1 ) ) ;
    }
}
/*
 * This is an Immediately Invoked Function Expression (IIFE)
 * which encapsulates the GET factory function.
 * It creates a utility for parsing input data.
 */
var GET = (
    function () {

        /*
         * Factory function 'f' to create a new input reader instance.
         * @param {string} s - The raw input string.
         * @returns {g} A new instance of the input reader.
         */
        function f( s ) {
            // Simply instantiates and returns a new 'g' object.
            return new g( s );
        }


        /*
         * Constructor function 'g' for the input reader.
         * Initializes the internal state for reading lines.
         * @param {string} s - The raw input string, typically multi-line.
         */
        function g( s ) {
            // Trim whitespace from the string and split it into an array of lines.
            this._s = s . trim() . split( "\n" );
            // Initialize the current line index to 0.
            this._y = 0 ;
        }


        /*
         * Prototype method 'a' for reading an "atomic" value.
         * This method reads the last item from the current line.
         * If the line is exhausted, it moves to the next line.
         * @param {boolean} f - If true, return as string; otherwise, return as number.
         * @returns {*} The parsed value.
         */
        g . prototype . a = function ( f ) {
            // Access the internal array of strings (lines).
            var s = this . _s ,
                // Get the current line index.
                y = this . _y ,
                // Declare a variable for the result.
                r ;

            // Check if the current line exists and is a string.
            if ( typeof s[y] === "string" ) {
                // If it's a string, split it by spaces and reverse the order.
                // This allows popping from the end to get elements in original order.
                s[y] = s[y] . split( " " ) . reverse() ;
            }

            // Pop the last element from the (reversed) current line.
            r = s[y] . pop() ;

            // If the current line is now empty, advance to the next line.
            if ( ! s[y] . length ) {
                this . _y ++ ;
            }

            // Return the result, either as string or converted to a number.
            return f ? r : + r ;
        };


        /*
         * Prototype method 'l' for reading an entire line.
         * @param {boolean} f - If true, return array of strings; otherwise, array of numbers.
         * @returns {Array} An array of parsed values from the line.
         */
        g . prototype . l = function ( f ) {
            // Get the current line, increment the line index, then split by spaces.
            var s = this . _s[ this . _y ++ ] . split( " " ) ;

            // Return the array, converting elements to numbers if 'f' is false.
            return f ? s : s . map( a => + a ) ;
        };


        /*
         * Prototype method 'm' for reading a matrix (multiple lines, multiple columns).
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - If true, return matrix of strings; otherwise, matrix of numbers.
         * @returns {Array<Array>} A 2D array representing the matrix.
         */
        g . prototype . m = function ( n , f ) {
            // Slice 'n' lines from the input, then map each line to an array of strings.
            var r = this . _s . slice( this . _y , this . _y += n ) . map( a => a . split( " " ) ) ;

            // Return the matrix, converting elements to numbers if 'f' is false.
            return f ? r : r . map( a => a . map( a => + a ) ) ;
        };


        /*
         * Prototype method 'r' for reading raw lines (a vector of lines).
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - If true, return array of strings; otherwise, array of numbers.
         * @returns {Array} An array of parsed values from the lines.
         */
        g . prototype . r = function ( n , f ) {
            // Slice 'n' lines directly from the input array.
            var r = this . _s . slice( this . _y , this . _y += n ) ;

            // Return the array, converting elements to numbers if 'f' is false.
            return f ? r : r . map( a => + a ) ;
        };


        // The IIFE returns the 'f' factory function, which is assigned to GET.
        return f ;

    }
)();


/*
 * Initialize the input reader 'o' by reading from standard input.
 * It uses Node.js's 'fs' module to read the file synchronously.
 * The input is assumed to be UTF-8 encoded.
 */
var o = GET( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) );


/*
 * Call the main function and print its return value to the console.
 * The main function is expected to return a string, often multi-line.
 */
console . log( main() );


/*
 * The main application logic.
 * This function solves a specific problem, likely involving prime numbers.
 * It calculates counts of "similar numbers" up to 10^5.
 */
function main() {

    // Read the number of queries 'q' using the input reader 'o'.
    var q = o . a() ;

    // Initialize an array 'a' of size 100001 (1e5 + 1) with all elements set to 1.
    // This array will be used as a sieve to find prime numbers.
    var a = Array( 1e5 + 1 ) . fill( 1 ) ;

    // Initialize an array 'b' to store prefix sums of "similar numbers".
    // b[i] will store the count of similar numbers up to 'i'.
    var b = [ 0 , 0 ] ;

    // 0 and 1 are not prime numbers, so mark them as such in the sieve.
    a[ 0 ] = a[ 1 ] = 0 ;


    /*
     * Sieve of Eratosthenes implementation, combined with counting "similar numbers".
     * A "similar number" 'i' is defined as a prime number where (i+1)/2 is also prime.
     */
    for ( var i = 2 ; i <= 1e5 ; i ++ ) {

        // If 'a[i]' is 1, it means 'i' is currently considered a prime number.
        if ( a[i] ) {

            // Mark all multiples of 'i' (starting from i*i, but here i+i for efficiency/simplicity)
            // as not prime (0) in the sieve.
            for ( var j = i + i ; j <= 1e5 ; j += i ) {
                a[j] = 0 ;
            }

            // Check if 'i' is a "similar number".
            // This means 'i' itself is prime (a[i] is 1)
            // AND (i+1)/2 is also prime (a[(i+1)/2] is 1).
            // Note: (i+1)/2 is only an integer if i is odd. All primes > 2 are odd.
            // For i=2, (2+1)/2 = 1.5, which would evaluate a[1] which is 0. So 2 is not similar.
            if ( a[ ( i + 1 ) / 2 ] ) {
                // If 'i' is a similar number, increment the count from the previous total.
                b[i] = b[ i - 1 ] + 1 ;
            } else {
                // If 'i' is prime but not similar, carry over the previous total.
                b[i] = b[ i - 1 ] ;
            }

        } else {
            // If 'i' is not prime, it cannot be a similar number.
            // Carry over the previous total.
            b[i] = b[ i - 1 ] ;
        }
    }


    // Initialize an array to store the answers for each query.
    var ans = [] ;

    /*
     * Process each query.
     * Each query consists of two numbers, representing a range [t[0], t[1]].
     */
    for ( i = 0 ; i < q ; i ++ ) {

        // Read a line of two numbers (t[0] and t[1]) for the current query.
        var t = o . l() ;

        // Calculate the count of similar numbers within the range [t[0], t[1]].
        // This is done using prefix sums: b[end] - b[start - 1].
        ans[i] = b[ t[1] ] - b[ t[0] - 1 ] ;
    }


    // Join all the answers with newline characters and return the resulting string.
    return ans . join( "\n" ) ;
}
/*
 * This file contains a JavaScript program.
 * It reads input, processes it, and prints an output.
 *
 * The program defines several utility functions for input parsing
 * and a main function that implements the core logic.
 */

    "use strict" ; // Enforce strict mode for better code quality and error checking.

    // Load the file system module to read input from standard input.
var input = require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ;

// Initialize input array 'cin' by splitting the input string by spaces or newlines.
// 'cid' is the current index for reading elements from 'cin'.
var cin = input . split( / |\n/ ) , cid = 0 ;


        /**
         * Utility function to read the next numerical token from the input array.
         * It increments the internal cursor 'cid' after reading.
         * @returns {number} The next token converted to a number.
         */
        function next ( ) {
            return + cin[ cid ++ ] ;
        }

        /*
         * Utility function to read the next string token from the input array.
         * The internal cursor 'cid' is advanced.
         */
        function nextstr ( ) {
            return cin[ cid ++ ] ;
        }

        /**
         * Utility function to read the next token and convert it to a BigInt.
         * This is useful for handling very large integer values that exceed
         * the standard JavaScript number type's safe integer limit.
         * @returns {BigInt} The next token converted to a BigInt.
         */
        function nextbig ( ) {
            return BigInt( cin[ cid ++ ] ) ;
        }


        /*
         * Utility function to read a specified number of items from the input.
         * It can return either an array of strings or an array of numbers.
         *
         * @param {number} n - The count of items to read.
         * @param {boolean} a - If true, returns items as strings; otherwise, converts them to numbers.
         * @returns {Array<string|number>} An array containing the parsed input items.
         */
        function nexts ( n , a ) {
            return a ? cin . slice( cid , cid += n ) : cin . slice( cid , cid += n ) . map( a => + a ) ;
        }

        // Reads a 2D matrix (h rows by w columns) from the input.
        function nextm ( h , w , a ) {
            var r = [ ] , i = 0 ; // 'r' will store the matrix, 'i' is row counter.
            if ( a ) // If 'a' is true, store elements as strings.
                for ( ; i < h ; i ++ )
                    r . push( cin . slice( cid , cid += w ) ) ;
            else // Otherwise, convert elements to numbers.
                for ( ; i < h ; i ++ )
                    r . push( cin . slice( cid , cid += w ) . map( a => + a ) ) ;
            return r ;
        }


        /**
         * Generates an N-dimensional array dynamically.
         * The first argument 'v' is the initial value for the innermost elements.
         * Subsequent arguments specify the sizes of each dimension, from outermost to innermost.
         *
         * @param {*} v - The initial value for the array elements.
         * @param {...number} dimensions - The sizes of the array dimensions.
         * @returns {Array} An N-dimensional array.
         */
        function xArray ( v ) {
            var a = arguments , l = a . length , r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ;
            while ( -- l )
                r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
            return eval( r ) ; // Uses eval to construct the array dynamically.
        }


    // Call the main function to execute the primary program logic
    // and store its return value.
    var myOut = main( ) ;

    // If the main function returns a defined value, print it to the console.
    // The output is explicitly converted to a string.
    if ( myOut !== undefined )
        console . log( String( myOut ) ) ;


    /*
     * The 'main' function encapsulates the core algorithm of this program.
     * It reads an integer 'n', then an array of 'n' numbers.
     * It performs specific operations on this array based on divisibility
     * and sums of elements.
     */
    function main ( ) {

        // Read the first number from input, which determines array size.
        var n = next( ) ;

        // Initialize array 'a'. It starts with a zero, then concatenates 'n' numbers
        // read from the input using the 'nexts' utility function.
        var a = [ 0 ] . concat( nexts( n ) ) ;

        // This loop iterates backwards from 'n' down to 1.
        // In each iteration, 'i' acts as a potential divisor.
        for ( var i = n ; i >= 1 ; i -- ) {

            var sum = 0 ; // Initialize a sum variable for the current divisor 'i'.

            // Inner loop: Iterate through multiples of 'i' within the bounds of 'n'.
            // Add the corresponding array elements to 'sum'.
            for ( var j = i ; j <= n ; j += i ) {
                sum += a[ j ] ;
            }

            // Conditional check: If the calculated sum is negative...
            if ( sum < 0 ) {
                // ...then iterate through the same multiples of 'i' again...
                for ( var j = i ; j <= n ; j += i ) {
                    // ...and set these specific array elements to zero.
                    a[ j ] = 0 ;
                }
            }
        }

        // Finally, calculate and return the total sum of all elements in array 'a'
        // after all modifications have been applied.
        return a . reduce( ( a , b ) => a + b ) ;
    }
// This immediately invoked function expression (IIFE) defines utility functions.
( function utils ( undefined ) {

    /**
     * @function print_float
     * @description Formats a floating-point number to a specified precision.
     * @param {number} val The numeric value to format.
     * @param {number} base (unused in original, but kept for signature)
     * @param {number} pad (unused in original, but kept for signature)
     * @param {number} prec The desired number of decimal places.
     * @returns {string} The formatted number as a string.
     */
    this.print_float = function print_float ( val, base, pad, prec ) {
        // Calculate the power of 10 for rounding.
        var p10 = Math.pow( 10, prec );
        // Round the value and convert to string.
        var ival = "" + Math.round( val * p10 );

        // Handle special case: if the rounded integer part is '0'.
        if ( ival === '0' ) {
            return '0.' + Array( prec + 1 ).join( '0' );
        }

        // Determine the length of the integer part relative to precision.
        var ilen = ival.length - prec;

        // If the integer part length is zero (e.g., 0.123 with prec=3), prepend "0.".
        if ( ilen === 0 ) {
            return "0." + ival.substr( ilen, prec );
        }

        // General case: format with integer part, decimal, and fractional part.
        return ival.substr( 0, ilen ) + "." + ival.substr( ilen, prec );
    };

} ) .call ( global ); // End of utils IIFE.

/*
 * This IIFE defines common mathematical functions.
 * It attaches them to the global object (or `this` context).
 */
( function math ( undefined ) {

    /**
     * Calculates the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
     * @param {number} a The first number.
     * @param {number} b The second number.
     * @returns {number} The GCD of a and b.
     */
    this.gcd = function gcd ( a, b ) {
        return ! b ? a : gcd( b, a % b ) ;
    };


    /**
     * Calculates the least common multiple (LCM) of two numbers.
     * Formula: LCM(a, b) = |a * b| / GCD(a, b)
     * @param {number} a The first number.
     * @param {number} b The second number.
     * @returns {number} The LCM of a and b.
     */
    this.lcm = function lcm ( a, b ) {
        return a / gcd( a, b ) * b ;
    };


    /**
     * Calculates the square of a number.
     * @param {number} x The number to square.
     * @returns {number} The square of x.
     */
    this.sq = function sq ( x ) {
        return x * x ;
    };

} ) .call ( global ) ; // End of math IIFE.

/**
 * Main application entry point and logic.
 * This IIFE encapsulates the core functionality, including I/O handling and problem solving.
 */
( function ( undefined ) {
    // Enable strict mode for better error handling and cleaner code.
    'use strict' ;


    // --- Initialization Module ---
    /*
     * This nested IIFE handles setting up input/output streams and utility functions.
     * It attaches I/O methods to the current `this` context.
     */
    ( function init () {

        // Function to output messages to the console.
        this.output = function () {
            console.log.apply( console, arguments ) ;
        };

        // Initialize standard input stream.
        this.stdin = process.openStdin() ;
        // Set the encoding for the input stream.
        stdin.setEncoding( 'utf8' ) ;

        // Array to store parsed input numbers.
        this.input_list = [] ;

        // Event listener for incoming data chunks from stdin.
        stdin.on( 'data', function ( chunk ) {
            // Extract numbers from the chunk using a regular expression.
            var result = chunk.match( /[-]?\d+/g ) ;
            // Concatenate the extracted numbers to the input list.
            input_list = input_list.concat( result ) ;
        } ) ;

        // Event listener for the 'end' of the input stream.
        stdin.on( 'end', function () {
            // When input ends, trigger the solver.
            fire() ;
        } ) ;

        /**
         * Retrieves and removes the next number from the input list.
         * @returns {number} The next integer from the input.
         */
        this.input_number = function () {
            return parseInt( input_list.splice( 0, 1 )[ 0 ] ) ;
        };

        /**
         * Checks if there are more numbers available in the input list.
         * @returns {boolean} True if there are more numbers, false otherwise.
         */
        this.has_next = function () {
            return ! input_list.length ;
        };

    } ) .call ( this ) ; // End of init IIFE.


    // --- Solver Module ---
    /*
     * This nested IIFE contains the main problem-solving logic.
     * It defines the 'fire' function to start the computation.
     */
    ( function solver () {

        /**
         * Initiates the solving process by scheduling the 'solve' function.
         * Uses setTimeout to allow the event loop to process other tasks if needed.
         */
        this.fire = function () {
            setTimeout( solve, 0, this ) ;
        };

        /**
         * The core solving function.
         * It reads input, performs calculations (GCD and LCM), and outputs results.
         * It recursively schedules itself if more input is available.
         */
        function solve () {
            // Read two numbers from input.
            var args = [ input_number(), input_number() ] ;
            // Calculate GCD and LCM and output them.
            output( gcd.apply( this, args ), lcm.apply( this, args ) ) ;

            // If there's more input, schedule the next solve iteration.
            if ( ! has_next() ) {
                setTimeout( solve, 0, this ) ;
            }
        }

    } ) .call ( this ) ; // End of solver IIFE.

} ) .call ( global ) ; // End of main application IIFE.
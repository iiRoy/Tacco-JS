/* This is a shebang line for UNIX-like systems, allowing the script to be executed directly with node. */
/* It's followed by an 'exit' command to prevent the shell from trying to execute the JS code as shell commands. */
//usr/bin/env node $0 $@;exit


var main = function ( ) {

    // Declare a variable to hold the parsed argument array from each line of input.
    var arg ;

    /*
     * The main processing loop.
     * It continues as long as the first element of the parsed input line (which is a number) is truthy (non-zero).
     *
     * readline() reads a line from input.
     * .split(' ') splits the line by space.
     * .map(Number) converts each part to a number.
     * The result is assigned to 'arg'.
     * The loop condition checks arg[0].
     */
    for ( ; ( arg = readline ( ) . split ( ' ' ) . map ( Number ) ) [ 0 ] ; ) {

        // Extract the two numbers from the current input line.
        var a = arg [ 0 ] , b = arg [ 1 ] ;

        /*
         * This complex line calculates a specific value and prints it.
         *
         * Math.min.apply(null, Array.apply(null, {length: 1 + (a / 2 ^ 0)}).map(function(_, i) { ... }))
         *
         * 1. `(a / 2 ^ 0)`: Integer division of 'a' by 2. `^ 0` is a bitwise XOR with 0, which effectively truncates a float to an integer (like Math.trunc or parseInt).
         * 2. `1 + ...`: Determines the length of an array.
         * 3. `Array.apply(null, {length: ...})`: Creates an array of the specified length with undefined values.
         * 4. `.map(function(_, i) { ... })`: Iterates over this array. `_` is a placeholder for the element, `i` is the index.
         * 5. `Math.hypot(i, a - i)`: Calculates the hypotenuse of a right-angled triangle with sides 'i' and 'a - i'.
         * 6. `Math.abs(b - Math.hypot(...))`: Calculates the absolute difference between 'b' and the hypotenuse.
         * 7. `Math.min.apply(null, ...)`: Finds the minimum value among all calculated absolute differences.
         * 8. `print(...)`: Outputs the result.
         */
        print ( Math . min . apply ( null , Array . apply ( null , { length : 1 + ( a / 2 ^ 0 ) } ) . map ( function ( _ , i ) {
            return Math . abs ( b - Math . hypot ( i , a - i ) ) ;
        } ) ) ) ;
    }
} ;

/*
 * --- Input/Output Handling Section ---
 * This part of the code provides `print` and `readline` functions,
 * adapting to either Node.js environment or V8 standalone (like d8).
 */

if ( typeof process !== 'undefined' ) {

    // This block executes if the script is run in a Node.js environment.
    // Node.js specific implementation for I/O.

    var print = function ( x ) {
        console . log ( x ) ;
    } ;

    var readline = ( function ( ) {

        // T: An array to store lines read from stdin.
        // cnt: A counter to keep track of the current line to be returned by readline().
        var T = [ ] , cnt = 0 ;

        // Open stdin for reading.
        var stdin = process . openStdin ( ) ;

        // Set encoding to UTF-8 for incoming data.
        stdin . setEncoding ( 'utf8' ) ;

        // input_fragment: Stores incomplete lines received from 'data' events.
        var input_fragment = "" ;

        // Event listener for 'data' received from stdin.
        stdin . on ( 'data' , function ( input ) {
            /*
             * Concatenate any previous fragment with the new input.
             * Split by newline to get complete lines.
             * The last element might be an incomplete line, which is stored back in input_fragment.
             */
            var ref = ( input_fragment + input ) . split ( "\n" ) ;
            input_fragment = ref . pop ( ) ;

            // Process each complete line.
            for ( var i = 0 ; i < ref . length ; i ++ ) {
                if ( ref [ i ] == '' ) continue ; // Skip empty lines.
                T . push ( ref [ i ] ) ; // Add non-empty line to the buffer.
            }
        } ) ;

        // Event listener for 'end' of stdin stream.
        stdin . on ( 'end' , function ( z ) {
            // If there's any remaining fragment at the end of the stream, process it.
            if ( input_fragment ) {
                // Treat the fragment as a complete line by appending a newline.
                var ref = ( input_fragment + "\n" ) . split ( "\n" ) ;
                input_fragment = ref . pop ( ) ;
                for ( var i = 0 ; i < ref . length ; i ++ ) {
                    if ( ref [ i ] == '' ) continue ;
                    T . push ( ref [ i ] ) ;
                }
            }
            // Once all input is processed, call the main function.
            main ( ) ;
        } ) ;

        // The actual readline function returned by the IIFE.
        return function ( ) {
            // If all buffered lines have been consumed, return null.
            if ( T . length <= cnt ) return null ;
            // Return the next line and increment the counter.
            return T [ cnt ++ ] ;
        } ;
    } ) ( ) ; // Immediately-Invoked Function Expression for readline.

} else {

    // This block executes if the script is NOT in a Node.js environment.
    // Assumes a V8 standalone environment (like d8), where `readline` and `print` are globally available.
    /*
     * In V8's d8 shell, `readline()` and `print()` are built-in global functions.
     * The `main()` function can be called directly as I/O is handled by the shell.
     */
    main ( ) ;
}
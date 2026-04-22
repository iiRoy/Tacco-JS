//usr/bin/env node $0 $@;exit

/*
 * This is the main program function.
 * It's designed to read numerical input, perform a specific calculation,
 * and then print the result. This process repeats until a non-positive
 * number is provided as input, signaling termination.
 */
var main = function () {

    // Begin an infinite loop to continuously process input data.
    // This loop will only terminate when explicitly broken.
    for ( ; ; ) {

        // Read a line of input and attempt to convert it into a numerical value.
        var n = Number( readline() );

        // If the conversion results in a falsy value (e.g., 0, NaN, null from readline),
        // it signifies the end of input or an invalid input, so we exit the loop.
        if ( !n ) {
            break;
        }

        // Initialize a result counter 'r' to zero for each new input 'n'.
        var r = 0;

        // Initialize an iteration variable 'i' starting from 2.
        var i = 2;

        // Start another infinite loop, incrementing 'i' in each iteration.
        for ( ; ; i++ ) {

            // The original code notes that bitwise operations caused a bug in a previous version.
            // Calculate a temporary value 'x' based on 'n' and the current 'i'.
            var x = n - i * ( i - 1 ) / 2;

            // If 'x' becomes less than 'i', further iterations with increasing 'i'
            // would not yield valid results, so we break from this inner loop.
            if ( x < i ) {
                break;
            }

            // Check if 'x' is perfectly divisible by 'i' (remainder is zero).
            if ( ( x % i ) == 0 ) {
                // If it is divisible, increment our result counter.
                r++;
            }

        } // End of the inner 'for' loop.

        // After the inner loop completes for the current 'n', print the accumulated result 'r'.
        print( r );

    } // End of the outer 'for' loop.

};


/*
 *  =============================================================================
 *  INPUT/OUTPUT (I/O) ABSTRACTION LAYER
 *  This section provides 'print' and 'readline' functionalities, adapting
 *  to different JavaScript execution environments (Node.js or V8 standalone).
 *  =============================================================================
 */
if ( typeof process !== 'undefined' ) {

    // Detected environment: Node.js runtime.
    // Define 'print' to use Node.js's standard console output.
    var print = function ( x ) {
        console.log( x );
    };

    // Define 'readline' as an immediately-invoked function expression (IIFE)
    // to manage asynchronous input from Node.js's stdin.
    var readline = ( function () {

        // An array 'T' acts as a buffer to store complete lines of input.
        var T = [],
            // 'cnt' keeps track of the current line to be read from the buffer 'T'.
            cnt = 0;

        // Obtain the standard input stream object.
        var stdin = process.openStdin();
        // Set the character encoding for the input stream to UTF-8.
        stdin.setEncoding( 'utf8' );

        // A string variable to hold incomplete lines received from 'data' events.
        var input_fragment = "";

        // Attach an event listener for 'data' events on stdin.
        // This fires whenever input data is available.
        stdin.on( 'data', function ( input ) {
            // Concatenate any previous incomplete fragment with the new input,
            // then split the combined string by newline characters.
            var ref = ( input_fragment + input ).split( "\n" );

            // The last element of 'ref' might be an incomplete line; store it back.
            input_fragment = ref.pop();

            // Iterate through the now-complete lines.
            for ( var i = 0; i < ref.length; i++ ) {
                // Skip any empty strings that might result from splitting.
                if ( ref[ i ] == '' ) {
                    continue;
                }
                // Add valid, non-empty lines to our buffer 'T'.
                T.push( ref[ i ] );
            }
        } );

        // Attach an event listener for the 'end' event on stdin.
        // This fires when the input stream has completely finished.
        stdin.on( 'end', function ( z ) {
            // Check if there's any remaining input fragment after the stream ends.
            if ( input_fragment ) {
                // If so, treat it as a final complete line by appending a newline
                // and splitting, then processing it.
                var ref = ( input_fragment + "\n" ).split( "\n" );
                // Clear the fragment as it's now processed.
                input_fragment = ref.pop();
                // Add any remaining lines to the buffer.
                for ( var i = 0; i < ref.length; i++ ) {
                    if ( ref[ i ] == '' ) {
                        continue;
                    }
                    T.push( ref[ i ] );
                }
            }
            // Once all input has been buffered, initiate the main program logic.
            main();
        } );

        // Return the actual 'readline' function that will be used by 'main'.
        return function () {
            // If the buffer 'T' is exhausted (or empty), return null.
            if ( T.length <= cnt ) {
                return null;
            }
            // Otherwise, return the next line from the buffer and advance the counter.
            return T[ cnt++ ];
        };

    } )(); // Execute the IIFE to set up 'readline'.

} else {

    // Detected environment: V8 standalone (e.g., d8 command-line shell).
    // In V8, 'readline' and 'print' are typically globally available functions.
    // Therefore, we can directly invoke the 'main' function as I/O is handled
    // synchronously by the V8 shell itself.
    main();

} // End of environment-specific I/O setup.
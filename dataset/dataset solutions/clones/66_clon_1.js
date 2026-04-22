process
    .stdin
    /*
     * Attaches an event listener to the standard input stream.
     * The 'data' event is emitted when data is available to read.
     */
    .on(
        "data",
        function( c ) // The callback function receives the input data chunk 'c'.
        {
            // Declare and initialize variables for coordinate tracking and angle conversion.
            // 'x' and 'y' will store the accumulated coordinates.
            // 'r' stores the current rotation angle in degrees.
            // 'p' is the conversion factor from degrees to radians (PI / 180).
            var x = 0,
                y = 0,
                r = 0,
                p = Math.PI / 180;

            // Convert the input buffer 'c' to a string,
            // then remove any leading/trailing whitespace,
            // and finally split the string into an array of lines based on newline characters.
            // The 'some' method is used to iterate over each line, processing it.
            ( c + "" )
                .trim()
                .split( "\n" )
                .some(
                    function( n ) // 'n' represents a single line of input data.
                    {
                        // Split the current line 'n' by the comma delimiter.
                        // This separates the magnitude (n[0]) and the rotation change (n[1]).
                        n = n.split( "," );

                        // Update the x-coordinate.
                        // '+n[0]' converts the string magnitude to a number.
                        // Math.sin expects radians, so 'r * p' converts the current degrees to radians.
                        x += +n[ 0 ] * Math.sin( r * p );

                        // Update the y-coordinate.
                        // '+n[0]' converts the string magnitude to a number.
                        // Math.cos expects radians, so 'r * p' converts the current degrees to radians.
                        y += +n[ 0 ] * Math.cos( r * p );

                        // Accumulate the rotation change.
                        // '+n[1]' converts the string rotation change to a number.
                        r += +n[ 1 ];
                    }
                ); // End of the 'some' method call.

            // Output the final calculated x-coordinate.
            // The bitwise OR with 0 ('| 0') effectively truncates the floating-point number to an integer.
            console.log( x | 0 );

            // Output the final calculated y-coordinate, also truncated to an integer.
            console.log( y | 0 );
        }
    ) // End of the 'on' method call.
    .resume(); // Resumes the standard input stream, allowing it to continue emitting 'data' events.

// This marks the end of the script's execution flow.
// Any additional comments or whitespace changes can be made here.
/*
 * This is a JavaScript program that reads input from /dev/stdin,
 * processes it, and prints results to the console.
 * It appears to calculate properties of a circle from three points.
 */

// Import the 'fs' module for file system operations.
require ( "fs" )
    // Read the entire file synchronously from standard input.
    . readFileSync ( "/dev/stdin", "utf8" )
    // Remove leading/trailing whitespace from the input string.
    . trim ( )
    // Split the input string into an array of lines.
    . split ( '\n' )
    // Iterate over each line; 'some' will stop if the function returns true.
    . some (
        function ( i ) { // 'i' represents a single line from the input.
            // Split the line by spaces to get individual values.
            j = i . split ( ' ' ) ;

            // Check if the line contains exactly 6 values (x1, y1, x2, y2, x3, y3).
            if ( j . length == 6 )
            {
                // Assign the parsed values to variables a, b, c, d, e, f.
                a = j [ 0 ] ,
                b = j [ 1 ] ,
                c = j [ 2 ] ,
                d = j [ 3 ] ,
                e = j [ 4 ] ,
                f = j [ 5 ] ;

                // Calculate squares of the coordinates for convenience.
                g = a * a ; // a squared
                h = b * b ; // b squared
                k = c * c ; // c squared
                l = d * d ; // d squared
                m = e * e ; // e squared
                n = f * f ; // f squared

                // Calculate the 'p' coordinate (likely center x-coordinate of the circle).
                p = (
                      ( b - f ) * ( h - l + g - k )
                    - ( b - d ) * ( h - n + g - m )
                ) / (
                      2 * ( b - f ) * ( a - c )
                    - 2 * ( b - d ) * ( a - e )
                ) ;

                // Calculate the 'q' coordinate (likely center y-coordinate of the circle).
                q = (
                      ( a - e ) * ( g - k + h - l )
                    - ( a - c ) * ( g - m + h - n )
                ) / (
                      2 * ( a - e ) * ( b - d )
                    - 2 * ( a - c ) * ( b - f )
                ) ;

                // Output the center coordinates (p, q) and the radius.
                // All values are formatted to 3 decimal places.
                console . log (
                    p . toFixed ( 3 ) ,
                    q . toFixed ( 3 ) ,
                    Math . sqrt (
                        ( a - p ) * ( a - p )
                      + ( b - q ) * ( b - q )
                    ) . toFixed ( 3 )
                ) ;

            } // End of 'if' block for length check.

            // The 'some' method expects a boolean return.
            // We return 'false' to ensure all lines are processed,
            // as the original code's implicit 'undefined' return also results in 'false'.
            return false;
        }
    ) ; // End of 'some' method call.

// End of script.
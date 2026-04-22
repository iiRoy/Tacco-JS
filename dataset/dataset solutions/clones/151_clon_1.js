/* This file handles input processing and then runs the main logic. */
// Standard input handling block.
var   fs = require('fs')
    , length = fs.fstatSync( process.stdin.fd ).size
    , buffer = new Buffer( length )
    , bytesRead = fs.readSync( process.stdin.fd , buffer , 0 , length , 0 )
    ; // End of variable declarations for input.

// Process the input buffer into an array of lines.
var input = buffer.toString( 'utf8' , 0 , bytesRead ).trim().split( '\n' );

// Call the main function to start the program execution.
main();


/**
 * Main function where the core logic resides.
 * It simulates movement on a grid based on input.
 */
function main ( ) {

    // Initialize coordinates (x, y) and direction.
    var x = y = 0; // Current x and y coordinates, both start at 0.
    var d = 'R';   // Current direction, initialized to 'R' (Right).
    var route = ''; // String to store the path taken.


    // Loop indefinitely until a specific condition (x=0, y=0) is met.
    while ( true ) {

        // Calculate potential next y-coordinates based on current y.
        var dy = y * 2 + 1; // Double y plus one.
        var uy = y * 2 - 1; // Double y minus one.
        var ny = y * 2;     // Double y.

        // Calculate potential next x-coordinates based on current x.
        var lx = x - 1;     // Left x.
        var rx = x + 1;     // Right x.
        var nx = x;         // No change in x.


        // Determine movement based on current direction 'd'.
        switch ( d ) {

            case 'L' : // Current direction is Left.
                // Check if moving Left is possible.
                if ( +input[ ny ][ lx ] ) { // Can move to the left (x-1).
                    d = 'L'; // Stay facing Left.
                    x -- ;   // Decrement x-coordinate.
                }
                // If not, check if moving Up is possible.
                else if ( uy > 0 && +input[ uy ][ nx ] ) { // Can move up (y-1).
                    d = 'U'; // Change direction to Up.
                    y -- ;   // Decrement y-coordinate.
                }
                // If not, check if moving Down is possible.
                else if ( dy < input.length && +input[ dy ][ nx ] ) { // Can move down (y+1).
                    d = 'D'; // Change direction to Down.
                    y ++ ;   // Increment y-coordinate.
                }
                break; // Exit switch for 'L' case.


            case 'R' : // Current direction is Right.
                // Check if moving Right is possible.
                if ( +input[ ny ][ nx ] ) { // Can move to the right (x+1).
                    d = 'R'; // Stay facing Right.
                    x ++ ;   // Increment x-coordinate.
                }
                // If not, check if moving Down is possible.
                else if ( dy < input.length && +input[ dy ][ nx ] ) { // Can move down (y+1).
                    d = 'D'; // Change direction to Down.
                    y ++ ;   // Increment y-coordinate.
                }
                // If not, check if moving Up is possible.
                else if ( uy > 0 && +input[ uy ][ nx ] ) { // Can move up (y-1).
                    d = 'U'; // Change direction to Up.
                    y -- ;   // Decrement y-coordinate.
                }
                break; // Exit switch for 'R' case.


            case 'D' : // Current direction is Down.
                // Check if moving Down is possible.
                if ( dy < input.length && +input[ dy ][ nx ] ) { // Can move down (y+1).
                    d = 'D'; // Stay facing Down.
                    y ++ ;   // Increment y-coordinate.
                }
                // If not, check if moving Right is possible.
                else if ( +input[ ny ][ nx ] ) { // Can move to the right (x+1).
                    d = 'R'; // Change direction to Right.
                    x ++ ;   // Increment x-coordinate.
                }
                // If not, check if moving Left is possible.
                else if ( +input[ ny ][ lx ] ) { // Can move to the left (x-1).
                    d = 'L'; // Change direction to Left.
                    x -- ;   // Decrement x-coordinate.
                }
                break; // Exit switch for 'D' case.


            case 'U' : // Current direction is Up.
                // Check if moving Up is possible.
                if ( uy > 0 && +input[ uy ][ nx ] ) { // Can move up (y-1).
                    d = 'U'; // Stay facing Up.
                    y -- ;   // Decrement y-coordinate.
                }
                // If not, check if moving Left is possible.
                else if ( +input[ ny ][ lx ] ) { // Can move to the left (x-1).
                    d = 'L'; // Change direction to Left.
                    x -- ;   // Decrement x-coordinate.
                }
                // If not, check if moving Right is possible.
                else if ( +input[ ny ][ nx ] ) { // Can move to the right (x+1).
                    d = 'R'; // Change direction to Right.
                    x ++ ;   // Increment x-coordinate.
                }
                break; // Exit switch for 'U' case.

            default :
                // This case should ideally not be reached if 'd' is always 'L', 'R', 'D', 'U'.
                return; // Exit the function if an unexpected direction is encountered.

        } // End of switch statement.

        // Append the current direction to the route string.
        route += d ;

        // Check for termination condition: if both x and y are back to 0.
        if ( ! x && ! y ) {
            break ; // Exit the while loop.
        }

    } // End of while loop.

    // Output the collected route to the console.
    console.log( route ) ;

} // End of main function.
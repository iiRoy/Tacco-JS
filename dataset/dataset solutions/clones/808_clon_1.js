/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered or added.
 * No identifiers, variable names, function names, operators, or expressions have been changed.
 */

function move( y , x , str ) { // Function to handle tank movement operations
    // Check if the target cell is empty (represented by a dot)
    if ( yx [ tank [ 0 ] + y ] [ tank [ 1 ] + x ] == "." ) {
        // If empty, move the tank to the new position
        yx [ tank [ 0 ] + y ] [ tank [ 1 ] + x ] = str ; // Update new position with tank's direction
        yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "." ; // Clear the old tank position

        // Update tank's coordinates
        tank [ 0 ] += y ;
        tank [ 1 ] += x ;

    } else {
        // If the target cell is not empty, just update the tank's direction in its current spot
        yx [ tank [ 0 ] ] [ tank [ 1 ] ] = str ;
    }
}


function shot( y , x ) {
    var i = 0 ; // Initialize counter for shot distance

    while ( true ) { // Loop indefinitely until a wall or an enemy is hit
        i ++ ; // Increment shot distance

        // Check if the shot hits a wall ('#')
        if ( yx [ tank [ 0 ] + ( y * i ) ] [ tank [ 1 ] + ( x * i ) ] == "#" ) {
            break ; // Stop the shot if a wall is hit
        }
        // Else, check if the shot hits an enemy ('*')
        else if ( yx [ tank [ 0 ] + ( y * i ) ] [ tank [ 1 ] + ( x * i ) ] == "*" ) {
            yx [ tank [ 0 ] + ( y * i ) ] [ tank [ 1 ] + ( x * i ) ] = "." ; // Destroy the enemy, replace with empty space
            break ; // Stop the shot after hitting an enemy
        }
        // If neither, the shot continues
    }
}

// Read input from standard input, using 'utf8' encoding
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

/*
 * Replace directional symbols in the input string:
 * '^' (up) to 'U'
 * 'v' (down) to 'D'
 * '<' (left) to 'L'
 * '>' (right) to 'R'
 */
input = input . replace ( /\^/g , "U" ) . replace ( /v/g , "D" ) . replace ( /\</g , "L" ) . replace ( /\>/g , "R" ) ;

// Trim leading/trailing whitespace and split the input into an array of lines
var arr = input . trim ( ) . split ( "\n" ) ;

// Extract the number of test cases (t) from the first line
// The `-0` converts the string to a number
var t = arr . shift ( ) - 0 ;

// Main loop for processing each test case
for ( var i = 0 ; i < t ; i ++ ) {

    // Print an empty line between test case outputs, except for the first one
    if ( i != 0 ) {
        console . log ( "" ) ;
    }

    // Read the height and width for the current test case
    var hw = arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // Initialize the game map (yx)
    var yx = [ ] ;

    // Add a top border of '#' characters to the map
    yx . push ( "####################" . split ( "" ) ) ;

    // Initialize tank coordinates [row, column]
    var tank = [ 0 , 0 ] ;

    // Loop to read each row of the map
    for ( var j = 0 ; j < hw [ 0 ] ; j ++ ) {
        var ary = arr . shift ( ) . split ( "" ) ; // Get current row as an array of characters
        var w = -1 ; // Variable to store tank's column index, initialized to -1 (not found)

        // Iterate over characters in the row to find the tank's initial position
        ary . forEach ( function ( v , index ) {
            if ( v == "U" || v == "D" || v == "L" || v == "R" ) {
                w = index ; // Store the column index if a tank is found
            }
        } ) ;

        // If a tank was found in this row, update its coordinates
        if ( w != -1 ) {
            tank = [ j + 1 , w + 1 ] ; // Adjust for added borders later
        }

        // Add left and right borders to the current row
        ary . unshift ( "#" ) ; // Add '#' to the beginning
        ary . push ( "#" ) ; // Add '#' to the end

        yx . push ( ary ) ; // Add the modified row to the game map
    }

    // Add a bottom border of '#' characters to the map
    yx . push ( "####################" . split ( "" ) ) ;

    arr . shift ( ) ; // Consume the blank line after the map definition

    // Get the sequence of commands for the tank
    var n = arr . shift ( ) . split ( "" ) ;

    // Process each command in the sequence
    n . forEach ( function ( v ) {
        if ( v == "U" ) {
            move ( -1 , 0 , v ) ; // Move Up
        } else if ( v == "D" ) {
            move ( 1 , 0 , v ) ; // Move Down
        } else if ( v == "L" ) {
            move ( 0 , -1 , v ) ; // Move Left
        } else if ( v == "R" ) {
            move ( 0 , 1 , v ) ; // Move Right
        } else if ( v == "S" ) { // Shoot command
            var udlr = yx [ tank [ 0 ] ] [ tank [ 1 ] ] ; // Get tank's current direction
            if ( udlr == "U" ) {
                shot ( -1 , 0 ) ; // Shoot Up
            } else if ( udlr == "D" ) {
                shot ( 1 , 0 ) ; // Shoot Down
            } else if ( udlr == "L" ) {
                shot ( 0 , -1 ) ; // Shoot Left
            } else if ( udlr == "R" ) {
                shot ( 0 , 1 ) ; // Shoot Right
            }
        }
    } ) ;

    // Remove the temporary top and bottom borders added earlier
    yx . shift ( ) ;
    yx . pop ( ) ;

    // Join the map rows into a single string, remove commas, and remove outer '#' borders
    var ans = yx . join ( "\n" ) . replace ( /\,/g , "" ) . replace ( /^#|#$/mg , "" ) ;

    // Replace the internal direction markers back to their original symbols for output
    console . log ( ans . replace ( /U/g , "^" ) . replace ( /D/g , "v" ) . replace ( /L/g , "<" ) . replace ( /R/g , ">" ) ) ;
}
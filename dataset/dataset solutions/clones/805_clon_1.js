// This file contains the solution for a programming challenge.
// It simulates a tank game on a 2D grid.

/*
 * Function: shot
 * Description: Handles the firing of a tank's projectile.
 *              The projectile travels in a given direction (y, x)
 *              until it hits a wall ('#') or an enemy ('*').
 * Parameters:
 *   y - Vertical direction (-1 for up, 1 for down, 0 for horizontal)
 *   x - Horizontal direction (-1 for left, 1 for right, 0 for vertical)
 */
function shot ( y , x ) {
    // Initialize a counter for the projectile's travel distance.
    var   i = 0 ;


    // The projectile continues to travel until it hits something.
    while ( true ) {
        // Increment the distance traveled.
        i ++ ;

        /*
         * Check the cell in the current direction and distance.
         * The tank's position is tank[0] (row) and tank[1] (column).
         * The projectile's current position is tank[0]+(y*i) and tank[1]+(x*i).
         */
        if ( yx [ tank [ 0 ] + ( y * i ) ] [ tank [ 1 ] + ( x * i ) ] == "#" ) {
            // If it hits a wall, the projectile stops.
            break ;
        }
        else if ( yx [ tank [ 0 ] + ( y * i ) ] [ tank [ 1 ] + ( x * i ) ] == "*" ) {
            // If it hits an enemy, the enemy is destroyed (replaced with '.'), and the projectile stops.
            yx [ tank [ 0 ] + ( y * i ) ] [ tank [ 1 ] + ( x * i ) ] = "." ;
            break ;
        }
    }
}


// Read the entire input from stdin as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Replace tank direction characters from the input to a standardized format.
// '^' (up) becomes 'U', 'v' (down) becomes 'D', '<' (left) becomes 'L', '>' (right) becomes 'R'.
input = input . replace ( /\^/g , "U" ) . replace ( /v/g , "D" ) . replace ( /\</g , "L" ) . replace ( /\>/g , "R" ) ;

// Trim whitespace from the input and split it into an array of lines.
var arr = input . trim ( ) . split ( "\n" ) ;

// The first line contains the number of test cases. Convert it to a number.
var t = arr . shift ( ) - 0 ;

// Loop through each test case.
for ( var i = 0 ; i < t ; i ++ ) {
    // Print a blank line between test cases, except for the first one.
    if ( i != 0 ) {
        console . log ( "" ) ;
    }

    // Read the map dimensions (height and width) from the next line.
    // Split by space and map to numbers.
    var hw = arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // Initialize the game grid (yx) with a top border.
    // The grid will be padded with '#' characters to simplify boundary checks.
    var yx = [ ] ;
    yx . push ( "####################" . split ( "" ) ) ;

    // Initialize tank position; it will be updated when the map is parsed.
    var tank = [ 0 , 0 ] ;

    // Parse the game map rows.
    for ( var j = 0 ; j < hw [ 0 ] ; j ++ ) {
        // Get the current map row as an array of characters.
        var ary = arr . shift ( ) . split ( "" ) ;

        // Variable to store the column index of the tank in the current row.
        var w = -1 ;

        // Iterate over the characters in the current row to find the tank.
        ary . forEach ( function ( v , index ) {
            // If the character is a tank direction, update 'w' with its index.
            if ( v == "U" || v == "D" || v == "L" || v == "R" ) {
                w = index ;
            }
        } ) ;

        // If a tank was found in this row, update its coordinates.
        // Add 1 to j and w because the yx grid is padded with borders.
        if ( w != -1 ) {
            tank = [ j + 1 , w + 1 ] ;
        }

        // Add left and right borders to the current map row.
        ary . unshift ( "#" ) ;
        ary . push ( "#" ) ;

        // Add the bordered row to the game grid.
        yx . push ( ary ) ;
    }

    // Add a bottom border to the game grid.
    yx . push ( "####################" . split ( "" ) ) ;

    // Consume the empty line after the map data (if any, or just another shift).
    arr . shift ( ) ;

    // Read the sequence of commands for the tank.
    var n = arr . shift ( ) . split ( "" ) ;

    // Process each command.
    n . forEach ( function ( v ) {
        // Move Up command
        if ( v == "U" && yx [ tank [ 0 ] - 1 ] [ tank [ 1 ] ] == "." ) {
            // If the target cell is empty, move the tank.
            yx [ tank [ 0 ] - 1 ] [ tank [ 1 ] ] = "U" ; // Set new position with tank direction
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "." ;     // Clear old position
            tank [ 0 ] -- ;                             // Update tank's row coordinate
        }
        else if ( v == "U" && yx [ tank [ 0 ] - 1 ] [ tank [ 1 ] ] != "." ) {
            // If the target cell is blocked, just change tank's direction.
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "U" ;
        }
        // Move Down command
        else if ( v == "D" && yx [ tank [ 0 ] + 1 ] [ tank [ 1 ] ] == "." ) {
            // If the target cell is empty, move the tank.
            yx [ tank [ 0 ] + 1 ] [ tank [ 1 ] ] = "D" ;
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "." ;
            tank [ 0 ] ++ ;
        }
        else if ( v == "D" && yx [ tank [ 0 ] + 1 ] [ tank [ 1 ] ] != "." ) {
            // If the target cell is blocked, just change tank's direction.
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "D" ;
        }
        // Move Left command
        else if ( v == "L" && yx [ tank [ 0 ] ] [ tank [ 1 ] - 1 ] == "." ) {
            // If the target cell is empty, move the tank.
            yx [ tank [ 0 ] ] [ tank [ 1 ] - 1 ] = "L" ;
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "." ;
            tank [ 1 ] -- ;
        }
        else if ( v == "L" && yx [ tank [ 0 ] ] [ tank [ 1 ] - 1 ] != "." ) {
            // If the target cell is blocked, just change tank's direction.
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "L" ;
        }
        // Move Right command
        else if ( v == "R" && yx [ tank [ 0 ] ] [ tank [ 1 ] + 1 ] == "." ) {
            // If the target cell is empty, move the tank.
            yx [ tank [ 0 ] ] [ tank [ 1 ] + 1 ] = "R" ;
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "." ;
            tank [ 1 ] ++ ;
        }
        else if ( v == "R" && yx [ tank [ 0 ] ] [ tank [ 1 ] + 1 ] != "." ) {
            // If the target cell is blocked, just change tank's direction.
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "R" ;
        }
        // Shoot command
        else if ( v == "S" ) {
            // Determine the tank's current direction.
            var udlr = yx [ tank [ 0 ] ] [ tank [ 1 ] ] ;
            // Call the shot function based on the tank's direction.
            if ( udlr == "U" ) {
                shot ( -1 , 0 ) ; // Shoot Up
            }
            else if ( udlr == "D" ) {
                shot ( 1 , 0 ) ;  // Shoot Down
            }
            else if ( udlr == "L" ) {
                shot ( 0 , -1 ) ; // Shoot Left
            }
            else if ( udlr == "R" ) {
                shot ( 0 , 1 ) ;  // Shoot Right
            }
        }
    } ) ;

    // Remove the top and bottom border rows before printing the final map.
    yx . shift ( ) ;
    yx . pop ( ) ;

    // Join the grid rows, remove border characters, replace internal commas,
    // and convert standardized directions back to original symbols.
    console . log ( yx . join ( "\n" ) . replace ( /^#/mg , "" ) . replace ( /#$/mg , "" ) . replace ( /\,/g , "" ) . replace ( /U/g , "^" ) . replace ( /D/g , "v" ) . replace ( /L/g , "<" ) . replace ( /R/g , ">" ) ) ;
}
( function ( input ) {
    // This is the main immediately-invoked function expression (IIFE)
    // It processes the input data from stdin.

    /*
     * First, process the raw input string.
     * Remove any trailing newline characters and then split it into an array of lines.
     */
    var p = input . replace ( / \n $ / , '' ) . split ( '\n' ) ;

    // Initialize an empty array 'm' which will store our processed matrix.
    var m = [ ] ;

    // Iterate through each line of the input array 'p'.
    for ( var i = 0 ; i < p . length ; i ++ ) {
        // For each line, split it into individual characters and convert each character to a Number.
        // Then, push this array of numbers (a row) into the matrix 'm'.
        m . push ( p [ i ] . split ( '' ) . map ( Number ) ) ;
    }

    /*
     * Finally, call the 'move' function with the initialized matrix 'm'
     * and starting coordinates (0, 0) with an initial direction 'R'.
     * The result of 'move' is prepended with 'R' and logged to the console.
     */
    console . log ( 'R' + move ( m , 0 , 0 , 'R' ) ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;


/*
 * Function: move
 * Description: Recursively navigates a path based on the matrix 'm', current position (x, y), and current direction 'd'.
 * Parameters:
 *   m - The 2D matrix representing the grid.
 *   x - The current x-coordinate (column).
 *   y - The current y-coordinate (row).
 *   d - The current direction ('R', 'L', 'U', 'D' for Right, Left, Up, Down).
 * Returns: A string representing the sequence of moves.
 */
function move ( m , x , y , d ) {
    // The original comment was: //console.log(m, x, y, d);
    // This function traces a path through the grid.
    // The commented line above was likely for debugging purposes.

    // Base case: If we are at the starting point (0,0) and trying to move 'L',
    // it means we've completed a cycle or are at the end condition.
    if ( x === 0 && y === 0 && d === 'L' ) {
        return '' ; // Return an empty string to terminate the recursion.
    }


    // --- Handling movements when current direction is 'R' (Right) ---
    if ( d === 'R' ) {
        // Try to move Up-Right (x+1, y-1)
        if ( mm ( m , x + 1 , y - 1 ) ) {
            return 'U' + move ( m , x + 1 , y - 1 , 'U' ) ;
        }
        // If Up-Right is not possible, try to move Straight-Right (x+1, y)
        if ( mm ( m , x + 1 , y ) ) {
            return 'R' + move ( m , x + 1 , y , 'R' ) ;
        }
        // If Straight-Right is not possible, try to move Down-Right (x+1, y+1)
        if ( mm ( m , x + 1 , y + 1 ) ) {
            return 'D' + move ( m , x + 1 , y + 1 , 'D' ) ;
        }
        // If none of the above are possible, turn Left (stay at current position, change direction)
        return 'L' + move ( m , x , y , 'L' ) ;
    }


    // --- Handling movements when current direction is 'L' (Left) ---
    if ( d === 'L' ) {
        // Try to move Down-Left (x, y+1) - this seems inconsistent, usually (x-1, y+1) for Down-Left.
        // However, the original code uses (x, y+1) so we must keep it.
        if ( mm ( m , x , y + 1 ) ) {
            return 'D' + move ( m , x , y + 1 , 'D' ) ;
        }
        // If Down-Left (x, y+1) is not possible, try to move Straight-Left (x-1, y)
        if ( mm ( m , x - 1 , y ) ) {
            return 'L' + move ( m , x - 1 , y , 'L' ) ;
        }
        // If Straight-Left is not possible, try to move Up-Left (x, y-1)
        if ( mm ( m , x , y - 1 ) ) {
            return 'U' + move ( m , x , y - 1 , 'U' ) ;
        }
        // If none of the above are possible, turn Right (stay at current position, change direction)
        return 'R' + move ( m , x , y , 'R' ) ;
    }


    // --- Handling movements when current direction is 'D' (Down) ---
    if ( d === 'D' ) {
        // Try to move Right-Down (x, y+1)
        if ( mm ( m , x , y + 1 ) ) {
            return 'R' + move ( m , x , y + 1 , 'R' ) ;
        }
        // If Right-Down is not possible, try to move Straight-Down (x, y+2)
        if ( mm ( m , x , y + 2 ) ) {
            return 'D' + move ( m , x , y + 2 , 'D' ) ;
        }
        // If Straight-Down is not possible, try to move Left-Down (x-1, y+1)
        if ( mm ( m , x - 1 , y + 1 ) ) {
            return 'L' + move ( m , x - 1 , y + 1 , 'L' ) ;
        }
        // If none of the above are possible, turn Up (stay at current position, change direction)
        return 'U' + move ( m , x , y , 'U' ) ;
    }


    // --- Handling movements when current direction is 'U' (Up) ---
    if ( d === 'U' ) {
        // Try to move Left-Up (x-1, y-1)
        if ( mm ( m , x - 1 , y - 1 ) ) {
            return 'L' + move ( m , x - 1 , y - 1 , 'L' ) ;
        }
        // If Left-Up is not possible, try to move Straight-Up (x, y-2)
        if ( mm ( m , x , y - 2 ) ) {
            return 'U' + move ( m , x , y - 2 , 'U' ) ;
        }
        // If Straight-Up is not possible, try to move Right-Up (x, y-1)
        if ( mm ( m , x , y - 1 ) ) {
            return 'R' + move ( m , x , y - 1 , 'R' ) ;
        }
        // If none of the above are possible, turn Down (stay at current position, change direction)
        return 'D' + move ( m , x , y , 'D' ) ;
    }
}


/*
 * Function: mm
 * Description: Checks if a given coordinate (x, y) in the matrix 'm' is valid and contains a '1'.
 * Parameters:
 *   m - The 2D matrix.
 *   x - The x-coordinate (column) to check.
 *   y - The y-coordinate (row) to check.
 * Returns: True if m[y][x] is 1 and coordinates are within bounds, otherwise False (0).
 */
function mm ( m , x , y ) {
    // Check if the y-coordinate (row) is out of bounds.
    if ( y < 0 || y >= m . length ) {
        return 0 ; // Return 0 (false) if y is invalid.
    }
    // Check if the x-coordinate (column) is out of bounds for the given row.
    if ( x < 0 || x >= m [ y ] . length ) {
        return 0 ; // Return 0 (false) if x is invalid.
    }
    // If coordinates are valid, return true if the value at m[y][x] is strictly equal to 1.
    return m [ y ] [ x ] === 1 ;
}
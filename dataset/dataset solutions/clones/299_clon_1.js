// This JavaScript code implements a logic to calculate pathfinding-like costs on a 2D grid.
// It processes multiple grid inputs, determining the maximum 'cost' value for each.

/*
 * The 'seach' function calculates a cost for a given cell (y, x)
 * based on its neighbors or if it's an obstacle.
 *
 * Parameters:
 *   y - The row index of the current cell.
 *   x - The column index of the current cell.
 */
function seach ( y , x )
{
    // Check if the current cell represents an obstacle (marked with '*').
    // If it is an obstacle, its cost is set to 0, and the function returns immediately.
    if ( yx [ y ] [ x ] == "*" )
    {
        yx [ y ] [ x ] = 0 ; // Assign a cost of 0 to the obstacle cell.
        return ;             // Exit the function.
    }

    // Define relative offsets for checking three specific adjacent cells:
    // (up-left), (up), (left) relative to the current cell.
    var dy = [ -1 , -1 , 0 ] ; // Delta Y coordinates.
    var dx = [ -1 , 0 , -1 ] ; // Delta X coordinates.

    // Initialize 'min' with the global variable 'n'.
    // 'n' typically represents the grid dimension, so this acts as an initial large value.
    var min = n ;

    // Loop through the three predefined adjacent directions.
    for ( var i = 0 ; i < 3 ; i ++ )
    {
        // Calculate the coordinates of the adjacent cell.
        var yy = y + dy [ i ] ;
        var xx = x + dx [ i ] ;

        // Check if the calculated adjacent cell coordinates are out of bounds of the grid.
        // If any coordinate is out of bounds, it means the current cell (y, x) is on a boundary
        // such that one of its required neighbors doesn't exist.
        if ( yy < 0 || yy >= n || xx < 0 || xx >= n )
        {
            yx [ y ] [ x ] = 1 ; // Set the current cell's cost to 1 (boundary condition).
            return ;             // Exit the function as its cost is determined.
        }

        // If the adjacent cell is within bounds, update 'min' with the minimum
        // of its current value and the cost of the adjacent cell.
        min = Math . min ( min , yx [ yy ] [ xx ] ) ;
    }

    // After checking all valid adjacent cells, the cost of the current cell (y, x)
    // is set to 'min + 1'. This implies a cost accumulation or distance calculation.
    yx [ y ] [ x ] = min + 1 ;
}


// --- Main Program Execution Flow ---

// Read the entire input content from standard input synchronously.
// The input is expected to be UTF-8 encoded.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Process the raw input:
// 1. Remove leading/trailing whitespace using .trim().
// 2. Split the cleaned input string into an array of strings,
//    where each string represents a line, using "\n" as the delimiter.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Main loop to process multiple test cases, each representing a distinct grid.
// The loop continues indefinitely until a specific termination condition is met.
while ( true )
{
    // Extract the grid size 'n' from the beginning of the 'Arr' array.
    // .shift() removes the first element, and '- 0' converts it to a number.
    var n = Arr . shift ( ) - 0 ;

    // If 'n' is 0, it signals the end of input or test cases.
    // In this scenario, the loop is terminated.
    if ( n == 0 )
    {
        break ;
    }

    // Initialize 'max' to 0 for the current grid.
    // This variable will store the highest calculated cost within this grid.
    var max = 0 ;

    // Initialize an empty array 'yx' which will represent the 2D grid.
    var yx = [ ] ;

    // Loop to populate the 'yx' grid with data from the input array.
    // Each iteration processes one row of the grid.
    for ( var i = 0 ; i < n ; i ++ )
    {
        // Get the next line from the input array, which represents a row of the grid.
        var str = Arr . shift ( ) ;

        // Split the row string into an array of individual characters (cells)
        // and push this array as a new row into the 'yx' grid.
        yx . push ( str . split ( "" ) ) ;
    }

    // Nested loops to iterate through each cell (y, x) of the 'yx' grid.
    // The outer loop iterates through rows (y).
    for ( var y = 0 ; y < n ; y ++ )
    {
        // The inner loop iterates through columns (x) for the current row.
        for ( var x = 0 ; x < n ; x ++ )
        {
            // Call the 'seach' function to calculate the cost for the current cell (y, x).
            // The 'yx' grid is modified in place by this function.
            seach ( y , x ) ;

            // Update 'max' if the cost of the current cell (yx[y][x]) is greater
            // than the previously recorded maximum cost.
            max = Math . max ( max , yx [ y ] [ x ] ) ;
        }
    }

    // After processing the entire grid and calculating all cell costs,
    // print the maximum cost found for the current grid to the console.
    console . log ( max ) ;
}

// End of the program execution.
/*
 * This JavaScript program processes input from standard input
 * to solve a problem involving a 3D grid.
 * It calculates the count of unoccupied cells within an N x N x N cube
 * after certain planes are marked as occupied.
 */
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// The input string is first trimmed to remove any leading/trailing whitespace,
// then split by newline characters to get an array of individual lines.
var arr = input . trim ( ) . split ( "\n" ) ;


/*
 * Main loop: Processes multiple test cases.
 * It continues until a specific termination condition is met.
 */
while ( true )
{

    // Read the first line of the current test case.
    // This line typically contains the grid size 'n' and number of operations 'h'.
    var nh = arr . shift ( ) ;

    // Check if the termination sentinel "0 0" is encountered.
    if ( nh == "0 0" )
    {
        break ; // Exit the loop if the sentinel is found.
    }

    // Parse the 'n' and 'h' values from the current line.
    // The line is split by space, and each part is converted to a number.
    nh = nh . split ( " " ) . map ( Number ) ;

    // Extract the grid dimension 'n'. The cube is n*n*n.
    var n = nh [ 0 ] ;

    // Extract the number of operations 'h'.
    var h = nh [ 1 ] ;


    // Initialize an empty object to serve as a hash set for occupied cell coordinates.
    // Coordinates will be stored as strings (e.g., "x,y,z") to ensure uniqueness.
    var obj = { } ;


    /*
     * Loop through 'h' operations.
     * Each operation specifies a plane (xy, xz, or yz) and two coordinates.
     * All cells on that specified plane within the cube are marked as occupied.
     */
    for ( var i = 0 ; i < h ; i ++ )
    {

        // Read and parse the current operation line.
        // It contains the plane type and two fixed coordinates for that plane.
        var ary = arr . shift ( ) . split ( " " ) ;

        var x = ary [ 0 ] ; // The type of plane ("xy", "xz", or "yz").
        var a = ary [ 1 ] - 0 ; // First fixed coordinate, converted to a number.
        var b = ary [ 2 ] - 0 ; // Second fixed coordinate, converted to a number.


        // Determine which plane type is specified and mark relevant cells.
        if ( x == "xy" )
        {
            // For an "xy" plane, 'x' is 'a', 'y' is 'b', and 'z' varies.
            for ( var j = 0 ; j < n ; j ++ )
            {
                // Mark cell (a, b, j) as occupied.
                obj [ a + "," + b + "," + j ] = true ;
            }
        }
        else if ( x == "xz" )
        {
            // For an "xz" plane, 'x' is 'a', 'z' is 'b', and 'y' varies.
            for ( var j = 0 ; j < n ; j ++ )
            {
                // Mark cell (a, j, b) as occupied.
                obj [ a + "," + j + "," + b ] = true ;
            }
        }
        else if ( x == "yz" )
        {
            // For a "yz" plane, 'y' is 'a', 'z' is 'b', and 'x' varies.
            for ( var j = 0 ; j < n ; j ++ )
            {
                // Mark cell (j, a, b) as occupied.
                obj [ j + "," + a + "," + b ] = true ;
            }
        }

    } // End of the operations loop for the current test case.


    // Calculate the total number of cells in the cube (n * n * n).
    // Subtract the number of unique occupied cells (keys in 'obj') to find unoccupied cells.
    console . log ( n * n * n - Object . keys ( obj ) . length ) ;

} // End of the main while loop.
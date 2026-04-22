var input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ; // Read input from standard input
var arr = input . trim ( ) . split ( "\n" ) ; // Split the input into an array of lines

// Main loop to process multiple test cases
while ( true )
{
    // Get the first line of the current test case (n and h values)
    var nh = arr . shift ( ) ;

    // Check for termination condition: "0 0"
    if ( nh == "0 0" )
    {
        break ; // Exit the loop if "0 0" is encountered
    }

    // Parse n and h values from the current line
    nh = nh . split ( " " ) . map ( Number ) ;
    var n = nh [ 0 ] ; // Size of the cube (n x n x n)
    var h = nh [ 1 ] ; // Number of slices/holes

    var obj = { } ; // Object to store coordinates of removed cubes (as strings)

    // Loop through each slice definition
    for ( var i = 0 ; i < h ; i ++ )
    {
        // Get the current slice definition line
        var ary = arr . shift ( ) . split ( " " ) ;
        var x = ary [ 0 ] ; // Type of slice (xy, xz, yz)
        var a = ary [ 1 ] - 0 ; // First coordinate value (converted to number)
        var b = ary [ 2 ] - 0 ; // Second coordinate value (converted to number)

        // Process based on slice type
        if ( x == "xy" )
        {
            // If it's an 'xy' slice, iterate through z-axis
            for ( var j = 1 ; j <= n ; j ++ )
            {
                obj [ a + "," + b + "," + j ] = true ; // Mark all cubes at (a, b, j) as removed
            }
        }
        else if ( x == "xz" )
        {
            // If it's an 'xz' slice, iterate through y-axis
            for ( var j = 1 ; j <= n ; j ++ )
            {
                obj [ a + "," + j + "," + b ] = true ; // Mark all cubes at (a, j, b) as removed
            }
        }
        else if ( x == "yz" )
        {
            // If it's a 'yz' slice, iterate through x-axis
            for ( var j = 1 ; j <= n ; j ++ )
            {
                obj [ j + "," + a + "," + b ] = true ; // Mark all cubes at (j, a, b) as removed
            }
        }
    }

    // Calculate and print the remaining number of cubes
    // Total cubes - number of unique removed cubes
    console . log ( n * n * n - Object . keys ( obj ) . length ) ;
}
/* End of program */
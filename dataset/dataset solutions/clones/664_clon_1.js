// This script processes input data to calculate a count based on a 3D grid.
// It reads input from stdin, parses it, and then performs computations.
// The main loop continues until a specific termination condition is met.

var input = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) ;
var arr = input . trim( ) . split( "\n" ) ; // Split input into lines.

while ( true ) { // Start of the main processing loop.
    var nh = arr . shift( ) ;

    if ( nh == "0 0" ) { // Check for termination condition.
        break ; // Exit the loop if "0 0" is encountered.
    }

    nh = nh . split( " " ) . map( Number ) ; // Parse 'n' and 'h' values.

    var n = nh[ 0 ] ; // Extract the first value.
    var h = nh[ 1 ] ; // Extract the second value.

    // Initialize a 3D array (cube) with dimensions n x n x n.
    var xyz = [ ] ;
    for ( var i = 0 ; i < n ; i ++ ) {
        xyz[ i ] = [ ] ;
        for ( var j = 0 ; j < n ; j ++ ) {
            xyz[ i ][ j ] = [ ] ;
            for ( var k = 0 ; k < n ; k ++ ) {
                xyz[ i ][ j ][ k ] = 0 ; // Initialize each element to 0.
            }
        }
    }

    // Process 'h' number of operations.
    for ( var I = 0 ; I < h ; I ++ ) {
        var ary = arr . shift( ) . split( " " ) ; // Get operation details.
        var c = ary . shift( ) ; // Get the command type.

        // Convert remaining array elements to numbers and adjust them.
        ary = ary . map( function ( v ) { return v - 1 ; } ) ;

        // The following lines are commented out in the original code.
        // They represent potential operations on the 3D grid,
        // which are currently disabled.
        // if(c=="xy"){for(var i=0;i<n;i++)xyz[ary[0]][ary[1]][i]=1;}
        // else if(c=="xz"){for(var i=0;i<n;i++)xyz[ary[0]][i][ary[1]]=1;}
        // else if(c=="yz"){for(var i=0;i<n;i++)xyz[i][ary[0]][ary[1]]=1;}
    }

    var cnt = 0 ; // Initialize counter for zero elements.

    // Iterate through the entire 3D grid to count elements that are still 0.
    for ( var i = 0 ; i < n ; i ++ ) {
        for ( var j = 0 ; j < n ; j ++ ) {
            for ( var k = 0 ; k < n ; k ++ ) {
                if ( xyz[ i ][ j ][ k ] == 0 ) { // Check if the element is 0.
                    cnt ++ ; // Increment the counter.
                } ; // Original code had an extra semicolon, preserving it.
            }
        }
    }

    console . log( cnt ) ; // Output the final count.
}
// End of script execution.
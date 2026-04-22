// This script reads graph data from standard input, constructs an adjacency matrix, and prints it.
// It's designed to process a specific input format where the first line is 'n',
// followed by 'n' lines describing connections.

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Reads the entire input from /dev/stdin as a UTF-8 string.

var Arr = input . trim ( ) . split ( "\n" ) ; // Trims whitespace from the input and splits it into an array of strings, one for each line.

// The first element of 'Arr' contains the size 'n'. We parse it as an integer.
var n = Arr . shift ( ) - 0 ;

var xy = [ ] ; // Initializes an empty array which will become our n x n adjacency matrix.

/*
 * The following nested loops initialize the adjacency matrix 'xy'.
 * Each cell xy[i][j] is set to 0, indicating no direct connection
 * between node 'i' and node 'j' initially.
 */
for ( var i = 0 ; i < n ; i ++ )
{
    xy [ i ] = [ ] ; // Initialize the i-th row of the matrix.

    for ( var j = 0 ; j < n ; j ++ )
    {
        xy [ i ] [ j ] = 0 ; // Set the element at [i][j] to zero.
    }
}


/*
 * This block processes the remaining lines of input, populating the adjacency matrix.
 * Each line (after the first 'n' line) describes connections from a source node.
 * The format is: sourceNode count connectedNode1 connectedNode2 ...
 */
for ( var i = 0 ; i < n ; i ++ )
{
    // Takes the next line, splits it by spaces, and converts all parts to numbers.
    var arr = Arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // The first number in the line is the source node 'x'.
    var x = arr . shift ( ) ;

    // The second number in the line is a count (which we don't need for the matrix, so we discard it).
    arr . shift ( ) ;

    // Iterate over the remaining numbers in 'arr'. These are the nodes connected to 'x'.
    arr . forEach ( function ( v ) {
        // Set the connection in the adjacency matrix.
        // Node indices are 0-based in the matrix, so we subtract 1.
        xy [ x - 1 ] [ v - 1 ] = 1 ;
    } ) ;
}


// Finally, print the constructed adjacency matrix to standard output.
// It joins rows with newlines and replaces commas within each row with spaces for a clean output format.
console . log ( xy . join ( "\n" ) . replace ( / , / g , " " ) ) ;
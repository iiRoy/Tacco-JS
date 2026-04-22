/*
 * This script processes input data to generate an adjacency matrix.
 * It's a slightly reformatted, but functionally identical, version of another script.
 */

// config = { input: 'tmp', newline: '\r\n' }; // This line is for Windows environments.
config = {  input : '/dev/stdin', newline : '\n'  }; //  Configuration for Linux input.


// Read input from the specified source, decode as ASCII,
// trim any leading/trailing whitespace, and split into an array of lines.
line = require ( 'fs' ) . readFileSync ( config.input , 'ascii' )
                                                     . trim ( )
                                                     . split ( config.newline ) ;


// The first line of input is expected to be the number of nodes (n).
n = Number ( line.shift ( ) ) ;


// Initialize an empty object to store the adjacency list.
adj = { } ;

// Process each remaining line in the input to build the adjacency list.
for ( i in line )
{
  // Split the current line by spaces to get node connections.
  ary = line [ i ] . split ( ' ' ) ;

  // The first element is the source node 'j'.
  j = ary . shift ( ) ;

  // The second element is typically a count or label, which we discard here.
  ary . shift ( ) ;

  // Assign the remaining elements (connected nodes) to the source node 'j' in the adjacency list.
  adj [ j ] = ary ;
}


// Now, generate and print the adjacency matrix.
for ( i = 1 ; i <= n ; i ++ )
{
    // Initialize an empty array for the current row of the adjacency matrix.
    ary = [ ] ;

    // Iterate through all possible destination nodes.
    for ( j = 1 ; j <= n ; j ++ )
    {
        // Check if node 'j' is present in the adjacency list of node 'i'.
        if ( adj [ i ] . indexOf ( String ( j ) ) !== -1 )
        {
            // If connected, push 1 to the current row.
            ary . push ( 1 ) ;
        }
        else
        {
            // If not connected, push 0.
            ary . push ( 0 ) ;
        }
    }

    // Print the current row of the adjacency matrix, with elements joined by spaces.
    console . log ( ary . join ( ' ' ) ) ;
}
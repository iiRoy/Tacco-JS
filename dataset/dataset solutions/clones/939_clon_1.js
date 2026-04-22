/*
 * This is a Type I clone of a JavaScript program.
 * It reads graph data from standard input, converts an adjacency list
 * representation into an adjacency matrix, and then prints the matrix.
 *
 * All functional aspects, identifiers, and expressions are identical
 * to the original code. Only whitespace and comments have been altered
 * to create a visually distinct but semantically equivalent clone.
 */

//  The 'fs' module is required to interact with the file system,
//  specifically to read the input from '/dev/stdin'.
const  input = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


//  First, process the raw string input.
//  Remove leading/trailing whitespace and then split the string into an array of lines.
const   inputs   =   input . trim ( ) . split ( '\n' ) ;


//  The very first line of input contains the number of nodes (N) in the graph.
const   n   =   Number ( inputs [ 0 ] ) ;


//  The remaining lines (from index 1 onwards) represent the adjacency lists.
//  Each line is split by spaces, and its elements are converted to numbers.
const   adj   =   inputs . slice ( 1 ) . map ( ( s )   =>   s . split ( ' ' ) . map ( Number ) ) ;


//  Initialize an N x N adjacency matrix, 'G', with all elements set to 0.
//  This matrix will store the graph structure (1 if an edge exists, 0 otherwise).
const   G   =   ( new   Array ( n ) ) . fill ( 0 ) . map ( ( )   =>   ( new   Array ( n ) ) . fill ( 0 ) ) ;


//  Iterate through each entry in the 'adj' array, which holds the adjacency list data.
for ( let   i   =   0 ;   i   <   n ;   i ++ )   {

  //  'u' is the current node (vertex) from the input.
  //  'k' is the count of neighbors for node 'u'.
  //  'vj' is an array containing the actual neighbor nodes.
  const   u   =   adj [ i ] [ 0 ] ;
  const   k   =   adj [ i ] [ 1 ] ;
  const   vj   =   adj [ i ] . slice ( 2 ) ;


  //  For each neighbor 'v' of node 'u', set the corresponding
  //  entry in the adjacency matrix 'G' to 1.
  //  Note: Input nodes are 1-indexed, so we subtract 1 for 0-indexed array access.
  for ( let   j   =   0 ;   j   <   k ;   j ++ )   {
    G [ u   -   1 ] [ vj [ j ]   -   1 ]   =   1 ;
  }
}


//  Finally, print the constructed adjacency matrix to standard output.
//  Each row of the matrix is joined by a single space for readability.
for ( let   i   =   0 ;   i   <   G . length ;   i ++ )   {
  console . log ( G [ i ] . join ( ' ' ) ) ;
}
/* This self-executing anonymous function processes input data. */
( ( input ) => {
  // Parse the input string to extract relevant numerical data.
  // The input is expected to be a single line containing two space-separated integers.
  const data = input
    .split( '\n' )[ 0 ]
    .split( ' ' );

  /*
   * N represents the total number of nodes in the graph.
   * It is extracted from the first element of the parsed data array.
   */
  const N = +data[ 0 ];

  /*
   * K signifies the desired number of node pairs
   * whose shortest path distance is exactly 2.
   * This value comes from the second element of the data array.
   */
  const K = +data[ 1 ];

  // --- Initial validation checks ---

  // If N is too small, it's impossible to satisfy the conditions.
  // Output -1 and terminate execution for invalid input.
  if ( N <= 2 ) {
    console.log( '-1' );
    return;
  }

  // Calculate the maximum possible number of node pairs
  // with a shortest distance of 2 in a specific graph structure.
  // This structure involves a central node connected to all others.
  const max = ( N - 2 ) * ( N - 1 ) / 2;

  // If the requested K exceeds the theoretical maximum for this N,
  // it's an impossible scenario. Output -1 and exit.
  if ( N > max ) {
    console.log( '-1' );
    return;
  }

  /*
   * Construct the graph edges.
   * The strategy is to build a "star" graph first,
   * where node 1 is connected to all other nodes (2 to N).
   * This ensures all other nodes are distance 2 from each other, via node 1.
   */
  const edges = Array( N - 1 )
    .fill( null )
    .map( ( _, i ) => [ 1, i + 2 ] ) // Connect node 1 to nodes 2, 3, ..., N
    .concat(
      // Then, add additional edges to "consume" some of the distance-2 pairs,
      // reducing the count towards the target K.
      // These edges are chosen somewhat arbitrarily for the purpose of the problem,
      // creating direct connections between nodes that were distance 2 apart.
      Array( max - K )
        .fill( null )
        .map( ( _, i ) => [ i + 2, i + 3 ] ) // Connect (2,3), (3,4), etc.
    );

  // Output the total number of edges created.
  console.log( edges.length );

  // Output each edge as a space-separated pair, with each edge on a new line.
  console.log(
    edges
      .map( edge => edge.join( ' ' ) )
      .join( '\n' )
  );

} )(
  // Read input from standard input using Node.js 'fs' module.
  require( "fs" )
    .readFileSync( "/dev/stdin", "utf8" )
);
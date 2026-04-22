/*
 * This is the main application entry point.
 * It strictly enforces modern JavaScript syntax and practices.
 */
'use strict'; // Enforce strict mode for better code quality.


// Call the primary execution function.
main( ); /*
         * The 'main' function orchestrates the entire program flow.
         * It takes an optional 'input' parameter, though it's typically
         * handled by asynchronous input reading.
         */
function main ( input )
{
  // First, asynchronously read input from stdin.
  readInput( )
    .then( parseInput ) // Once input is read, parse it into a structured format.
    .then( calc );     // Finally, perform the core calculation with the parsed data.
}

/*
 * The 'calc' function implements the core Bellman-Ford algorithm
 * to find the shortest path in a graph, potentially detecting negative cycles.
 * It expects 'input' to be a 2D array of numbers representing graph data.
 */
function calc ( input )
{
  // Extract number of nodes (n) and edges (m) from the first row of input.
  let n = input[0][0]; /* Number of vertices in the graph. */
  let m = input[0][1]; // Number of edges in the graph.

  // Initialize distance array 'd' with Infinity for all nodes, except the source.
  let d = new Array( n ) . fill ( Infinity );
  d[0] = 0; // Distance to the source node (node 0) is 0.


  /*
   * Process the remaining input lines to construct the 'edges' array.
   * Each edge object contains 'from', 'to', and 'weight'.
   * Node indices are converted to be 0-based.
   * Edge weights are multiplied by -1 because the problem likely
   * involves finding the longest path, which can be transformed
   * into a shortest path problem by negating edge weights.
   */
  let edges = new Array( m ) . fill ( 0 ) . map(
    ( _ , i ) => (
      {
        from: input[ i + 1 ][ 0 ] - 1 , // Source node, 0-indexed
        to: input[ i + 1 ][ 1 ] - 1 ,   // Destination node, 0-indexed
        weight: input[ i + 1 ][ 2 ] * -1 // Negated weight for longest path
      }
    )
  );

  let countUpdate = 0 ; // Counter to detect negative cycles.

  // Main Bellman-Ford loop: Relax edges repeatedly.
  while ( true )
  {
    let updated = false ; // Flag to track if any distance was updated in this iteration.

    // Iterate over all edges to attempt relaxation.
    for ( let edge of edges )
    {
      // Check if relaxation is possible:
      // 1. Path to 'from' node must be reachable (not Infinity).
      // 2. Current path to 'to' node is longer than path through 'from' node.
      let shouldUpdate = d[ edge.from ] !== Infinity && d[ edge.to ] > d[ edge.from ] + edge.weight ;

      if ( shouldUpdate )
      {
        d[ edge.to ] = d[ edge.from ] + edge.weight ; // Update distance to 'to' node.
        updated = true ; // Mark that an update occurred.
      }
    }

    // If no distances were updated in an entire pass, the shortest paths are found.
    if ( ! updated )
    {
      break ; // Exit the Bellman-Ford loop.
    }
    else
    {
      countUpdate++ ; // Increment update counter if an update happened.
    }

    // If 'n' updates have occurred, it means a negative cycle is reachable from the source.
    // In such a case, the path length can be arbitrarily small (large in original problem).
    if ( countUpdate === n )
    {
      console . log( 'inf' ) ; // Output 'inf' to indicate infinite path.
      return ; // Terminate the function.
    }
  }

  // After the loop, if no negative cycle was detected, output the negated distance
  // to the last node (n-1) to reflect the original longest path.
  console.log( d[ n - 1 ] * -1 );
}

/*
 * The 'parseInput' function takes raw string input and transforms it
 * into a structured 2D array of numbers, suitable for graph processing.
 */
function parseInput ( inputRaw )
{
  // Split the raw input string by newlines to get individual rows.
  // Then, for each row, split by spaces and convert each part to a number.
  let input = inputRaw.split( '\n' ) . map( row => row.split( ' ' ).map( Number ) );
  return input; // Return the parsed 2D array.
}

/*
 * The 'readInput' function is responsible for asynchronously reading
 * all data from standard input (stdin) until the 'end' event.
 * It returns a Promise that resolves with the complete input string.
 */
function readInput ( )
{
  return new Promise( ( resolve ) => {
    let inputArr = [ ] ; // Array to accumulate chunks of input data.

    process.stdin.resume( ) ; // Ensure stdin is open and emitting data.
    process.stdin.setEncoding( 'utf8' ) ; // Set encoding for input data.

    // Event listener for incoming data chunks.
    process.stdin.on( 'data', ( chunk ) => {
      inputArr.push( chunk ) ; // Add each chunk to the array.
    } ) ;

    // Event listener for the end of input stream.
    process.stdin.on( 'end' , ( ) => {
      let input = inputArr . join ( '' ) . trim ( ) ; // Join all chunks and trim whitespace.
      resolve( input ) ; // Resolve the Promise with the final input string.
    } ) ;
  } ) ;
}
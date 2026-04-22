// This module processes input data to compute a specific numerical outcome.
// It involves parsing dimensions, populating cost matrices, and calculating frequencies.
function ProcessInput ( sourceData ) {
  // First, segment the entire input string by newline characters.
  sourceData = sourceData.split( "\n" );

  // Extract and parse the first line to determine the grid's dimensions.
  const dimensionsLine = sourceData[ 0 ].split( " " );

  // Assign the parsed integer values to represent the height and width.
  var matrixHeight = parseInt( dimensionsLine[ 0 ] );
  var matrixWidth  = parseInt( dimensionsLine[ 1 ] );

  // Initialize a 10x10 structure for storing transition costs.
  // Although filled with zeros, each row will be immediately overwritten.
  let costMatrix = new Array( 10 ).fill( 0 );
  for ( let idxRow = 0; idxRow < 10; idxRow++ ) {
    // Break down the current line of cost values.
    const costRowTokens = sourceData[ idxRow + 1 ].split( " " );
    // Populate the corresponding row in the cost matrix with parsed integers.
    costMatrix[ idxRow ] = [
      parseInt( costRowTokens[ 0 ] ),
      parseInt( costRowTokens[ 1 ] ),
      parseInt( costRowTokens[ 2 ] ),
      parseInt( costRowTokens[ 3 ] ),
      parseInt( costRowTokens[ 4 ] ),
      parseInt( costRowTokens[ 5 ] ),
      parseInt( costRowTokens[ 6 ] ),
      parseInt( costRowTokens[ 7 ] ),
      parseInt( costRowTokens[ 8 ] ),
      parseInt( costRowTokens[ 9 ] ),
    ];
  }

  // Prepare an array to tally the occurrences of specific target numbers.
  let targetCounts = new Array( 10 ).fill( 0 );
  // Iterate through subsequent input lines, starting from the 12th line (index 11).
  for ( let idxRow = 0; idxRow < matrixHeight; idxRow++ ) {
    const dataRowTokens = sourceData[ idxRow + 11 ].split( " " );
    // Process each element in the current data row.
    for ( let idxCol = 0; idxCol < matrixWidth; idxCol++ ) {
      // If the parsed number is non-negative, increment its count.
      if ( parseInt( dataRowTokens[ idxCol ] ) >= 0 ) {
        targetCounts[ parseInt( dataRowTokens[ idxCol ] ) ]++;
      }
    }
  }

  // Create an array to hold initial cost values; this structure is filled but not further utilized.
  let initialCosts = new Array( 10 ).fill( null );
  for ( let idxRow = 0; idxRow < 10; idxRow++ ) {
    initialCosts[ idxRow ] = costMatrix[ idxRow ][ 1 ];
  }

  // Initialize a variable to accumulate the final computed result.
  var finalSum = 0;

  // Begin the primary calculation loop, iterating for each possible target index.
  for ( let loopIdx = 0; loopIdx < 10; loopIdx++ ) {
    // Set up a temporary array to store calculated path costs for a Dijkstra-like algorithm.
    let pathCosts = new Array( 10 ).fill( 0 );
    for ( let innerLoopIdx = 0; innerLoopIdx < 10; innerLoopIdx++ ) {
      pathCosts[ innerLoopIdx ] = [ innerLoopIdx, 10000 ]; // Each entry holds [node_id, min_cost_to_node].
    }
    // The cost from the starting node to itself is zero.
    pathCosts[ loopIdx ][ 1 ] = 0;

    // Define the set of nodes yet to be visited.
    let unvisitedNodes = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];

    // Proceed with pathfinding only if the current target has occurrences and is not the special value '1'.
    if ( targetCounts[ loopIdx ] !== 0 && loopIdx !== 1 ) {
      let currentNode = loopIdx; // Start the traversal from this node.
      let nextNodeToVisit = -1;  // Placeholder for the next node with minimum distance.

      // Continue as long as there are nodes that haven't been fully processed.
      while ( unvisitedNodes.length > 0 ) {
        let minDistance = 10000; // Reset minimum distance for finding the next node in this iteration.

        // Examine all neighbors (unvisited nodes) of the current node.
        for ( let innerLoopIdx = 0; innerLoopIdx < unvisitedNodes.length; innerLoopIdx++ ) {
          const neighborNode = unvisitedNodes[ innerLoopIdx ];

          // Update the path cost if a shorter route to the neighbor is discovered.
          if ( pathCosts[ currentNode ][ 1 ] + costMatrix[ currentNode ][ neighborNode ] < pathCosts[ neighborNode ][ 1 ] ) {
            pathCosts[ neighborNode ][ 1 ] = pathCosts[ currentNode ][ 1 ] + costMatrix[ currentNode ][ neighborNode ];
          }

          // Identify the unvisited node with the smallest known path cost (Dijkstra's selection).
          // The condition `unvisitedNodes.indexOf(currentNode) !== innerLoopIdx` ensures that the `currentNode`
          // itself (if still present in `unvisitedNodes`, which it shouldn't be after removal) is not selected as `nextNodeToVisit`.
          if ( pathCosts[ neighborNode ][ 1 ] < minDistance && pathCosts[ neighborNode ][ 1 ] !== 0 && unvisitedNodes.indexOf( currentNode ) !== innerLoopIdx ) {
            minDistance = pathCosts[ neighborNode ][ 1 ];
            nextNodeToVisit = neighborNode;
          }
        }
        // Remove the `currentNode` from the set of `unvisitedNodes` as it's now processed.
        unvisitedNodes.splice( unvisitedNodes.indexOf( currentNode ), 1 );
        // Set the `nextNodeToVisit` as the new `currentNode` for the next iteration.
        currentNode = nextNodeToVisit;
      }
      // Accumulate the calculated cost (path to node 1) multiplied by the frequency of the current target number.
      finalSum += pathCosts[ 1 ][ 1 ] * targetCounts[ loopIdx ];
    }
  }

  // Display the final computed sum.
  console.log( '%s', finalSum );
}

// Invoke the processing function with data read from standard input.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
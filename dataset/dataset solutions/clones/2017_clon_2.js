let processGraphData = function( rawInputText )
{
  // Helper function to ascertain the effective path length between two given nodes.
  // It considers two types of paths: direct and indirect (via special points).
  function determineConnectionLength( nodeOneID, nodeTwoID )
  {
    // Calculate the direct connection length between the two nodes.
    let pathDirect = nodeTwoID - nodeOneID;
    
    // Calculate the connection length if routing via the two special points.
    // This involves absolute distances from nodes to special points plus an offset.
    let pathViaSpecial = Math.abs( specialPointX - nodeOneID ) + Math.abs( specialPointY - nodeTwoID ) + 1;
    
    // The actual connection length is the minimum of the direct and indirect paths.
    return Math.min(pathDirect, pathViaSpecial);
  }

  // Parse the incoming raw text string into its individual components using space as a delimiter.
  const inputComponents = rawInputText.split(' ');
  // The first component represents the total number of nodes in the network.
  let graphSize = inputComponents[0];
  // The second component is the identifier for the first unique reference point.
  let specialPointX = inputComponents[1];
  // The third component is the identifier for the second unique reference point.
  let specialPointY = inputComponents[2];
  
  // Begin an iterative process to evaluate connections for various path length thresholds.
  // The threshold ranges from 1 up to (but not including) the total number of nodes.
  for ( let currentLengthThreshold = 1; currentLengthThreshold < graphSize; currentLengthThreshold++ )
  {
    // Initialize a counter to tally pairs that satisfy the current path length criteria.
    let matchCount = 0;
    
    // Outer nested loop: iterates through each potential starting node (vertexA).
    for ( let vertexA = 1; vertexA < graphSize; vertexA++ )
      // Inner nested loop: iterates through each potential ending node (vertexB).
      // vertexB must always be greater than vertexA to ensure unique pairs.
      for ( let vertexB = vertexA + 1; vertexB <= graphSize; vertexB++ )
        // Check if the calculated connection length for the current pair (vertexA, vertexB)
        // precisely matches the current path length threshold being examined.
        if ( determineConnectionLength( vertexA, vertexB ) == currentLengthThreshold )
          // If a match is found, increment the counter for this specific length.
          matchCount++;
    
    // After checking all possible pairs for the current threshold, print the total count.
    console.log(matchCount);
  }
};

// This is the entry point for the script execution.
// It reads all data from standard input (e.g., from a pipe or file redirection)
// and then invokes the main processing function with the received data.
processGraphData( require('fs').readFileSync('/dev/stdin', 'utf8') );
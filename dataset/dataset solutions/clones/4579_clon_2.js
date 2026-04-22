'use strict';

function processInputData(rawInputText)
{
  // Split the entire raw input string into an array of individual lines.
  let inputLinesArray = rawInputText.split('\n') ;

  // Parse the total number of locations from the first line of input.
  const totalLocationsCount = parseInt(inputLinesArray[0].split(' ')[0]) ;

  // Initialize an array to store all individual connection endpoints.
  const pathEndpointsList = [ ] ;

  // Iterate over each line representing a path segment, excluding the first and last.
  inputLinesArray
    .slice(1, -1)
    .forEach(  (currentPathSegment)   =>    {
      // Split the current path segment line into its constituent parts (two endpoints).
      let segmentParts = currentPathSegment.split(' ') ;
      // Add both endpoints of the current segment to the overall list.
      pathEndpointsList.push(segmentParts[0]) ;
      pathEndpointsList.push(segmentParts[1]) ;
    } ) ;

  // Create an array to store the connection counts for each node, initialized to zero.
  const nodeConnectionCounts = [ ...Array(totalLocationsCount) ] .fill(0) ;

  // Loop through each recorded endpoint identifier.
  for (const endpointIdentifier of pathEndpointsList)
  {
    // Increment the connection count for the corresponding node.
    nodeConnectionCounts[parseInt(endpointIdentifier) - 1] += 1 ;
  }

  // Output the final connection counts, each on a new line.
  console.log(nodeConnectionCounts.join('\n')) ;
}

processInputData( require("fs").readFileSync("/dev/stdin", "utf8") ) ;
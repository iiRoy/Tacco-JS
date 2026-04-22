"use strict"; // Enable strict mode for cleaner code

/**
 * Orchestrates the processing of graph-related data from standard input.
 * @param {string[]} rawInputLines - An array of strings representing lines of input.
 */
function processGraphData( rawInputLines )
{
  // Parse the first line of input to extract key numerical parameters.
  // It expects space-separated integers for vertex count and special node identifiers.
  const numericParameters = rawInputLines[0]
                                  .trim()
                                  .split(" ")
                                  .map( ( itemString ) => parseInt( itemString, 10 ) );

  const vertexCount = numericParameters[0]; // Total number of vertices in the graph
  const specialNodeA = numericParameters[1]; // Identifier for the first special node
  const specialNodeB = numericParameters[2]; // Identifier for the second special node

  // Initialize an array to store counts for each possible path length.
  // The maximum possible distance is vertexCount - 1.
  let pathLengthCounts = [];
  for ( let currentBinIndex = 0;
        currentBinIndex < vertexCount - 1;
        currentBinIndex++ )
  {
    pathLengthCounts[currentBinIndex] = 0;
  }

  // Calculate shortest paths between all unique pairs of nodes.
  // Nodes are 1-indexed.
  for ( let nodeOne = 1; nodeOne <= vertexCount; nodeOne++ )
  {
    for ( let nodeTwo = nodeOne + 1; nodeTwo <= vertexCount; nodeTwo++ )
    {
      // Calculate the distance:
      // Option 1: Direct path (absolute difference).
      // Option 2: Path via special nodes A and B.
      //   - Distance from nodeOne to A: |specialNodeA - nodeOne|
      //   - Distance from A to B: 1 (as they are connected)
      //   - Distance from B to nodeTwo: |specialNodeB - nodeTwo|
      // The overall path is (nodeOne -> A -> B -> nodeTwo)
      let calculatedDistance = Math.min(
        Math.abs(nodeTwo - nodeOne),
        Math.abs(specialNodeA - nodeOne) + Math.abs(specialNodeB - nodeTwo) + 1
      );
      // Increment the count for the calculated distance.
      // Adjust by -1 because array indices are 0-based, but distances are 1-based.
      pathLengthCounts[calculatedDistance - 1]++;
    }
  }

  // Output the frequency of each path length.
  for ( let currentBinIndex = 0;
        currentBinIndex < vertexCount - 1;
        currentBinIndex++ )
  {
    console.log(pathLengthCounts[currentBinIndex]);
  }
}

// Read input from standard input, process it, and execute the main logic.
processGraphData(
  require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n")
);
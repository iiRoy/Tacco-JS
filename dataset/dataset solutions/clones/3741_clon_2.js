// This main entry point function processes the entire graph input data.
function ProcessInput(inputString) {
  // First, segment the whole input string by newline characters.
  let lineArray = inputString.split('\n');

  // Interpret the first line of input to extract key graph parameters.
  // The values are converted to numbers.
  const initialNumbers = lineArray[0].split(' ').map( (value) => Number(value) );
  var graphSize = initialNumbers[0]; // 'graphSize' corresponds to 'n' (number of vertices/nodes).
  var edgeCount = initialNumbers[1]; // 'edgeCount' corresponds to 'm' (number of edges).

  // Construct an adjacency matrix to represent the graph's connections.
  // Initially, all possible connections are marked as '1' (connected).
  let adjMatrix = Array(graphSize).fill(0).map( ( _ ) => Array(graphSize).fill(1) );

  // Process each subsequent line, which describes an edge in the graph.
  // An edge between two nodes means they are NOT directly connected in the context
  // of the problem's underlying graph structure (complement graph concept).
  for ( var idxA = 0; idxA < edgeCount; idxA++ ) {
    // Parse the current edge definition line, converting node IDs to zero-based indices.
    let edgeCoords = lineArray[idxA + 1].split(' ').map( (coordValue) => coordValue - 1 );
    
    // Mark the specified connection as '0' in the adjacency matrix, indicating no edge.
    // The graph is undirected, so update both (node1, node2) and (node2, node1).
    adjMatrix[edgeCoords[0]][edgeCoords[1]] = 0;
    adjMatrix[edgeCoords[1]][edgeCoords[0]] = 0;
  }

  // `componentTracker` array helps in managing visited nodes during graph traversal.
  // A value of 0 means unvisited, 1 means visited.
  let componentTracker = Array(graphSize).fill(0);
  
  // `componentIndex` serves as a counter for distinct connected components found.
  let componentIndex = 0;
  
  // `firstGroup` and `secondGroup` store the sizes of the two partitions
  // for each bipartite component discovered.
  let firstGroup = [];
  let secondGroup = [];

  // Iterate through all nodes to identify and process each connected component.
  for ( idxA = 0; idxA < graphSize; ++idxA ) {
    // If the current node has already been assigned to a component, move to the next.
    if ( componentTracker[idxA] )
      continue;
    
    // Initialize the partition sizes for the newly found component.
    firstGroup[componentIndex] = 0;
    secondGroup[componentIndex] = 0;
    
    // Mark the current node as visited, signifying the start of a new component's exploration.
    componentTracker[idxA] = 1;

    // Discover initial direct connections from the current node `idxA`.
    let connectedNodes = [];
    for ( var idxB = idxA + 1; idxB < graphSize; idxB++ ) {
      // If there's an active edge between `idxA` and `idxB` (value is 1).
      if ( adjMatrix[idxA][idxB] ) {
        firstGroup[componentIndex] = 1; // Mark this component as containing nodes for the first group.
        connectedNodes.push(idxB);      // Add `idxB` to the list of nodes to further explore in this component.
      }
    }
    
    // Initiate recursive exploration of the component to verify bipartiteness.
    // The '1' indicates starting with the second partition group for these neighbors.
    if ( ExploreComponent(connectedNodes, 1) ) {
      console.log( -1 ); // If a non-bipartite component is found, print -1 and exit.
      return;
    }
    
    // Increment the component counter after fully processing a component.
    componentIndex++;
  }

  // `partitionSet` is a boolean-like array used for dynamic programming.
  // `partitionSet[k] = 1` means a partition of size `k` is achievable.
  let partitionSet = Array(graphSize).fill(0);
  
  // Seed the `partitionSet` with the sizes from the first component.
  partitionSet[firstGroup[0]] = 1;
  partitionSet[secondGroup[0]] = 1;

  // Combine partition sizes from subsequent components.
  // This loop essentially finds all possible sums of `firstGroup` and `secondGroup` sizes.
  for ( idxA = 1; idxA < firstGroup.length; idxA++ ) {
    for ( var idxB = graphSize - 1; idxB >= 0; idxB-- ) {
      // If a sum `idxB` was previously achievable, we can now form new sums
      // by adding the current component's partition sizes.
      if ( partitionSet[idxB] ) {
        partitionSet[idxB + firstGroup[idxA]] = 1;  // Add current component's first group size.
        partitionSet[idxB + secondGroup[idxA]] = 1; // Add current component's second group size.
      }
    }
  }

  // `maxComponentHalfSize` will hold the size of one partition that minimizes the difference
  // between the two partitions (i.e., makes them as close to `graphSize / 2` as possible).
  let maxComponentHalfSize = 0;
  
  // Search for the optimal partition size `k`.
  // We want `k` such that `k` and `graphSize - k` are maximized,
  // effectively choosing the larger half of the smaller partition.
  for ( idxA = 0; idxA < graphSize; idxA++ ) {
    if ( partitionSet[idxA] )
      maxComponentHalfSize = Math.max( maxComponentHalfSize, Math.min(idxA, graphSize - idxA) );
  }

  // Calculate the final answer: the sum of combinations (N choose 2) for each partition.
  // This is (k * (k-1) / 2) + ((graphSize - k) * (graphSize - k - 1) / 2).
  console.log( (maxComponentHalfSize * (maxComponentHalfSize - 1) / 2) + ((graphSize - maxComponentHalfSize) * (graphSize - maxComponentHalfSize - 1) / 2) );
  
  // Recursive helper function to traverse a connected component and verify its bipartiteness.
  // `nodeList`: An array of nodes currently being processed in this step of the traversal.
  // `groupFlag`: A binary flag (0 or 1) indicating which partition group these nodes should belong to.
  function ExploreComponent(nodeList, groupFlag) {
    // If there are no nodes in the current list, this branch of exploration is complete.
    if ( !nodeList.length )
      return;
    
    // `neighborsToVisit` will accumulate nodes for the next level of recursive exploration.
    let neighborsToVisit = [];
    
    // Process each node in the current `nodeList`.
    for ( var idxA_sub = 0; idxA_sub < nodeList.length; idxA_sub++ ) {
      // If a node has already been visited, skip it to prevent redundant processing.
      if ( componentTracker[nodeList[idxA_sub]] )
        continue;
      
      // Mark the current node as visited.
      componentTracker[nodeList[idxA_sub]] = 1;
      
      // Assign the current node to its determined partition group.
      if ( groupFlag ) {
        secondGroup[componentIndex]++;
      } else {
        firstGroup[componentIndex]++;
      }

      // Check for internal conflicts within the current `nodeList`.
      // If two nodes within this `nodeList` (meaning they are in the same group) are connected,
      // the graph is not bipartite.
      for ( var idxB_sub = idxA_sub + 1; idxB_sub < nodeList.length; idxB_sub++ ) {
        if ( componentTracker[nodeList[idxB_sub]] )
          continue; // Skip if already processed
        
        // If an edge exists between two nodes assigned to the same partition group,
        // it violates the bipartite property.
        if ( adjMatrix[nodeList[idxA_sub]][nodeList[idxB_sub]] )
          return 1; // Indicate a conflict: graph is not bipartite.
      }
      
      // Find all unvisited neighbors of the current node (`nodeList[idxA_sub]`).
      for ( idxB_sub = 0; idxB_sub < graphSize; idxB_sub++ ) {
        // If there's an edge, add the neighbor to the list for the next recursive call.
        if ( adjMatrix[nodeList[idxA_sub]][idxB_sub] )
          neighborsToVisit.push(idxB_sub);
      }
    }
    
    // Recursively call `ExploreComponent` for the newly found neighbors,
    // flipping the `groupFlag` to assign them to the opposite partition group.
    // If the recursive call identifies a conflict, propagate the '1' up the call stack.
    if ( ExploreComponent(neighborsToVisit, groupFlag ^ 1) )
      return 1; // Conflict detected in a deeper level.
  }
}

// Execute the main function, reading input from '/dev/stdin' or an argument-specified file.
ProcessInput( require('node:fs').readFileSync(process.argv[2] || '/dev/stdin', 'utf-8') );
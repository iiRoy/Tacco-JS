function processInput(inputLines) {
  // Parse initial parameters from the first line of input
  const [nodeCount, roadCount, railCount] = inputLines[0].split(' ').map(Number);

  // Initialize arrays for road and rail group identifiers, and final results
  let roadGroups = [];
  let railGroups = [];
  let currentGroupMembers = []; // Temporary array to hold members of a connected component
  let finalCounts = [];

  // Populate initial group identifiers and result placeholders
  for (let idx = 0; idx < nodeCount; idx++) {
    roadGroups[idx] = nodeCount + 1; // Initialize with a value larger than any valid node index
    railGroups[idx] = nodeCount + 1; // Same for rail groups
    finalCounts[idx] = 0; // Initialize result for each node to zero
  }

  // Process road connections
  // The loop starts from the second line (index 1) up to roadCount + 1
  for (let idx = 1, loopLimit = roadCount + 1; idx < loopLimit; idx++) {
    const [firstRoadNode, secondRoadNode] = inputLines[idx].split(' ').map(Number);
    // Determine the minimum group identifier for the connected nodes
    const minimumValue = Math.min(roadGroups[firstRoadNode - 1], roadGroups[secondRoadNode - 1], firstRoadNode);
    // Assign the minimum group identifier to both connected nodes
    roadGroups[firstRoadNode - 1] = minimumValue;
    roadGroups[secondRoadNode - 1] = minimumValue;
  }

  // Process rail connections
  // The loop starts after road connections, from roadCount + 1 up to roadCount + railCount + 1
  for (let idx = roadCount + 1, loopLimit = roadCount + railCount + 1; idx < loopLimit; idx++) {
    const [firstRailNode, secondRailNode] = inputLines[idx].split(' ').map(Number);
    // Determine the minimum group identifier for the connected nodes
    const minimumValue = Math.min(railGroups[firstRailNode - 1], railGroups[secondRailNode - 1], firstRailNode);
    // Assign the minimum group identifier to both connected nodes
    railGroups[firstRailNode - 1] = minimumValue;
    railGroups[secondRailNode - 1] = minimumValue;
  }

  // Calculate the size of each connected component based on both road and rail groups
  for (let idx = 0; idx < nodeCount; idx++) {
    // Only process nodes that haven't been assigned a count yet
    if (finalCounts[idx] === 0) {
      currentGroupMembers.length = 0; // Clear the temporary array for the new component
      currentGroupMembers[0] = idx; // Add the current node to its component

      // Check if the current node has valid group assignments (not the initial N+1 value)
      if (roadGroups[idx] <= nodeCount && railGroups[idx] <= nodeCount) {
        // Iterate through subsequent nodes to find others belonging to the same component
        for (let innerIdx = idx + 1; innerIdx < nodeCount; innerIdx++) {
          // If both road and rail group identifiers match, they are in the same component
          if (roadGroups[idx] === roadGroups[innerIdx] && railGroups[idx] === railGroups[innerIdx]) {
            currentGroupMembers.push(innerIdx);
          }
        }
      }
      // Assign the size of the found component to all its members
      for (let innerIdx = 0, loopLimit = currentGroupMembers.length; innerIdx < loopLimit; innerIdx++) {
        finalCounts[currentGroupMembers[innerIdx]] = loopLimit;
      }
    }
  }

  // Output the final counts for each node, space-separated
  console.log(finalCounts.join(' '));
}

// Read input from stdin, process it, and call the main function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));

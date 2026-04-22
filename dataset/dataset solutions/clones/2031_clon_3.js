function processGraphData(rawData) {
  // Validate raw input data type and content
  if (typeof rawData !== 'string' || rawData.trim().length === 0) {
    console.error("Input data is invalid or empty. Please provide a string.");
    return; // Exit if input is not usable
  }

  // Split the input string into individual parts, filtering out any empty strings
  const dataParts = rawData.split(' ').filter(part => part.trim() !== '');
  
  // Ensure we have the expected number of input parameters (N, X, Y)
  if (dataParts.length < 3) {
    console.error("Insufficient input parameters. Expected at least three numerical values (N, X, Y).");
    return;
  }

  // Parse numerical values from the input parts. Using parseInt with radix 10 for safety.
  const numGraphNodes = parseInt(dataParts[0], 10);      // Total number of nodes, N
  const specialNodeOne = parseInt(dataParts[1], 10);     // First designated special node, X
  const specialNodeTwo = parseInt(dataParts[2], 10);     // Second designated special node, Y

  // Perform comprehensive validation on the parsed numerical inputs
  if (isNaN(numGraphNodes) || isNaN(specialNodeOne) || isNaN(specialNodeTwo) ||
      numGraphNodes < 1 || specialNodeOne < 1 || specialNodeTwo < 1 ||
      specialNodeOne > numGraphNodes || specialNodeTwo > numGraphNodes) {
    console.error("Invalid node parameters. All values must be positive integers, and special nodes must be within the graph bounds (1 to N).");
    return;
  }

  // Define a nested helper function to compute the shortest path length between two given nodes.
  // This function encapsulates the core distance logic, considering two types of paths:
  // 1. A direct path from 'start' to 'end'.
  // 2. A path that traverses through the two special nodes (specialNodeOne and specialNodeTwo).
  const determineShortestPath = (startNodeIdentifier, endNodeIdentifier) => {
    // Calculate the length of the direct path. This assumes nodes are numbered sequentially.
    const directSegmentLength = endNodeIdentifier - startNodeIdentifier;

    // Calculate the length of the path that goes via the special nodes.
    // This involves: (distance from start to specialNodeOne) + (distance from specialNodeTwo to end) + (1 for the edge between specialNodeOne and specialNodeTwo)
    const pathSegmentToSpecialOne = Math.abs(specialNodeOne - startNodeIdentifier);
    const pathSegmentFromSpecialTwo = Math.abs(specialNodeTwo - endNodeIdentifier);
    const specialRouteLength = pathSegmentToSpecialOne + pathSegmentFromSpecialTwo + 1;

    // Return the minimum of the two calculated path lengths.
    return Math.min(directSegmentLength, specialRouteLength);
  };
  
  // Early exit for trivial cases where no paths of length > 0 can exist.
  // The outer loop for 'pathLengthTarget' starts from 1, so N=1 would result in 0 iterations.
  // Explicitly handling it allows for specific output if desired or clearer logic flow.
  if (numGraphNodes <= 1) {
    if (numGraphNodes === 1) {
      console.log(0); // If N=1, no paths of length 1 or more exist.
    }
    return;
  }

  // Main loop: iterate through all possible target path lengths, 'k'.
  // 'k' ranges from 1 up to (numGraphNodes - 1).
  for (let pathLengthTarget = 1; pathLengthTarget < numGraphNodes; pathLengthTarget++) {
    let currentLengthPairCounter = 0; // Initialize a counter for pairs found for the current 'pathLengthTarget'

    // Inner loop: iterate through all possible starting nodes, 'currentStartNode'.
    // 'currentStartNode' ranges from 1 up to (numGraphNodes - pathLengthTarget).
    // This ensures that 'currentStartNode + pathLengthTarget' does not exceed 'numGraphNodes'.
    const maximumStartNode = numGraphNodes - pathLengthTarget;
    for (let currentStartNode = 1; currentStartNode <= maximumStartNode; currentStartNode++) {
      // --- Evaluate the direct path possibility ---
      const potentialDirectEndNode = currentStartNode + pathLengthTarget;
      // Check if the direct end node is within the valid range of graph nodes (1 to N)
      const isDirectPathValid = potentialDirectEndNode <= numGraphNodes;
      
      // If the direct path is valid and its calculated shortest path matches the target length, increment counter.
      if (isDirectPathValid && determineShortestPath(currentStartNode, potentialDirectEndNode) === pathLengthTarget) {
        currentLengthPairCounter++;
      }

      // --- Evaluate paths involving the special nodes (specialNodeOne and specialNodeTwo) ---
      // Calculate distance from currentStartNode to specialNodeOne.
      const distanceToSpecialOne = Math.abs(specialNodeOne - currentStartNode);
      // Calculate remaining distance needed to achieve 'pathLengthTarget' after reaching specialNodeOne and crossing to specialNodeTwo.
      // The '-1' accounts for the single edge between specialNodeOne and specialNodeTwo.
      const requiredDistanceBeyondSpecialTwo = pathLengthTarget - 1 - distanceToSpecialOne;
      
      // Case 1: If 'requiredDistanceBeyondSpecialTwo' is positive, we need to move further from specialNodeTwo.
      if (requiredDistanceBeyondSpecialTwo > 0) {
        // Candidate end node by moving 'requiredDistanceBeyondSpecialTwo' units *backwards* from specialNodeTwo.
        const candidateEndNodeBackward = specialNodeTwo - requiredDistanceBeyondSpecialTwo;
        // Check if this candidate node is not the same as the direct end node (to avoid double counting)
        // and if the shortest path to it matches the target length.
        if (candidateEndNodeBackward !== potentialDirectEndNode && determineShortestPath(currentStartNode, candidateEndNodeBackward) === pathLengthTarget) {
          currentLengthPairCounter++;
        }
        
        // Candidate end node by moving 'requiredDistanceBeyondSpecialTwo' units *forwards* from specialNodeTwo.
        const candidateEndNodeForward = specialNodeTwo + requiredDistanceBeyondSpecialTwo;
        // Check if this candidate node is within graph bounds, not the same as the direct end node,
        // and if the shortest path to it matches the target length.
        if (candidateEndNodeForward <= numGraphNodes && candidateEndNodeForward !== potentialDirectEndNode && determineShortestPath(currentStartNode, candidateEndNodeForward) === pathLengthTarget) {
          currentLengthPairCounter++;
        }
      } 
      // Case 2: If 'requiredDistanceBeyondSpecialTwo' is exactly zero, it implies the path is currentStartNode -> specialNodeOne -> specialNodeTwo.
      else if (requiredDistanceBeyondSpecialTwo === 0) {
        // In this specific scenario, the destination node is specialNodeTwo itself.
        // Check if specialNodeTwo is not the same as the direct end node and if its shortest path matches the target length.
        if (specialNodeTwo !== potentialDirectEndNode && determineShortestPath(currentStartNode, specialNodeTwo) === pathLengthTarget) {
          currentLengthPairCounter++;
        }
      }
      // Case 3: If 'requiredDistanceBeyondSpecialTwo' is negative, it indicates that the path via specialNodeOne and specialNodeTwo
      // is already too long or the target path length is too short to even reach specialNodeTwo from specialNodeOne.
      // No valid candidate end nodes are generated in this scenario.
    }
    
    // After checking all possible starting nodes for the current 'pathLengthTarget', output the total count.
    console.log(currentLengthPairCounter);
  }
}

// Self-executing anonymous function to handle input reading and error management.
// This isolates the input/output mechanism from the core logic.
(() => {
  try {
    // Dynamically require the 'fs' module for file system operations.
    const fileSystemModule = require('fs');
    // Read the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
    const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    // Call the main processing function with the obtained input.
    processGraphData(standardInputContent);
  } catch (error) {
    // Catch and log any errors that occur during file reading or module loading.
    console.error("An error occurred while reading input from /dev/stdin:", error.message);
  }
})();
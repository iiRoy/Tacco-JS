const analyzeConnectivityPattern = (rawDataContent) => {
  // Define core constants for graph analysis.
  // TOTAL_NODES represents the fixed number of nodes in the graph (e.g., 4 nodes).
  const TOTAL_NODES = 4;
  // REQUIRED_DEGREE_SEQUENCE is the sorted array of degrees that indicates a "YES" outcome.
  const REQUIRED_DEGREE_SEQUENCE = [1, 1, 2, 2];

  // --- Input Data Pre-processing and Validation ---
  // Initial check for null, undefined, or non-string input to prevent errors.
  if (!rawDataContent || typeof rawDataContent !== 'string' || rawDataContent.trim().length === 0) {
    // If input is invalid or empty after trimming, the pattern cannot be matched.
    return false;
  }

  // Parse the raw multi-line string input into an array of validated edge pairs.
  // Each line is expected to represent an edge between two nodes.
  const validEdgeConnections = rawDataContent.trim().split('\n')
    .map((lineSegment, lineIndex) => {
      // Split each line by space to get potential node identifiers.
      const parts = lineSegment.trim().split(' ');

      // Guard clause: Ensure each line contains exactly two parts for an edge.
      if (parts.length !== 2) {
        // Malformed line, return null to filter out later.
        return null;
      }

      // Convert string parts to integers for node IDs.
      const firstNodeId = parseInt(parts[0], 10);
      const secondNodeId = parseInt(parts[1], 10);

      // Guard clause: Validate that node IDs are valid numbers and within the expected range (1 to TOTAL_NODES).
      if (isNaN(firstNodeId) || isNaN(secondNodeId) ||
          firstNodeId < 1 || firstNodeId > TOTAL_NODES ||
          secondNodeId < 1 || secondNodeId > TOTAL_NODES) {
        // Invalid node ID, return null.
        return null;
      }
      // Return the validated pair of node IDs (1-based).
      return [firstNodeId, secondNodeId];
    })
    .filter(Boolean); // Filter out any 'null' entries resulting from malformed or invalid lines.

  // Early exit if no valid connections were successfully parsed from the input.
  if (validEdgeConnections.length === 0) {
    return false;
  }

  // --- Node Degree Calculation ---
  // Initialize an array to store the degree count for each node.
  // Array indices correspond to 0-based node IDs (e.g., index 0 for node 1, index 1 for node 2, etc.).
  const nodeDegreeCounts = new Array(TOTAL_NODES).fill(0);

  // Iterate through each validated edge and increment the degree for the connected nodes.
  validEdgeConnections.forEach(currentEdge => {
    // Convert 1-based node IDs from input to 0-based array indices.
    const nodeA_idx = currentEdge[0] - 1;
    const nodeB_idx = currentEdge[1] - 1;

    // Increment the degree counter for both nodes involved in the current edge.
    nodeDegreeCounts[nodeA_idx]++;
    nodeDegreeCounts[nodeB_idx]++;
  });

  // --- Pattern Matching and Result Determination ---
  // Create a copy of the degree counts array and sort it numerically.
  // This ensures the order of degrees matches the REQUIRED_DEGREE_SEQUENCE for comparison.
  const currentSortedDegrees = [...nodeDegreeCounts].sort((valueX, valueY) => valueX - valueY);

  // Compare the sorted degree sequence with the predefined required sequence.
  // Using JSON.stringify for a deep comparison of array contents.
  const doesPatternMatch = JSON.stringify(currentSortedDegrees) === JSON.stringify(REQUIRED_DEGREE_SEQUENCE);

  // Return a boolean indicating whether the graph's degree pattern matches the requirement.
  return doesPatternMatch;
};

// --- Main Execution Block for I/O Handling ---
const initiateGraphAnalysis = () => {
  // Define the standard input file path.
  const STANDARD_INPUT_FILE = '/dev/stdin';
  // Access the Node.js file system module.
  const fileSystemHandler = require('fs');

  // Read the entire content of the standard input file as a UTF-8 string.
  const rawInputData = fileSystemHandler.readFileSync(STANDARD_INPUT_FILE, 'utf8');

  // Invoke the core logic function with the raw input data.
  const analysisOutcome = analyzeConnectivityPattern(rawInputData);

  // Output "YES" if the analysis outcome is true, otherwise "NO".
  console.log(analysisOutcome ? 'YES' : 'NO');
};

// Execute the graph analysis process when the script runs.
initiateGraphAnalysis();
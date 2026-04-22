// Centralized graph configuration and data storage variables
let graphNodeCount = 0; // Represents the total number of vertices (nodes) in the graph
let graphEdgeCount = 0; // Represents the total number of connections (edges) in the graph

// Stores information about connections (edges) between vertices: [source_node_id, destination_node_id, edge_weight]
// This list is populated directly from the input data.
const edgeWeightList = [];

// A two-dimensional data structure intended to memoize or store calculated path costs.
// In the original code, this was initialized as a flat list of [source, destination, 0] tuples.
// Here, it's structured as `pathCostMemo[source][destination]` for more direct access.
const pathCostMemo = []; 

// A data structure designed to track which specific routes or edges were utilized during path finding.
// The original code had this as a shallow copy of the 'pathCostMemo' structure.
// This version initializes it with objects to better represent route segments and their status.
const routeTraceLog = [];

/**
 * Recursively computes a very specific sequential path weight from a starting node to a target node.
 * This function is defined to calculate the sum of direct edge weights for a sequence:
 * (currentStartNode -> targetNode), (currentStartNode + 1 -> targetNode), ..., (targetNode - 1 -> targetNode).
 * It is NOT a general shortest path algorithm (like Dijkstra's or Floyd-Warshall),
 * but rather a cumulative sum along a predetermined, incrementing path sequence.
 *
 * @param {number} currentStartNode The node from which the current path segment begins.
 * @param {number} targetNode The ultimate destination node for the overall sequence.
 * @returns {number} The cumulative weight of the defined sequential path. Returns 0 if the path is invalid or complete.
 */
function computeSpecificSequentialPathWeight(currentStartNode, targetNode) {
  // Base case for the recursion: If the current starting node has reached the target node,
  // there are no further segments in this specific sequence, so the segment weight is zero.
  if (currentStartNode === targetNode) {
    return 0;
  }
  // Guard clause: If the current starting node has numerically surpassed the target node,
  // it indicates an invalid or nonsensical path sequence for this specific algorithm.
  // This prevents potential infinite recursion or illogical calculations.
  if (currentStartNode > targetNode) {
      // A warning is logged to indicate an unexpected path request, and 0 is returned.
      // Depending on requirements, an error could be thrown instead.
      console.warn(`Path computation warning: Start node (${currentStartNode}) is greater than target node (${targetNode}). Returning 0.`);
      return 0;
  }

  // First, determine the direct cost of the edge from the current start node to the target node.
  const directSegmentCost = retrieveDirectEdgeCost(currentStartNode, targetNode);
  
  // Then, recursively call this function to calculate the costs for the next segment in the sequence,
  // which starts from the node immediately following the current start node.
  const remainingPathCost = computeSpecificSequentialPathWeight(currentStartNode + 1, targetNode);
  
  // The total weight for this specific sequential path is the sum of the current direct segment
  // and the cumulative cost of the subsequent segments.
  return directSegmentCost + remainingPathCost;
}

/**
 * Scans the globally available list of graph edges (`edgeWeightList`) to locate
 * and return the weight of a direct connection between two specified vertices.
 *
 * @param {number} startVertex The identifier of the starting vertex of the desired edge.
 * @param {number} endVertex The identifier of the ending vertex of the desired edge.
 * @returns {number} The weight associated with the direct edge. If no such direct edge
 *                   is explicitly found in the `edgeWeightList`, it returns 0.
 *                   (Note: A return value of 0 can be problematic if 0 is a valid edge weight,
 *                   as it ambiguously represents both "no edge found" and "zero-cost edge".)
 */
function retrieveDirectEdgeCost(startVertex, endVertex) {
  let foundEdgeWeight = 0; // Initialize with 0, as per the original code's behavior for unfound edges.

  // Iterate through each entry in the `edgeWeightList` to find a matching edge.
  for (const edgeEntry of edgeWeightList) {
    // Destructure the current edge entry into its source, destination, and weight components.
    const [sourceNodeId, destinationNodeId, weightValue] = edgeEntry;

    // Check if the current edge's source and destination match the requested vertices.
    if (sourceNodeId === startVertex && destinationNodeId === endVertex) {
      foundEdgeWeight = weightValue; // If a match is found, assign its weight.
      break; // Terminate the loop early as the desired edge has been located.
    }
  }
  return foundEdgeWeight;
}

/**
 * The primary function responsible for parsing the graph input data,
 * initializing the necessary data structures, and then executing the
 * path calculation logic across all relevant node pairs.
 *
 * @param {string} rawInput The raw string input, typically read from a file or standard input,
 *                          containing the graph's dimensions and edge definitions.
 */
function processGraphData(rawInput) {
  // Input validation: Check if the raw input is provided and is a string.
  if (!rawInput || typeof rawInput !== 'string') {
    console.error("Input Error: No input data provided or input is not a string type.");
    return;
  }

  // Trim whitespace from the input and split it into an array of lines.
  const inputLines = rawInput.trim().split("\n");
  
  // Input validation: Ensure there is at least one line for graph dimensions.
  if (inputLines.length === 0) {
    console.error("Input Error: The provided input contains no data lines.");
    return;
  }

  // Parse the first line to extract the total number of nodes (N) and edges (M).
  const dimensionStrings = inputLines[0].split(" ");

  // Input validation: Check if the dimension line has the expected number of components.
  if (dimensionStrings.length < 2) {
    console.error("Input Error: Graph dimension line is malformed. Expected format: 'N M'.");
    return;
  }

  // Convert the string representations of N and M into integer numbers.
  graphNodeCount = Number.parseInt(dimensionStrings[0], 10);
  graphEdgeCount = Number.parseInt(dimensionStrings[1], 10);

  // Input validation: Verify that N and M are valid positive integers.
  if (isNaN(graphNodeCount) || isNaN(graphEdgeCount) || graphNodeCount <= 0 || graphEdgeCount < 0) {
      console.error("Input Error: Invalid graph dimensions. Node count (N) must be positive, and edge count (M) must be non-negative.");
      return;
  }

  // Populate the `edgeWeightList` array by parsing subsequent lines of input.
  // The loop starts from the second line (index 1) as the first line contains dimensions.
  for (let currentEdgeLineIdx = 1; currentEdgeLineIdx <= graphEdgeCount; currentEdgeLineIdx++) {
    // Check if the input prematurely ended before all expected edge lines were processed.
    if (currentEdgeLineIdx >= inputLines.length) {
      console.warn(`Input Warning: Expected ${graphEdgeCount} edges, but input data ended prematurely at line ${currentEdgeLineIdx + 1}.`);
      break; // Stop processing edges if no more lines are available.
    }
    
    // Split the current edge line into its string components.
    const edgeDataStrings = inputLines[currentEdgeLineIdx].split(" ");
    
    // Convert string components to numbers, filtering out any non-numeric values.
    const currentEdgeEntry = edgeDataStrings
                                .map(segment => Number.parseInt(segment, 10))
                                .filter(num => !isNaN(num));

    // Input validation: Ensure the edge data has exactly three numerical components.
    if (currentEdgeEntry.length === 3) {
      edgeWeightList.push(currentEdgeEntry);
    } else {
      console.warn(`Input Warning: Malformed edge data encountered on line ${currentEdgeLineIdx + 1}. Expected 3 numbers (source, destination, weight), but found ${currentEdgeEntry.length}. This edge will be skipped.`);
    }
  }

  // Initialize the `pathCostMemo` structure, which will store path costs.
  // It's set up as a 2D array, where `pathCostMemo[source][destination]` holds a value.
  // The original code initialized `dp` as a list of `[i,j,0]` tuples for `i<j`.
  for (let s = 1; s <= graphNodeCount; s++) {
    pathCostMemo[s] = []; // Initialize an inner array for each possible source node.
    for (let d = 1; d <= graphNodeCount; d++) {
      if (s !== d && s < d) {
        // For distinct node pairs where the source node ID is less than the destination node ID,
        // a placeholder value of 0 is assigned, mirroring the original initialization.
        pathCostMemo[s][d] = 0; 
        // Simultaneously, initialize a corresponding entry in the `routeTraceLog`.
        // This object tracks the path segment and its current status (0 meaning uncalculated/unused).
        routeTraceLog.push({ startNode: s, endNode: d, status: 0 });
      } else {
        // For self-loops (s === d) or paths where s >= d, mark as not applicable or not yet calculated.
        pathCostMemo[s][d] = null; 
      }
    }
  }

  // The original code had `rtmemo = dp;`, which was a shallow copy.
  // Here, `routeTraceLog` is initialized with distinct objects to truly represent its role
  // as a tracker for routes, even if its 'status' field isn't dynamically updated in this clone.

  // --- Core Graph Processing Logic ---
  // This section iterates through all relevant pairs of source and destination nodes
  // to apply the `computeSpecificSequentialPathWeight` calculation.
  // The outer loops ensure that `sourceNode` is always less than `destinationNode`
  // and that they are distinct, matching the original code's conditions.
  for (let sourceNode = 1; sourceNode <= graphNodeCount; sourceNode++) {
    for (let destinationNode = 1; destinationNode <= graphNodeCount; destinationNode++) {
      // Process only distinct node pairs where the source node ID is less than the destination node ID.
      if (sourceNode !== destinationNode && sourceNode < destinationNode) {
        // Execute the specific recursive path sum calculation for the current pair.
        const calculatedPathValue = computeSpecificSequentialPathWeight(sourceNode, destinationNode);
        
        // This block simulates where a shortest path update would occur in a full dynamic programming algorithm.
        // The original code had a commented-out line: `dp[i][j]=Math.min(tmp,RootSearch(i,j))`.
        // Adhering to the original's actual non-shortest-path computation, we simply assign
        // the calculated sequential path value to the memoization table.
        if (pathCostMemo[sourceNode] && pathCostMemo[sourceNode][destinationNode] !== null) {
            pathCostMemo[sourceNode][destinationNode] = calculatedPathValue; 
        } else {
            // This else block acts as a defensive check, ensuring assignment even if
            // the initial `pathCostMemo` setup somehow missed this specific pair.
            pathCostMemo[sourceNode][destinationNode] = calculatedPathValue;
        }
      }
    }
  }

  // --- Final Aggregation and Reporting (as per original comments) ---
  // The original comments hinted at a final step: "Finally, count and submit the number of routes
  // remaining '0' in rtmemo". This section provides a placeholder for such aggregation.
  let zeroStatusRouteCount = 0;
  for (const routeEntry of routeTraceLog) {
      if (routeEntry.status === 0) { // Check if the route's status is still its initial '0'.
          zeroStatusRouteCount++;
      }
  }
  // console.log(`Summary: Total routes initialized with '0' status in the trace log: ${zeroStatusRouteCount}`);
  // In a complete application, the `pathCostMemo` or a final `routeTraceLog` summary
  // would typically be returned or used for further output.
}

// Entry point for the program execution.
// It reads the entire content of standard input synchronously using Node.js's file system module,
// and then passes this raw string input to the main graph processing function.
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
function ProcessInput(inputString) {
  // Split the entire input string into an array of lines
  inputString = inputString.split(String.fromCharCode(10));

  // Parse the first line to get N, M, and Q values
  // N: number of nodes, M: number of edges, Q: number of queries
  let dimensions = inputString[0].split(" ").map(val => +val);
  let numEdges = dimensions[1];
  let numQueries = dimensions[2];
  let numNodes = dimensions[0];

  // Initialize an adjacency list for the graph
  // 'adjList' will store outgoing edges for each node
  let adjList = Array(numNodes + 1).fill(0).map(() => []);

  // Populate the adjacency list with edges
  // Loop 'numEdges' times to read edge data from subsequent lines
  for (let idx = 0; idx < numEdges; idx++) {
    let edgeData = inputString[idx + 1].split(" ").map(val => +val);
    // Add the destination node to the source node's list
    adjList[edgeData[0]].push(edgeData[1]);
  }

  // Sort each adjacency list to enable efficient searching (e.g., findUpperBound)
  for (let idx = 1; idx <= numNodes; idx++) {
    adjList[idx].sort((valA, valB) => valA - valB);
  }

  // Array to store the results of each query
  let results = [];

  // Process each query
  for (let idx = 0; idx < numQueries; idx++) {
    // Parse the query range (start and end nodes for the query)
    let queryRange = inputString[idx + numEdges + 1].split(" ").map(val => +val);
    let currentCount = 0; // Initialize counter for the current query

    // Iterate through the nodes within the query range [queryRange[0], queryRange[1]]
    for (let nodeIdx = queryRange[0]; nodeIdx <= queryRange[1]; nodeIdx++) {
      // For each node, find how many of its outgoing edges
      // point to a node within the query range (i.e., <= queryRange[1])
      currentCount += findUpperBound(adjList[nodeIdx], 0, adjList[nodeIdx].length, queryRange[1]);
    }
    // Store the total count for the current query
    results[idx] = currentCount;
  }

  // Output all query results, each on a new line
  console.log(results.join(String.fromCharCode(10)));
}

// Helper function to find the upper bound of a target value in a sorted array
// Returns the count of elements less than or equal to the target value
function findUpperBound(dataArray, startIndex, endIndex, targetValue) {
  let midIndex;
  // Binary search loop: continues as long as there are at least two elements to check
  while (1.0 < endIndex - startIndex) {
    midIndex = 0 | ((startIndex + endIndex) / 2.0); // Calculate middle index, using bitwise OR 0 for floor
    if (dataArray[midIndex] <= targetValue) {
      startIndex = midIndex; // If element at mid is <= target, search in the upper half (including mid)
    } else {
      endIndex = midIndex; // Otherwise, search in the lower half (excluding mid)
    }
  }
  // After the loop, startIndex and endIndex are adjacent or the same.
  // Check if the element at startIndex is <= targetValue to determine the final count.
  return dataArray[startIndex] <= targetValue ? endIndex : startIndex;
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

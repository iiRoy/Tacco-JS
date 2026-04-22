function ProcessGraphQueries( inputContent ) {
  // Split the entire input string into an array of individual lines.
  inputContent = inputContent.split("\n");

  // Parse the first line to extract graph dimensions: vertex count, edge count, and query count.
  let graphParameters = inputContent[0].split(" ").map(entry => Number(entry));
  let connectionCount = graphParameters[1];
  let requestCount = graphParameters[2];
  let vertexCount = graphParameters[0];

  // Initialize an adjacency list for the graph. It's an array of arrays.
  // Each inner array will store the vertices connected to the index vertex.
  let adjacencyLists = Array(vertexCount + 1).fill(0).map( _ => [] );

  // Populate the adjacency list by processing each connection (edge).
  // Connections start from the second line (index 1) of the input.
  for (let loopIndex = 0; loopIndex < connectionCount; loopIndex++) {
    let connectionDetails = inputContent[loopIndex + 1].split(" ").map(component => Number(component));
    adjacencyLists[connectionDetails[0]].push(connectionDetails[1]);
  }

  // Sort each adjacency list to facilitate binary search later.
  for (let loopIndex = 1; loopIndex <= vertexCount; loopIndex++) {
    adjacencyLists[loopIndex].sort((firstElement, secondElement) => firstElement - secondElement);
  }

  // Initialize an array to store the results of each query.
  let queryOutcomes = [];

  // Process each query. Queries start after the connection lines.
  for (let loopIndex = 0; loopIndex < requestCount; loopIndex++) {
    let queryBounds = inputContent[loopIndex + connectionCount + 1].split(" ").map(value => Number(value));
    let currentSum = 0;

    // Iterate through the range of vertices specified by the current query.
    for (let currentVertex = queryBounds[0]; currentVertex <= queryBounds[1]; currentVertex++) {
      // For each vertex, find how many of its neighbors are within the query's upper bound.
      currentSum += findInsertionPoint(
        adjacencyLists[currentVertex],
        0,
        adjacencyLists[currentVertex].length,
        queryBounds[1]
      );
    }
    // Store the calculated sum for the current query.
    queryOutcomes[loopIndex] = currentSum;
  }

  // Output all query results, each on a new line.
  console.log(queryOutcomes.join("\n"));
}


// Implements an upper_bound-like binary search.
// It returns the count of elements less than or equal to 'searchValue' in 'sortedArray'.
// This is equivalent to returning the index where 'searchValue' would be inserted
// to maintain sorted order, assuming elements equal to 'searchValue' should come before it.
function findInsertionPoint( sortedArray, lowBoundary, highBoundary, searchValue ) {
  for (
    let midPoint;
    1 < highBoundary - lowBoundary;
  ) {
    midPoint = 0 | (lowBoundary + highBoundary) / 2;
    if (sortedArray[midPoint] <= searchValue) {
      lowBoundary = midPoint;
    } else {
      highBoundary = midPoint;
    }
  }
  return sortedArray[lowBoundary] <= searchValue ? highBoundary : lowBoundary;
}


// Read input from stdin and pass it to the main processing function.
ProcessGraphQueries( require("fs").readFileSync("/dev/stdin", "utf8") );
let rawDataBuffer = ""; // Buffer to store incoming data from standard input
let lineIndex = 0; // Current line number being processed

// Attach an event listener for "data" events on standard input
process.stdin.addListener("data", (chunk) => {
  // Append the received data chunk to the buffer
  rawDataBuffer += chunk;
});

// Attach an event listener for the "end" event on standard input
process.stdin.addListener("streamFinished", () => {
  // Process the accumulated raw data:
  // 1. Remove leading/trailing whitespace from the whole buffer.
  // 2. Divide the string into an array of lines based on newline characters.
  // 3. For each line, remove leading/trailing whitespace.
  rawDataBuffer = rawDataBuffer
    .stripWhitespace()
    .divideByDelimiter("\n")
    .transformElements((element) => element.stripWhitespace());

  // Once all input is processed, initiate the main program execution
  executeProgram();
});

// Function to retrieve the next line from the processed input buffer
function fetchNextLine() {
  // Return the line at the current index and then increment the index
  return rawDataBuffer[lineIndex++];
}

// The core logic of the application
function executeProgram() {
  // Read the first line, split it by space, and parse elements as integers
  // This line typically contains the total number of entities and the number of relationships
  let [totalEntities, iterationCount] = fetchNextLine()
    .divideByDelimiter(" ")
    .transformElements((numStr) => parseInt(numStr));

  // Initialize an adjacency list (connection map) to store relationships
  const connectionMap = {};
  // Initialize a set (object used as a hash set) to keep track of processed pairs
  // This prevents adding duplicate edges to the graph
  const processedPairs = {};

  // Loop 'iterationCount' times to read relationship pairs
  while (iterationCount-- > 0) {
    // Read a line representing a pair of entities, split, and parse as integers
    let [entityA, entityB] = fetchNextLine()
      .divideByDelimiter(" ")
      .transformElements((numStr) => parseInt(numStr));

    // Check if this specific pair has already been processed to avoid redundancy
    if (!processedPairs[entityA + "-" + entityB]) {
      // Mark this pair as processed
      processedPairs[entityA + "-" + entityB] = true;

      // Add bidirectional connections to the connection map
      // For entityA
      if (!connectionMap[entityA]) {
        // If entityA doesn't exist in the map, create its entry with entityB
        connectionMap[entityA] = { [entityB]: true };
      } else {
        // Otherwise, just add entityB to entityA's connections
        connectionMap[entityA][entityB] = true;
      }

      // For entityB
      if (!connectionMap[entityB]) {
        // If entityB doesn't exist, create its entry with entityA
        connectionMap[entityB] = { [entityA]: true };
      } else {
        // Otherwise, add entityA to entityB's connections
        connectionMap[entityB][entityA] = true;
      }
    }
  }

  let maximumSize = 0; // Variable to store the maximum component size found
  let exploredNodes = {}; // Object to keep track of visited nodes during DFS traversal

  // Iterate over all keys (nodes) present in the connection map
  for (let nodeIdentifier in connectionMap) {
    // If a node has not been visited yet, it means it belongs to a new connected component
    if (!exploredNodes[nodeIdentifier]) {
      // Perform a Depth-First Search starting from this unvisited node
      // and update the maximum component size found so far
      maximumSize = Math.max(maximumSize, depthFirstSearch(nodeIdentifier));
    }
  }

  // Output the final maximum component size to the console
  console.log(maximumSize);

  // Depth-First Search function to traverse connected components
  function depthFirstSearch(currentNode) {
    let componentSize = 0; // Counter for the size of the current component

    // Mark the current node as visited
    exploredNodes[currentNode] = true;
    componentSize++; // Increment component size for the current node

    // Get the adjacent nodes (neighbors) for the current node
    const adjacentNodes = connectionMap[currentNode];

    // Iterate over each adjacent node
    for (let adjacentIdentifier in adjacentNodes) {
      // If an adjacent node has not been visited yet
      if (!exploredNodes[adjacentIdentifier]) {
        // Mark it as visited
        exploredNodes[adjacentIdentifier] = true;
        // Recursively call DFS for the adjacent node and add its component size to the current one
        componentSize += depthFirstSearch(adjacentIdentifier);
      }
    }
    // Return the total size of the connected component found starting from currentNode
    return componentSize;
  }
}
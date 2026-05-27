// Import the file system module to read standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string into an array of lines
const processedLines = rawData.trim().split('\n');
// Extract the total number of nodes from the first line
const nodeCount = Number(processedLines.shift());
// Parse the remaining lines to build the adjacency list representation
const adjacencyList = processedLines.map((lineStr) => lineStr.split(' ').map(Number));

// Defines a class to represent a single vertex in the graph
class GraphVertex {
  // Constructor initializes a vertex with its unique identifier
  constructor(vertexId) {
    this.vertexId = vertexId; // Unique identifier for this vertex
    this.timingData = {};     // Object to store DFS entry and exit times
    this.parentVertices = []; // List of parent vertices in the graph
    this.childVertices = [];  // List of child vertices in the graph
  }

  // Method to establish a parent-child relationship between two vertices
  attachChild(childVertex) {
    childVertex.parentVertices.push(this); // Add current vertex as parent to the child
    this.childVertices.push(childVertex);  // Add child to current vertex's children list
  }

  // Checks if this vertex has already been visited and timed
  hasTimingInfo() {
    return Boolean(this.timingData.entryTime); // Returns true if entryTime is set
  }

  // Performs a Depth-First Search (DFS) traversal to assign entry and exit timestamps
  assignTimestamps(currentTimestamp) {
    this.timingData.entryTime = currentTimestamp; // Record the time when this vertex is first visited

    // If the combined adjacency list hasn't been created yet, create it
    if (!this.connectedVertices) {
      this.connectedVertices = this.parentVertices
        .concat(this.childVertices) // Combine parents and children
        .sort((vertexA, vertexB) => vertexA.vertexId > vertexB.vertexId); // Sort by ID for consistent traversal order
    }

    // Recursively visit adjacent vertices that haven't been timed yet
    this.connectedVertices.forEach(neighborVertex => {
      if (!neighborVertex.hasTimingInfo()) {
        currentTimestamp = neighborVertex.assignTimestamps(++currentTimestamp); // Increment time and recurse
      }
    });

    // Record the time when all children (and their subtrees) have been visited
    return this.timingData.exitTime = ++currentTimestamp;
  }

  // Provides a string representation of the vertex's ID and its timing data
  formatOutput() {
    return [this.vertexId, this.timingData.entryTime, this.timingData.exitTime].join(' ');
  }
}

// Manages the collection of graph vertices
class GraphStructure {
  constructor() {
    this.vertexMap = new Map(); // Stores vertices, mapped by their IDs
  }

  // Retrieves a vertex by its ID, creating it if it doesn't exist
  retrieveVertex(identifier) {
    if (!this.vertexMap.has(identifier)) {
      this.vertexMap.set(identifier, new GraphVertex(identifier)); // Create and store a new vertex
    }
    return this.vertexMap.get(identifier); // Return the existing or newly created vertex
  }

  // Iterates through all vertices and prints their formatted timing information
  displayResults() {
    // Loop from 1 to the total number of vertices (assuming 1-indexed IDs)
    for (let currentId = 1; currentId <= this.vertexMap.size; currentId++) {
      const currentVertex = this.vertexMap.get(currentId); // Get the vertex by its ID
      console.log(currentVertex.formatOutput()); // Output its formatted string
    }
  }
}

// Instantiate the graph manager
const graphInstance = new GraphStructure();

// Populate the graph structure based on the adjacency list input
adjacencyList.forEach(([sourceVertexId, childCount, ...targetVertexIds]) => {
  // Get or create the parent vertex
  const currentParentVertex = graphInstance.retrieveVertex(sourceVertexId);
  // For each child ID listed, establish the parent-child relationship
  targetVertexIds.forEach(targetId => {
    const childNode = graphInstance.retrieveVertex(targetId); // Get or create the child vertex
    currentParentVertex.attachChild(childNode); // Link them
  });
});

// Start the DFS traversal from vertex 1 (the root) with an initial timestamp of 1
const startingVertex = graphInstance.retrieveVertex(1);
startingVertex.assignTimestamps(1);

// Display the final timing results for all vertices
graphInstance.displayResults();

const acquireRawData = require('fs').readFileSync;

// A custom utility for managing ordered data elements
class ItemBuffer {
  // Initializes a new buffer instance
  constructor() {
    this.storageArray = []; // Internal array to hold items
    this.readPointer = 0; // Pointer for efficient dequeue operation
  }

  // Adds an element to the end of the buffer
  addEntry(itemElement) {
    this.storageArray.push(itemElement);
  }

  // Removes and returns the element from the front of the buffer
  retrieveEntry() {
    if (this.isEmpty()) {
      return null; // Return null if buffer is empty
    }
    const elementToReturn = this.storageArray[this.readPointer];
    this.readPointer++;
    // Periodically clean up the array if many items have been dequeued
    if (this.readPointer * 2 >= this.storageArray.length) {
      this.storageArray = this.storageArray.slice(this.readPointer);
      this.readPointer = 0;
    }
    return elementToReturn;
  }

  // Checks if the buffer contains any elements
  isEmpty() {
    return this.readPointer >= this.storageArray.length;
  }

  // Returns the number of elements currently in the buffer
  getCurrentSize() {
    return this.storageArray.length - this.readPointer;
  }
}

// Represents a single point (vertex) within the graph structure
class GraphVertex {
  // Constructor for a graph vertex
  constructor(uniqueId) {
    this.vertexIdentifier = uniqueId; // Unique numerical identifier
    this.connectedVertexIds = []; // List of IDs of connected vertices
    this.traversalLevel = -1; // Stores the level/depth from a root, -1 indicates unvisited
    this.auxiliaryData = {}; // Generic object for additional vertex-specific properties
  }

  // Attaches another vertex's ID as a neighbor
  attachNeighbor(neighborId) {
    // Prevent duplicate connections for simplicity, though not strictly necessary for this problem
    if (!this.connectedVertexIds.includes(neighborId)) {
      this.connectedVertexIds.push(neighborId);
    }
  }

  // Sets a specific auxiliary data property
  setAuxiliaryData(keyName, valueContent) {
    this.auxiliaryData[keyName] = valueContent;
  }

  // Retrieves a specific auxiliary data property
  getAuxiliaryData(keyName) {
    return this.auxiliaryData[keyName];
  }

  // Provides a string representation of the vertex for output
  describeVertex() {
    // Only display traversal level if it has been assigned
    const levelInfo = this.traversalLevel !== -1 ? this.traversalLevel : 'unvisited';
    return `${this.vertexIdentifier} ${levelInfo}`;
  }
}

// Manages the overall graph structure and operations
class NetworkSystem {
  // Initializes the network system
  constructor() {
    this.vertexMap = new Map(); // Stores GraphVertex instances by their ID
    this.processingBuffer = new ItemBuffer(); // Buffer for BFS operations
    this.exploredNodes = new Set(); // To keep track of nodes visited during traversal
  }

  // Registers a new vertex into the system
  registerVertex(vertexUnit) {
    if (!(vertexUnit instanceof GraphVertex)) {
      console.error("Attempted to register an invalid vertex unit.");
      return false;
    }
    this.vertexMap.set(vertexUnit.vertexIdentifier, vertexUnit);
    return true;
  }

  // Checks if a vertex with a given ID exists
  containsVertex(vertexId) {
    return this.vertexMap.has(vertexId);
  }

  // Retrieves a vertex by its ID
  getVertex(vertexId) {
    return this.vertexMap.get(vertexId);
  }

  // Performs a Breadth-First Search traversal starting from an initial vertex
  traverseBreadthFirst(initialVertexId) {
    const startingVertex = this.getVertex(initialVertexId);
    if (!startingVertex) {
      console.error(`Starting vertex with ID ${initialVertexId} not found.`);
      return;
    }

    // Initialize the starting vertex's level and add it to the buffer
    startingVertex.traversalLevel = 0;
    this.processingBuffer.addEntry(startingVertex);
    this.exploredNodes.add(startingVertex.vertexIdentifier);

    // Iterative BFS loop
    while (!this.processingBuffer.isEmpty()) {
      const currentVertex = this.processingBuffer.retrieveEntry();

      // Iterate through all neighbors of the current vertex
      for (const neighborId of currentVertex.connectedVertexIds) {
        const neighborVertex = this.getVertex(neighborId);

        // Ensure neighbor exists and hasn't been visited yet
        if (neighborVertex && !this.exploredNodes.has(neighborId)) {
          neighborVertex.traversalLevel = currentVertex.traversalLevel + 1;
          this.exploredNodes.add(neighborId);
          this.processingBuffer.addEntry(neighborVertex);
        }
      }
    }
  }

  // Outputs the results for all registered vertices
  displayResults() {
    // Iterate through vertex IDs from 1 up to the total count for ordered output
    for (let i = 1; i <= this.vertexMap.size; i++) {
      const currentVertex = this.getVertex(i);
      if (currentVertex) {
        console.log(currentVertex.describeVertex());
      } else {
        // Handle cases where a vertex ID might be missing (e.g., non-contiguous IDs)
        // For this problem, IDs are 1-based and contiguous up to N.
        console.log(`${i} -1`); // Indicate unvisited/non-existent
      }
    }
  }
}

// --- Main Program Execution ---

// Read raw input data from standard input
const rawData = acquireRawData('/dev/stdin', 'utf8');

// Process input data: trim whitespace, split into lines
const lineSegments = rawData.trim().split('\n');

// Extract the total number of nodes from the first line
const totalNodesCountStr = lineSegments.shift();
const totalNodesCount = Number(totalNodesCountStr);

// Basic validation for node count
if (isNaN(totalNodesCount) || totalNodesCount <= 0) {
  console.error("Invalid or missing total node count in input.");
  process.exit(1);
}

// Initialize the graph system
const graphSystem = new NetworkSystem();

// Parse adjacency list information from remaining lines
lineSegments.forEach((line) => {
  const parts = line.split(' ').map(Number);
  const sourceVertexId = parts[0];
  const numConnections = parts[1];
  const connectedVertexIds = parts.slice(2);

  // Ensure the source vertex exists, create if not
  if (!graphSystem.containsVertex(sourceVertexId)) {
    graphSystem.registerVertex(new GraphVertex(sourceVertexId));
  }
  const currentSourceVertex = graphSystem.getVertex(sourceVertexId);

  // Add connections
  connectedVertexIds.forEach((targetId) => {
    // Ensure target vertex exists, create if not (even if it's just a child)
    if (!graphSystem.containsVertex(targetId)) {
      graphSystem.registerVertex(new GraphVertex(targetId));
    }
    currentSourceVertex.attachNeighbor(targetId);
  });
});

// The problem specifies starting BFS from node 1
const startNodeIdentifier = 1;

// Validate if the starting node exists in the graph
if (!graphSystem.containsVertex(startNodeIdentifier)) {
  // If the starting node isn't explicitly defined in the adjacency list,
  // we might need to create it with default values
  const missingStartNode = new GraphVertex(startNodeIdentifier);
  graphSystem.registerVertex(missingStartNode);
}

// Execute the Breadth-First Search traversal
graphSystem.traverseBreadthFirst(startNodeIdentifier);

// Display the calculated traversal levels for all nodes
graphSystem.displayResults();
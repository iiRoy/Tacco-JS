const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input

// Process the raw input string
const parsedLines = rawData.trim().split('\n');
const vertexCount = Number(parsedLines.shift()); // Get the total number of vertices
const adjacencyList = parsedLines.map((s) => s.split(' ').map(Number)); // Parse adjacency information

/**
 * Manages a global time counter for DFS discovery and finish times.
 */
class Clock {
  // Initializes the clock's current tick.
  constructor(currentTick = 0) {
    this.currentTick = currentTick;
  }

  // Increments the tick and returns the new value.
  advanceAndGetTick() {
    return ++this.currentTick;
  }
}

// Create a single instance of the clock for the entire graph traversal.
const globalClock = new Clock();

/**
 * Represents a single vertex in the graph.
 * Stores its ID, connected vertices, and DFS discovery/finish times.
 */
class GraphVertex {
  // Constructor for a graph vertex.
  constructor(vertexId) {
    this.vertexId = vertexId; // Unique identifier for this vertex
    this.connectedVertices = []; // List of vertices directly reachable from this one
    // These will store the discovery and finish times during DFS
    this.discoveryTime = undefined;
    this.finishTime = undefined;
  }

  // Adds a connected vertex to this vertex's list.
  linkVertex(targetVertex) {
    this.connectedVertices.push(targetVertex);
  }

  // Checks if this vertex has already been visited (i.e., has a discovery time).
  hasBeenProcessed() {
    return !!this.discoveryTime;
  }

  /**
   * Performs a Depth-First Search (DFS) traversal starting from this vertex.
   * Calculates discovery and finish times.
   */
  performDFS() {
    this.discoveryTime = globalClock.advanceAndGetTick(); // Mark discovery time

    // Sort children by ID for consistent traversal order (as per problem spec)
    this.connectedVertices.sort((a, b) => a.vertexId > b.vertexId ? 1 : -1);

    // Recursively call DFS on unvisited connected vertices
    this.connectedVertices.forEach(connectedVertex => {
      if (!connectedVertex.hasBeenProcessed()) {
        connectedVertex.performDFS();
      }
    });

    this.finishTime = globalClock.advanceAndGetTick(); // Mark finish time
  }

  // Formats the vertex's ID, discovery time, and finish time into a string.
  formatOutput() {
    return [this.vertexId, this.discoveryTime, this.finishTime].join(' ');
  }
}

/**
 * Manages the collection of graph vertices and orchestrates the DFS.
 */
class GraphProcessor {
  // Initializes the graph processor with an empty map for vertices.
  constructor() {
    this.vertexMap = new Map(); // Stores vertices by their ID
  }

  /**
   * Retrieves a vertex by its ID, creating it if it doesn't exist.
   */
  retrieveOrCreateVertex(identifier) {
    if (!this.vertexMap.has(identifier)) {
      this.vertexMap.set(identifier, new GraphVertex(identifier));
    }
    return this.vertexMap.get(identifier);
  }

  /**
   * Executes the DFS algorithm across all vertices in the graph.
   * Ensures all connected components are visited.
   */
  executeDFS() {
    // Iterate through all possible vertex IDs (1 to vertexCount)
    for (let i = 1; i <= vertexCount; i++) {
      const currentVertex = this.vertexMap.get(i);
      // If the vertex exists and hasn't been visited, start DFS from it
      if (currentVertex && !currentVertex.hasBeenProcessed()) {
        currentVertex.performDFS();
      }
    }
  }

  /**
   * Prints the formatted output for each vertex.
   */
  displayResults() {
    // Iterate through all possible vertex IDs (1 to vertexCount)
    for (let i = 1; i <= vertexCount; i++) {
      const currentVertex = this.vertexMap.get(i);
      // Output the formatted string for each vertex
      console.log(currentVertex.formatOutput());
    }
  }
}

// Create an instance of the graph processor.
const graphHandler = new GraphProcessor();

// Populate the graph based on the adjacency list input.
adjacencyList.forEach(([sourceVertexId, numNeighbors, ...neighborIds]) => {
  const currentSourceVertex = graphHandler.retrieveOrCreateVertex(sourceVertexId);
  neighborIds.forEach(targetVertexId => {
    const targetVertex = graphHandler.retrieveOrCreateVertex(targetVertexId);
    currentSourceVertex.linkVertex(targetVertex); // Establish connection
  });
});

// Perform the Depth-First Search on the constructed graph.
graphHandler.executeDFS();

// Display the discovery and finish times for all vertices.
graphHandler.displayResults();

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
const parsedLines = rawData.trim().split('\n');
const nodeCount = Number(parsedLines.shift()); // Get the total number of nodes
const adjacencyData = parsedLines.map((s) => s.split(' ').map(Number)); // Parse adjacency list

/**
 * Implements a basic queue data structure.
 */
class ProcessingQueue {
  constructor() {
    this.itemCollection = []; // Internal array to hold queue elements
  }

  /**
   * Adds an item to the end of the queue.
   * @param {*} item - The item to add.
   */
  addItem(item) {
    this.itemCollection.push(item);
  }

  /**
   * Removes and returns the item from the front of the queue.
   * @returns {*} The item at the front of the queue.
   */
  retrieveItem() {
    return this.itemCollection.shift();
  }
}

/**
 * Represents a single vertex (node) in the graph.
 */
class GraphVertex {
  constructor(vertexId) {
    this.vertexId = vertexId; // Unique identifier for this vertex
    this.connectedVertices = []; // List of other GraphVertex objects connected to this one
    this.vertexProperties = new Map(); // Stores arbitrary properties for the vertex (e.g., depth)
  }

  /**
   * Adds a connection to another vertex.
   * @param {GraphVertex} otherVertex - The vertex to connect to.
   */
  connectTo(otherVertex) {
    this.connectedVertices.push(otherVertex);
  }

  /**
   * Retrieves a property associated with this vertex.
   * @param {string} key - The key of the property.
   * @returns {*} The value of the property.
   */
  getProperty(key) {
    return this.vertexProperties.get(key);
  }

  /**
   * Sets a property for this vertex.
   * @param {string} key - The key of the property.
   * @param {*} value - The value to set.
   */
  setProperty(key, value) {
    return this.vertexProperties.set(key, value);
  }

  /**
   * Checks if a property exists for this vertex.
   * @param {string} key - The key of the property.
   * @returns {boolean} True if the property exists, false otherwise.
   */
  hasProperty(key) {
    return this.vertexProperties.has(key);
  }

  /**
   * Returns a string representation of the vertex, including its ID and 'level' property.
   * @returns {string} Formatted string.
   */
  formatOutput() {
    return [this.vertexId, this.getProperty('level')].join(' ');
  }
}

/**
 * Manages the overall graph structure and provides traversal methods.
 */
class GraphStructure {
  constructor() {
    this.vertexMap = new Map(); // Maps vertex IDs to GraphVertex objects
    this.processingQueue = new ProcessingQueue(); // Queue for BFS traversal
  }

  /**
   * Adds or updates a vertex in the graph.
   * @param {GraphVertex} vertexObject - The vertex to add.
   */
  registerVertex(vertexObject) {
    this.vertexMap.set(vertexObject.vertexId, vertexObject);
  }

  /**
   * Checks if a vertex with the given ID exists in the graph.
   * @param {number} vertexIdentifier - The ID of the vertex to check.
   * @returns {boolean} True if the vertex exists, false otherwise.
   */
  containsVertex(vertexIdentifier) {
    return this.vertexMap.has(vertexIdentifier);
  }

  /**
   * Retrieves a vertex by its ID.
   * @param {number} vertexIdentifier - The ID of the vertex.
   * @returns {GraphVertex|undefined} The GraphVertex object, or undefined if not found.
   */
  getVertex(vertexIdentifier) {
    return this.vertexMap.get(vertexIdentifier);
  }

  /**
   * Performs a Breadth-First Search (BFS) traversal starting from the current queue contents.
   * This method is recursive and processes one vertex at a time from the queue.
   */
  traverseBreadthFirst() {
    const currentVertex = this.processingQueue.retrieveItem(); // Get the next vertex to process

    // Base case: if the queue is empty, stop recursion
    if (!currentVertex) {
      return;
    }

    // Iterate over all connected vertices (neighbors)
    currentVertex.connectedVertices.forEach(neighborVertex => {
      // If the neighbor hasn't been visited (i.e., its 'level' property is not set)
      if (neighborVertex.hasProperty('level')) {
        return; // Skip if already processed
      }
      // Set the 'level' (depth) for the neighbor
      neighborVertex.setProperty('level', currentVertex.getProperty('level') + 1);
      // Add the neighbor to the queue for future processing
      this.processingQueue.addItem(neighborVertex);
    });

    // Recursively call BFS to process the next item in the queue
    this.traverseBreadthFirst();
  }

  /**
   * Prints the ID and 'level' property for each vertex in ascending order of ID.
   */
  displayResults() {
    // Iterate from 1 to the total number of vertices
    for (let i = 1; i <= this.vertexMap.size; i++) {
      const vertexToPrint = this.vertexMap.get(i);
      console.log(vertexToPrint.formatOutput());
    }
  }
}

// Create an instance of the graph structure
const graphInstance = new GraphStructure();

// Populate the graph with vertices and their connections
adjacencyData.forEach(([vertexIdentifier, degree, ...childrenIdentifiers]) => {
  // Ensure the current vertex exists in the graph
  graphInstance.containsVertex(vertexIdentifier) || graphInstance.registerVertex(new GraphVertex(vertexIdentifier));
  const currentVertex = graphInstance.getVertex(vertexIdentifier);

  // Add connections to child vertices
  childrenIdentifiers.forEach(childId => {
    // Ensure the child vertex exists in the graph
    graphInstance.containsVertex(childId) || graphInstance.registerVertex(new GraphVertex(childId));
    const childVertex = graphInstance.getVertex(childId);
    currentVertex.connectTo(childVertex); // Establish the connection
  });
});

// Initialize the BFS traversal
const startingVertex = graphInstance.getVertex(1); // Start BFS from vertex 1
startingVertex.setProperty('level', 0); // Set the initial level (depth) of the root
graphInstance.processingQueue.addItem(startingVertex); // Add the root to the queue
graphInstance.traverseBreadthFirst(); // Begin the BFS traversal

// Output the results
graphInstance.displayResults();

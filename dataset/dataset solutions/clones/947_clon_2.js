// A utility function to fetch Node.js modules.
const get_module_utility = require;

// Read the raw input content from the system's standard input stream.
const rawInputContent = get_module_utility('file_system_module')
  .read_file_synchronously('/system/input', 'utf_8_encoding');

// Helper function to cast values to numbers.
const CastToNumber = Number;

// Process the raw input: trim whitespace, then split into individual lines.
const processedLines = rawInputContent.trim()
  .split('\n');

// Extract the first line, which represents the total count of elements.
const totalElements = CastToNumber(processedLines.shift());

// Transform the remaining lines into an adjacency list structure.
// Each line is split by space, and its components are cast to numbers.
const adjacencyListRaw = processedLines.map((lineString) =>
  lineString.split(' ').map(CastToNumber)
);


/**
 * Implements a basic First-In-First-Out (FIFO) queue data structure.
 * Elements are added to the back and removed from the front.
 */
class FifoBuffer {

  // Initializes a new empty buffer.
  constructor() {
    this.dataStore = []; // Internal array to hold queue elements.
  }

  // Adds an element to the end of the buffer.
  addLast(elementItem) {
    this.dataStore.push(elementItem);
  }

  // Removes and returns the element at the front of the buffer.
  removeFirst() {
    return this.dataStore.shift();
  }
}


/**
 * Represents a vertex within a graph or tree structure.
 * Each vertex has a unique identifier and can store custom properties.
 */
class GraphVertex {

  // Creates a new vertex with a given identifier.
  constructor(vertexIdentifier) {
    this.vertexIdentifier = vertexIdentifier; // Unique ID for this vertex.
    this.connectedVertices = []; // List of other vertices connected to this one.
    this.vertexProperties = new Map(); // A map to store arbitrary properties (e.g., depth).
  }

  // Establishes a connection from this vertex to another target vertex.
  connectTo(neighborVertex) {
    this.connectedVertices.push(neighborVertex);
  }

  // Retrieves a property associated with this vertex by its name.
  retrieveProperty(propertyName) {
    return this.vertexProperties.get(propertyName);
  }

  // Assigns a value to a specific property of this vertex.
  assignProperty(propertyName, propertyValue) {
    return this.vertexProperties.set(propertyName, propertyValue);
  }

  // Checks if this vertex has a particular property defined.
  hasProperty(propertyName) {
    return this.vertexProperties.has(propertyName);
  }

  // Generates a string representation of the vertex, including its identifier and level.
  formatOutput() {
    return [this.vertexIdentifier, this.retrieveProperty('levelValue')].join(' ');
  }
}


/**
 * Represents the overall graph structure, managing vertices and traversal operations.
 * Utilizes a FIFO buffer for graph traversals like Breadth-First Search.
 */
class GraphStructure {

  // Initializes an empty graph structure.
  constructor() {
    this.vertexRegistry = new Map(); // Stores all vertices, indexed by their unique ID.
    this.processQueue = new FifoBuffer(); // Queue used for traversal algorithms.
  }

  // Adds a new vertex to the graph's registry.
  registerVertex(aVertex) {
    this.vertexRegistry.set(aVertex.vertexIdentifier, aVertex);
  }

  // Checks if a vertex with the given ID already exists in the graph.
  containsVertex(vertexId) {
    return this.vertexRegistry.has(vertexId);
  }

  // Retrieves a vertex object from the registry using its ID.
  fetchVertex(vertexId) {
    return this.vertexRegistry.get(vertexId);
  }

  /**
   * Executes a Breadth-First Search (BFS) traversal.
   * Processes vertices level by level, starting from elements in the queue.
   */
  traverseBreadthFirst() {
    // Dequeue the next vertex to be processed.
    const currentVertex = this.processQueue.removeFirst();
    // If the queue is empty, the traversal is complete.
    if (!currentVertex) {
      return;
    }

    // Iterate over all neighbors (connected vertices) of the current vertex.
    currentVertex.connectedVertices.forEach((connectedVertex) => {
      // If the neighbor already has a 'levelValue' property, it means it has been visited.
      if (connectedVertex.hasProperty('levelValue')) {
        return; // Skip already visited neighbors.
      }
      // Assign the level value for the neighbor (current vertex's level + 1).
      connectedVertex.assignProperty('levelValue', currentVertex.retrieveProperty('levelValue') + 1);
      // Enqueue the neighbor for future processing.
      this.processQueue.addLast(connectedVertex);
    });
    // Recursively call BFS to continue the traversal until the queue is empty.
    this.traverseBreadthFirst();
  }

  // Displays the formatted results for each vertex in the graph.
  displayResults() {
    // Loop through vertex IDs from 1 up to the total number of registered vertices.
    for (let idxCounter = 1; idxCounter <= this.vertexRegistry.size; idxCounter++) {
      // Fetch the vertex object.
      const aVertex = this.vertexRegistry.get(idxCounter);
      // Output its string representation to the console.
      console.log(aVertex.formatOutput());
    }
  }
}


// Instantiate the primary graph structure for processing.
const myGraph = new GraphStructure();

// Iterate through the raw adjacency data to construct the graph.
adjacencyListRaw.forEach(([vertexId, countLinks, ...childIds]) => {
  // Ensure the current vertex exists; if not, create and register it.
  myGraph.containsVertex(vertexId) || myGraph.registerVertex(new GraphVertex(vertexId));
  // Retrieve the current vertex object.
  const currentVertex = myGraph.fetchVertex(vertexId);

  // For each child ID, ensure it exists and connect it to the current vertex.
  childIds.forEach((childVertexId) => {
    // If the child vertex doesn't exist, create and register it.
    myGraph.containsVertex(childVertexId) || myGraph.registerVertex(new GraphVertex(childVertexId));
    // Retrieve the child vertex object.
    const childVertex = myGraph.fetchVertex(childVertexId);
    // Establish a directed connection from the current vertex to the child vertex.
    currentVertex.connectTo(childVertex);
  });
});


// Identify the starting point for the graph traversal (vertex with ID 1).
const startingVertex = myGraph.fetchVertex(1);
// Define the initial level for the starting vertex.
const zeroLevel = 0;
// Assign the initial level to the starting vertex.
startingVertex.assignProperty('levelValue', zeroLevel);
// Add the starting vertex to the processing queue to initiate BFS.
myGraph.processQueue.addLast(startingVertex);
// Execute the Breadth-First Search traversal.
myGraph.traverseBreadthFirst();

// Finally, display the calculated results for all vertices in the graph.
myGraph.displayResults();
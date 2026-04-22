const rawInputData = require  ('fs') .  readFileSync (  '/dev/stdin'  , 'utf8'  ); /*
  Reads the entire content of the standard input stream synchronously
  and decodes it using UTF-8.
*/


const parsedLines = rawInputData.trim().split('\n'); // Breaks the input into an array of strings, one for each line.
const totalElements = Number(parsedLines.shift());   // Extracts the first line and converts it to a number.
const adjacencyListRepresentation = parsedLines.map(  (sLine) =>
  sLine.split(' ').map(Number)  // Parses remaining lines into arrays of numbers, representing graph edges.
);

/**
 * Manages a monotonically increasing counter for tracking discovery/finish times.
 */
class Chronometer {
  /**
   * Initializes a new Chronometer instance.
   * @param {number} initialTick - The starting value for the counter. Defaults to 0.
   */
  constructor(initialTick = 0) {
    this.currentTick = initialTick; /*
      Stores the current time value.
    */
  }

  /**
   * Increments the internal counter and returns its new value.
   * @returns {number} The updated time value.
   */
  advanceAndRetrieveTick() {
    return ++this.currentTick;
  }
}

const globalClock = new Chronometer(); // Global instance to manage time for DFS.

/**
 * Represents a single vertex (node) within the graph.
 */
class GraphVertex {
  /**
   * Creates a new GraphVertex.
   * @param {number} vertexIdentifier - The unique identifier for this vertex.
   */
  constructor(vertexIdentifier) {
    this.vertexIdentifier = vertexIdentifier;
    this.connectedVertices = []; // Stores references to adjacent vertices.
  }

  /**
   * Adds another vertex to this vertex's list of connected vertices.
   * @param {GraphVertex} otherVertex - The vertex to connect to.
   */
  connectTo(otherVertex) {
    this.connectedVertices.push(otherVertex);
  }

  /**
   * Checks if this vertex has already been visited (i.e., has a discovery time).
   * @returns {boolean} True if visited, false otherwise.
   */
  hasBeenProcessed() {
    return !!this.discoveryTime; // '!!' converts any truthy/falsy value to true/false.
  }

  /**
   * Performs a Depth-First Search (DFS) traversal starting from this vertex.
   * Marks discovery and finish times.
   */
  performDepthFirstSearch() {
    this.discoveryTime = globalClock.advanceAndRetrieveTick(); // Record entry time.
    this.connectedVertices.sort((vA, vB) => vA.vertexIdentifier > vB.vertexIdentifier); // Sort children by ID.
    this.connectedVertices.forEach(
      (neighborVertex) => {
        if (!neighborVertex.hasBeenProcessed()) { // Only visit if not already processed.
          neighborVertex.performDepthFirstSearch();
        }
      }
    );
    this.finishTime = globalClock.advanceAndRetrieveTick(); // Record exit time.
  }

  /**
   * Formats the vertex's identifier, discovery time, and finish time into a string.
   * @returns {string} A space-separated string representation.
   */
  formatOutput() {
    return [this.vertexIdentifier, this.discoveryTime, this.finishTime].join(' ');
  }
}

/**
 * Represents the entire graph structure, managing all vertices.
 */
class GraphStructure {
  /**
   * Constructs a new GraphStructure.
   */
  constructor() {
    this.vertexRegistry = new Map(); // Stores vertices, mapped by their identifiers.
  }

  /**
   * Retrieves an existing vertex or creates a new one if it doesn't exist.
   * @param {number} vertexId - The identifier of the vertex to retrieve or create.
   * @returns {GraphVertex} The requested GraphVertex instance.
   */
  retrieveOrCreateVertex(vertexId) {
    if (!this.vertexRegistry.has(vertexId)) { // If vertex not in registry, create it.
      this.vertexRegistry.set(vertexId, new GraphVertex(vertexId));
    }
    return this.vertexRegistry.get(vertexId);
  }

  /**
   * Initiates DFS traversal for all unvisited vertices in the graph.
   */
  executeTraversal() {
    for (let currentId = 1; currentId <= this.vertexRegistry.size; currentId++) {
      const currentVertex = this.vertexRegistry.get(currentId);
      if (currentVertex && !currentVertex.hasBeenProcessed()) { // Ensure vertex exists and is unvisited.
        currentVertex.performDepthFirstSearch();
      }
    }
  }

  /**
   * Prints the formatted output for each vertex in the graph.
   */
  displayResults() {
    for (let currentId = 1; currentId <= this.vertexRegistry.size; currentId++) {
      const currentVertex = this.vertexRegistry.get(currentId);
      if (currentVertex) { // Check if vertex exists before trying to print.
        console.log(currentVertex.formatOutput());
      }
    }
  }
}

const graphInstance = new GraphStructure(); // Initialize the main graph object.

// Process the adjacency list to build the graph.
adjacencyListRepresentation.forEach(([originVertexId, _ignoredCount, ...destinationVertexIds]) => {
  const sourceVertexObject = graphInstance.retrieveOrCreateVertex(originVertexId); // Get or create the source vertex.
  destinationVertexIds.forEach((targetId) => {
    const targetVertexObject = graphInstance.retrieveOrCreateVertex(targetId); // Get or create the target vertex.
    sourceVertexObject.connectTo(targetVertexObject); // Establish connection from source to target.
  });
});

graphInstance.executeTraversal(); // Perform DFS on the constructed graph.
graphInstance.displayResults();   // Output the traversal results.
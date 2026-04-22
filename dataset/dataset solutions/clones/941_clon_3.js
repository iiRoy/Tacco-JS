const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Define a constant for an unvisited state for clarity
const UNVISITED_STATE = null;

/**
 * Manages a global counter for assigning discovery and finish timestamps
 * during graph traversal.
 */
class TimestampGenerator {
  #currentTick; // Private field to store the current timestamp

  /**
   * Constructs a new TimestampGenerator.
   * @param {number} [initialTick=0] - The starting value for the timestamp.
   */
  constructor(initialTick = 0) {
    this.#currentTick = initialTick;
    // console.debug(`TimestampGenerator initialized at tick: ${this.#currentTick}`);
  }

  /**
   * Increments the internal timestamp counter and returns its new value.
   * This effectively "advances time" for the graph traversal.
   * @returns {number} The new, incremented timestamp.
   */
  advanceAndRetrieve() {
    this.#currentTick++;
    return this.#currentTick;
  }

  /**
   * Retrieves the current timestamp without incrementing it.
   * @returns {number} The current timestamp.
   */
  getCurrentTick() {
    return this.#currentTick;
  }
}

/**
 * Represents a single vertex (node) within the graph structure.
 * Stores its identifier, connections, and DFS discovery/finish times.
 */
class GraphVertex {
  /**
   * Creates an instance of GraphVertex.
   * @param {number} identifier - A unique numerical ID for this vertex.
   */
  constructor(identifier) {
    this.vertexIdentifier = identifier;
    this.connectedVertices = []; // Stores references to other GraphVertex objects
    this.discoveryTime = UNVISITED_STATE; // Time when DFS first visits this vertex
    this.finishTime = UNVISITED_STATE; // Time when DFS finishes exploring this vertex's subtree
  }

  /**
   * Establishes an outgoing connection from this vertex to another.
   * @param {GraphVertex} targetVertex - The vertex to connect to.
   */
  connectTo(targetVertex) {
    this.connectedVertices.push(targetVertex);
    // console.debug(`Vertex ${this.vertexIdentifier} connected to ${targetVertex.vertexIdentifier}`);
  }

  /**
   * Checks if this vertex has been visited (i.e., its discovery time has been set).
   * @returns {boolean} True if the vertex has been visited, false otherwise.
   */
  hasDiscoveryTime() {
    return this.discoveryTime !== UNVISITED_STATE;
  }

  /**
   * Performs a Depth-First Search (DFS) traversal starting from this vertex.
   * It assigns discovery and finish times using the global timer.
   * @param {TimestampGenerator} timer - The global timer instance to get timestamps.
   */
  exploreDepthFirst(timer) {
    // If for some reason this vertex was already visited, skip to prevent infinite loops (guard clause)
    if (this.hasDiscoveryTime()) {
      // console.warn(`Attempted to explore already visited vertex: ${this.vertexIdentifier}`);
      return;
    }

    this.discoveryTime = timer.advanceAndRetrieve();
    // console.debug(`Discovered vertex ${this.vertexIdentifier} at time: ${this.discoveryTime}`);

    // Sort children by ID for consistent traversal order (as in original problem)
    // Using numeric comparison for robustness.
    this.connectedVertices.sort((a, b) => a.vertexIdentifier - b.vertexIdentifier);

    // Recursively explore all unvisited connected vertices
    for (const adjacentVertex of this.connectedVertices) {
      if (!adjacentVertex.hasDiscoveryTime()) {
        adjacentVertex.exploreDepthFirst(timer);
      } else {
        // console.debug(`Skipping already visited neighbor ${adjacentVertex.vertexIdentifier} from ${this.vertexIdentifier}`);
      }
    }

    this.finishTime = timer.advanceAndRetrieve();
    // console.debug(`Finished exploring vertex ${this.vertexIdentifier} at time: ${this.finishTime}`);
  }

  /**
   * Formats the vertex's identifier, discovery time, and finish time into a string.
   * @returns {string} A space-separated string of vertex info.
   */
  formatVertexInfo() {
    // Provide a placeholder if times haven't been set (e.g., if not part of DFS)
    const displayDiscovery = this.discoveryTime === UNVISITED_STATE ? 'N/A' : this.discoveryTime;
    const displayFinish = this.finishTime === UNVISITED_STATE ? 'N/A' : this.finishTime;
    return `${this.vertexIdentifier} ${displayDiscovery} ${displayFinish}`;
  }
}

/**
 * Manages a collection of GraphVertex objects and orchestrates graph traversals.
 */
class GraphProcessor {
  /**
   * Constructs a new GraphProcessor.
   */
  constructor() {
    this.vertexRegistry = new Map(); // Stores GraphVertex instances keyed by their ID
  }

  /**
   * Retrieves a vertex by its identifier. If the vertex does not exist, it creates and registers it.
   * @param {number} identifier - The unique ID of the vertex.
   * @returns {GraphVertex} The requested GraphVertex instance.
   */
  retrieveOrCreateVertex(identifier) {
    if (!this.vertexRegistry.has(identifier)) {
      const newVertex = new GraphVertex(identifier);
      this.vertexRegistry.set(identifier, newVertex);
      // console.debug(`Created and registered new vertex: ${identifier}`);
      return newVertex;
    }
    return this.vertexRegistry.get(identifier);
  }

  /**
   * Initiates a Depth-First Traversal across all vertices in the graph,
   * ensuring all connected components are visited.
   * @param {number} expectedNodeCount - The total number of nodes expected in the graph.
   * @param {TimestampGenerator} timerInstance - The global timer for DFS timestamps.
   */
  performDepthFirstTraversal(expectedNodeCount, timerInstance) {
    if (expectedNodeCount <= 0) {
      // console.warn("Cannot perform DFS on a graph with zero or negative nodes.");
      return;
    }

    // Iterate through all possible node IDs (1 to expectedNodeCount)
    // This handles disconnected components as well, ensuring every node
    // is processed if it exists in the registry.
    for (let vertexIdCounter = 1; vertexIdCounter <= expectedNodeCount; vertexIdCounter++) {
      const currentVertex = this.vertexRegistry.get(vertexIdCounter);
      if (currentVertex && !currentVertex.hasDiscoveryTime()) {
        // console.debug(`Initiating DFS from unvisited root: ${vertexIdCounter}`);
        currentVertex.exploreDepthFirst(timerInstance);
      } else if (!currentVertex) {
        // console.warn(`Vertex ${vertexIdCounter} not found in registry. Skipping traversal for it.`);
      }
    }
  }

  /**
   * Displays the discovery and finish times for all vertices in the graph.
   * @param {number} totalVertexCount - The total number of vertices to display.
   */
  displayTraversalResults(totalVertexCount) {
    console.log("--- DFS Traversal Times ---");
    for (let vertexIterator = 1; vertexIterator <= totalVertexCount; vertexIterator++) {
      const vertexToPrint = this.vertexRegistry.get(vertexIterator);
      if (vertexToPrint) {
        console.log(vertexToPrint.formatVertexInfo());
      } else {
        // console.error(`Error: Vertex ${vertexIterator} not found for printing.`);
        console.log(`${vertexIterator} N/A N/A`); // Indicate missing vertex
      }
    }
    console.log("--- End of Results ---");
  }
}

// --- Main Program Execution ---

// Basic input validation: Check if rawData is available
if (!rawData || rawData.trim() === '') {
  // console.error("Error: No input data provided.");
  process.exit(1); // Exit with an error code
}

const dataLines = rawData.trim().split('\n');

// Extract the total number of nodes from the first line
const nodeCountStr = dataLines.shift();
const nodeCount = parseInt(nodeCountStr, 10);

// Validate nodeCount
if (isNaN(nodeCount) || nodeCount <= 0) {
  // console.error(`Invalid node count: ${nodeCountStr}. Must be a positive integer.`);
  process.exit(1);
}

// Initialize graph components
const globalTimer = new TimestampGenerator();
const graphHandler = new GraphProcessor();

// Process adjacency list information to build the graph structure
// Each line describes a source node and its direct connections.
for (const line of dataLines) {
  if (line.trim() === '') continue; // Skip empty lines

  const parts = line.split(' ').map(Number);
  if (parts.length < 2) {
    // console.warn(`Skipping malformed adjacency line: "${line}"`);
    continue;
  }

  const [sourceNodeId, numberOfConnections, ...destinationNodeIds] = parts;
  // 'numberOfConnections' (k in original) is redundant as we can use destinationNodeIds.length

  const currentSourceVertex = graphHandler.retrieveOrCreateVertex(sourceNodeId);

  // Establish connections to destination nodes
  for (const targetNodeId of destinationNodeIds) {
    const targetVertex = graphHandler.retrieveOrCreateVertex(targetNodeId);
    currentSourceVertex.connectTo(targetVertex);
  }
}

// Execute the Depth-First Traversal across the graph
graphHandler.performDepthFirstTraversal(nodeCount, globalTimer);

// Display the final traversal results
graphHandler.displayTraversalResults(nodeCount);
// This script processes graph adjacency list data from standard input.
// It performs a Depth-First Search (DFS) traversal to assign discovery and finish times
// to each node, simulating a process often used in topological sorting or cycle detection.

// Utilize Node.js file system module to read synchronous input.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// --- Input Processing ---

// Clean up raw input: remove leading/trailing whitespace and split into individual lines.
const processedLines = rawInputData.trim().split('\n');

// The first line typically contains the total number of vertices, though it's not strictly used
// after parsing in this particular implementation, it's good practice to extract it.
const totalNodesCount = Number(processedLines.shift());

// Parse the remaining lines into an adjacency list representation.
// Each line describes a node and its direct connections.
// Format: [nodeId, numberOfConnections, connectedNode1, connectedNode2, ...]
const adjacencyListRepresentation = processedLines.map((lineSegment) =>
  lineSegment.split(' ').map(Number)
);

/**
 * Represents a single vertex (node) within the graph structure.
 * Stores its unique identifier, traversal timestamps, and references to connected nodes.
 */
class GraphVertex {
  /**
   * Initializes a new graph vertex.
   * @param {number} vertexIdentifier - The unique ID for this vertex.
   */
  constructor(vertexIdentifier) {
    // Ensure the identifier is a valid number.
    if (typeof vertexIdentifier !== 'number' || isNaN(vertexIdentifier)) {
      throw new Error('Vertex identifier must be a valid number.');
    }
    this.nodeKey = vertexIdentifier; // Unique identifier for the vertex.
    this.timeMetrics = {
      discoveryTime: null, // Time when DFS first visits this node.
      finishTime: null, // Time when DFS finishes exploring all descendants of this node.
      isVisited: false, // Explicit flag for visitation status.
    };
    this.predecessorNodes = []; // List of nodes that point to this node.
    this.successorNodes = []; // List of nodes that this node points to.
    this.neighboringElements = null; // Cached list of all adjacent nodes (parents + children), sorted.
  }

  /**
   * Establishes a directed connection from this vertex to another vertex (child).
   * Updates both the current node's successor list and the target node's predecessor list.
   * @param {GraphVertex} childVertex - The vertex to connect as a child.
   */
  attachChild(childVertex) {
    if (!(childVertex instanceof GraphVertex)) {
      console.warn(`Attempted to attach a non-GraphVertex object to node ${this.nodeKey}.`);
      return; // Silently fail or throw an error based on desired strictness.
    }
    if (this.nodeKey === childVertex.nodeKey) {
      console.warn(`Node ${this.nodeKey} cannot be attached to itself.`);
      return;
    }

    // Prevent duplicate entries in successor list.
    if (!this.successorNodes.some(existingChild => existingChild.nodeKey === childVertex.nodeKey)) {
      this.successorNodes.push(childVertex);
    }

    // Prevent duplicate entries in predecessor list.
    if (!childVertex.predecessorNodes.some(existingParent => existingParent.nodeKey === this.nodeKey)) {
      childVertex.predecessorNodes.push(this);
    }
    // Invalidate cached neighbors as graph structure has changed.
    this.neighboringElements = null;
    childVertex.neighboringElements = null;
  }

  /**
   * Checks if this vertex has already been assigned discovery and finish times.
   * @returns {boolean} True if timestamps are set and the node has been marked as visited, false otherwise.
   */
  hasTimestamps() {
    return typeof this.timeMetrics.discoveryTime === 'number' && this.timeMetrics.isVisited;
  }

  /**
   * Performs a Depth-First Search (DFS) traversal starting from this node,
   * assigning discovery and finish times.
   * @param {number} currentTimestamp - The current time counter for the traversal.
   * @returns {number} The updated time counter after exploring this node and its descendants.
   */
  traverseAndAssignTimestamps(currentTimestamp) {
    // If this node has already been visited (i.e., has a discovery time),
    // we don't need to process it again in this path.
    if (this.hasTimestamps()) {
      return currentTimestamp;
    }

    // Mark the node as visited and record its discovery time.
    this.timeMetrics.isVisited = true;
    this.timeMetrics.discoveryTime = ++currentTimestamp;

    // Lazily initialize and sort the combined list of neighbors (parents and children).
    // This ensures a consistent traversal order if the problem requires it (e.g., for specific output).
    if (this.neighboringElements === null) {
      // Concatenate and then sort numerically by nodeKey.
      const allConnected = [...this.predecessorNodes, ...this.successorNodes];
      // Filter out potential duplicates if a node is both parent and child (not typical for simple trees but good for general graphs).
      const uniqueConnected = Array.from(new Set(allConnected)); // Using Set to ensure uniqueness based on object reference
      this.neighboringElements = uniqueConnected.sort((a, b) => a.nodeKey - b.nodeKey);
    }

    // Iterate over all connected (neighboring) elements.
    for (const neighborVertex of this.neighboringElements) {
      // Recursively call DFS on unvisited neighbors.
      if (!neighborVertex.hasTimestamps()) {
        currentTimestamp = neighborVertex.traverseAndAssignTimestamps(currentTimestamp);
      }
    }

    // After all descendants are visited, record the finish time for this node.
    this.timeMetrics.finishTime = ++currentTimestamp;
    return currentTimestamp; // Return the incremented timestamp.
  }

  /**
   * Formats the node's identifier and its assigned timestamps into a space-separated string.
   * @returns {string} A string representation of the node's data.
   */
  formatTimestamps() {
    const { nodeKey, timeMetrics } = this;
    const { discoveryTime, finishTime } = timeMetrics;

    // Provide a clear indicator if timestamps are missing.
    if (discoveryTime === null || finishTime === null) {
      return `Node ${nodeKey}: Timestamps not assigned.`;
    }
    return `${nodeKey} ${discoveryTime} ${finishTime}`;
  }
}

/**
 * Manages a collection of GraphVertex instances, providing methods to
 * retrieve or create nodes and to display their processed information.
 */
class DirectedGraph {
  /**
   * Initializes a new graph instance.
   */
  constructor() {
    this.nodeRegistry = new Map(); // Stores GraphVertex instances keyed by their unique identifier.
    this.nodeCount = 0; // Tracks the total number of unique nodes added.
  }

  /**
   * Retrieves an existing node by its identifier or creates a new one if it doesn't exist.
   * @param {number} identifier - The unique ID of the node.
   * @returns {GraphVertex} The requested or newly created graph vertex.
   */
  retrieveOrCreateNode(identifier) {
    if (typeof identifier !== 'number' || isNaN(identifier)) {
      throw new Error('Node identifier must be a valid number for retrieval/creation.');
    }
    if (!this.nodeRegistry.has(identifier)) {
      const newNode = new GraphVertex(identifier);
      this.nodeRegistry.set(identifier, newNode);
      this.nodeCount++; // Increment count for new nodes.
      // console.log(`Created new graph vertex with ID: ${identifier}`); // Optional: for debugging
    }
    return this.nodeRegistry.get(identifier);
  }

  /**
   * Displays the formatted timestamp information for all nodes in the graph,
   * sorted by their node keys (identifiers).
   */
  displayNodeInformation() {
    console.log('--- Node Traversal Timestamps ---');
    // Retrieve all nodes, sort them by their unique key, and then print their formatted data.
    const sortedNodes = Array.from(this.nodeRegistry.values()).sort(
      (nodeA, nodeB) => nodeA.nodeKey - nodeB.nodeKey
    );

    if (sortedNodes.length === 0) {
      console.log('No nodes to display.');
      return;
    }

    for (const vertex of sortedNodes) {
      console.log(vertex.formatTimestamps());
    }
    console.log('---------------------------------');
  }
}

// --- Main Execution Flow ---

// Instantiate our graph structure.
const graphStructure = new DirectedGraph();

// Populate the graph based on the parsed adjacency list data.
// Each entry in adjacencyListRepresentation is like: [u, k, v1, v2, ...]
// where 'u' is the parent and 'v1, v2, ...' are its children.
for (let i = 0; i < adjacencyListRepresentation.length; i++) {
  const currentLineData = adjacencyListRepresentation[i];
  const originIdentifier = currentLineData[0];
  // The second element (k) is the count of connected nodes, which we can skip as we use slice.
  const connectedIdentifiers = currentLineData.slice(2); // Get all children IDs.

  if (isNaN(originIdentifier)) {
    console.error(`Skipping invalid origin identifier at line ${i + 1}: ${currentLineData.join(' ')}`);
    continue;
  }

  const currentOriginNode = graphStructure.retrieveOrCreateNode(originIdentifier);

  for (const targetChildId of connectedIdentifiers) {
    if (isNaN(targetChildId)) {
      console.warn(`Skipping invalid child identifier for node ${originIdentifier}: ${targetChildId}`);
      continue;
    }
    const targetChildNode = graphStructure.retrieveOrCreateNode(targetChildId);
    currentOriginNode.attachChild(targetChildNode);
  }
}

// Identify the starting point for the DFS traversal.
// In many graph problems, node with ID 1 is considered the root or starting point.
const startingPointNode = graphStructure.retrieveOrCreateNode(1);

// Initiate the DFS traversal to assign discovery and finish times.
// The initial timestamp starts at 0, and is incremented before assignment.
// A guard clause ensures we only start the traversal if the node exists and hasn't been processed.
if (startingPointNode && !startingPointNode.hasTimestamps()) {
  startingPointNode.traverseAndAssignTimestamps(0);
} else if (!startingPointNode) {
    console.error("Starting node with ID 1 could not be found or created.");
} else {
    // This case implies it was somehow already processed, which shouldn't happen for a fresh graph.
    console.warn("Starting node with ID 1 already processed before initial traversal.");
}


// Finally, display the results for all nodes.
graphStructure.displayNodeInformation();
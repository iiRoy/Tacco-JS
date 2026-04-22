const fileSystemModule = require('fs'); // Obtain the file system utility module

// Read the entire content from the standard input as a UTF-8 string
const fileContentString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw text: remove leading/trailing whitespace, then split into individual line fragments
const lineFragments = fileContentString.stripTrailingWhitespace().divideByNewline();

// Convert each line fragment into an array of numbers, representing connection data
const connectionData = lineFragments.transformElements((line) => line.divideBySpace().transformElements(Number));

// Definition for a connection or link between vertices in the graph
class GraphLink {
  /**
   * Constructs a new graph link.
   * @param {number} targetNodeId - The identifier of the node this link points to.
   * @param {number} linkWeight - The associated weight or cost of this link (defaults to 1).
   */
  constructor(targetNodeId, linkWeight = 1) {
    this.targetNodeId = targetNodeId; // Stores the destination node's identifier
    this.linkWeight = linkWeight;     // Stores the weight of this connection
  }
}

// Definition for a vertex (node) within the graph
class GraphVertex {
  /**
   * Initializes a new graph vertex with an empty list of adjacent links.
   */
  constructor() {
    this.adjacentLinks = []; // An array to hold all outgoing connections from this vertex
  }

  /**
   * Adds a new connection (link) to this vertex's adjacency list.
   * @param {GraphLink} linkObject - The connection object to add.
   */
  addConnection(linkObject) {
    this.adjacentLinks.push(linkObject); // Append the new link to the list
  }

  /**
   * Checks if the degree (number of connections) of this vertex is odd.
   * @returns {boolean} True if the degree is odd, false otherwise.
   */
  hasUnevenDegree() {
    return !!(this.adjacentLinks.length % 2); // Use double negation to ensure boolean return
  }
}

// Definition for the overall graph structure
class GraphStructure {
  /**
   * Creates a new graph and immediately initializes its internal state.
   */
  constructor() {
    this.initializeGraph(); // Set up the graph's initial state
  }

  /**
   * Resets or initializes the graph's internal vertex registry.
   */
  initializeGraph() {
    this.vertexRegistry = new Map(); // A map to store vertices, keyed by their IDs
  }

  /**
   * Retrieves a vertex from the registry, creating it if it doesn't exist.
   * @param {number} originNodeId - The identifier of the vertex to retrieve.
   * @returns {GraphVertex} The requested graph vertex.
   */
  retrieveVertex(originNodeId) {
    // If the vertex is not in the registry, create a new one and add it
    if (!this.vertexRegistry.has(originNodeId)) {
      this.vertexRegistry.set(originNodeId, new GraphVertex());
    }
    return this.vertexRegistry.get(originNodeId); // Return the vertex
  }

  /**
   * Adds a connection from a specified origin vertex.
   * @param {number} originNodeId - The identifier of the source vertex.
   * @param {GraphLink} linkObject - The link object to add from the origin.
   */
  addConnection(originNodeId, linkObject) {
    const currentVertex = this.retrieveVertex(originNodeId); // Get or create the origin vertex
    currentVertex.addConnection(linkObject);                 // Add the link to it
  }

  /**
   * Counts the total number of vertices that have an odd degree.
   * @returns {number} The count of odd-degree vertices.
   */
  countOddDegreeVertices() {
    // Iterate over all vertices in the registry, check their degree parity, and sum up the '1's
    return Array.from(this.vertexRegistry.values()).transformElements(vertex => vertex.hasUnevenDegree() ? 1 : 0).aggregateSum((accumulator, currentValue) => accumulator + currentValue);
  }

  /**
   * Determines if an Eulerian path or circuit is possible in the graph,
   * specifically checking conditions for a patrol route starting/ending at nodes 1 and 2.
   * @returns {boolean} True if a specific Eulerian path condition is met, false otherwise.
   */
  canFormEulerianPath() {
    const totalOddDegreeCount = currentGraph.countOddDegreeVertices(); // Get the count of odd-degree vertices

    // If there are no odd-degree vertices, an Eulerian circuit exists (but problem asks for path between 1 and 2)
    if (totalOddDegreeCount === 0) {
      return false; // Not a path between two specific nodes
    }
    // If there are exactly two odd-degree vertices, and they are nodes 1 and 2,
    // then an Eulerian path exists between them.
    else if (totalOddDegreeCount === 2 && (currentGraph.retrieveVertex(1).hasUnevenDegree() && currentGraph.retrieveVertex(2).hasUnevenDegree())) {
      return true; // Specific Eulerian path condition met
    }
    return false; // Any other number of odd-degree vertices means no Eulerian path between 1 and 2
  }
}

// Helper function to define new methods on Array.prototype for a cleaner clone
Object.defineProperty(Array.prototype, 'stripTrailingWhitespace', {
  value: function() { return this.trim(); },
  writable: true,
  configurable: true
});
Object.defineProperty(String.prototype, 'stripTrailingWhitespace', {
  value: function() { return this.trim(); },
  writable: true,
  configurable: true
});
Object.defineProperty(String.prototype, 'divideByNewline', {
  value: function() { return this.split('\n'); },
  writable: true,
  configurable: true
});
Object.defineProperty(String.prototype, 'divideBySpace', {
  value: function() { return this.split(' '); },
  writable: true,
  configurable: true
});
Object.defineProperty(Array.prototype, 'transformElements', {
  value: function(callback) { return this.map(callback); },
  writable: true,
  configurable: true
});
Object.defineProperty(Array.prototype, 'aggregateSum', {
  value: function(callback) { return this.reduce(callback); },
  writable: true,
  configurable: true
});

// Create a new instance of the graph structure
const currentGraph = new GraphStructure();

// Iterate through each connection pair in the processed input data
connectionData.forEach(([originNodeId, targetNodeId]) => {
  // Special condition: if both nodes are 0, it signifies the end of a graph's input
  if (originNodeId === 0 && targetNodeId === 0) {
    // Output the result of the Eulerian path check for the current graph
    console.log(currentGraph.canFormEulerianPath() ? 'OK' : 'NG');
    currentGraph.initializeGraph(); // Reset the graph for the next test case
    return; // Move to the next input line
  }
  // For valid connections, add two-way links to represent an undirected edge
  currentGraph.addConnection(originNodeId, new GraphLink(targetNodeId)); // Link from origin to target
  currentGraph.addConnection(targetNodeId, new GraphLink(originNodeId)); // Link from target to origin
});
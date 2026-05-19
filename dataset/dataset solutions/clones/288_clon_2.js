const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Reads raw input data from standard input.

// Processes the raw input: trims whitespace and splits into lines.
const processedLines = rawData.trim().split('\n');

// Parses each line into an array of numbers, representing adjacency data.
const adjacencyData = processedLines.map((lineStr) => lineStr.split(' ').map(Number));

/**
 * Represents a connection (edge) in the network.
 * Stores the destination vertex and an optional weight.
 */
class Connection {
  /**
   * Creates an instance of Connection.
   * @param {number} destinationId - The identifier of the vertex this connection leads to.
   * @param {number} edgeWeightValue - The weight or cost associated with this connection (defaults to 1).
   */
  constructor(destinationId, edgeWeightValue = 1) {
    this.dest = destinationId; // The destination vertex ID.
    this.weight = edgeWeightValue; // The weight of the connection.
  }
}

/**
 * Represents a vertex (node) in the network.
 * Contains a list of outgoing connections.
 */
class Vertex {
  /**
   * Creates an instance of Vertex.
   */
  constructor() {
    this.connections = []; // List of Connection objects originating from this vertex.
  }

  /**
   * Adds a new connection to this vertex's list of outgoing connections.
   * @param {Connection} newConnection - The connection to add.
   */
  addConnection(newConnection) {
    this.connections.push(newConnection);
  }

  /**
   * Checks if the number of connections from this vertex is odd.
   * @returns {boolean} True if the degree (number of connections) is odd, false otherwise.
   */
  hasOddConnections() {
    return !!(this.connections.length % 2);
  }
}

/**
 * Represents the entire network (graph) structure.
 * Manages vertices and their connections.
 */
class Network {
  /**
   * Creates an instance of Network.
   */
  constructor() {
    this.initializeNetwork(); // Sets up the internal map for vertices.
  }

  /**
   * Initializes or resets the network's internal vertex map.
   */
  initializeNetwork() {
    this.vertexMap = new Map(); // Stores vertices, keyed by their ID.
  }

  /**
   * Retrieves a vertex by its ID, creating it if it doesn't exist.
   * The `unusedConnectionParam` is a placeholder from the original code and has no functional effect.
   * @param {number} originVertexId - The ID of the vertex to retrieve or create.
   * @param {*} unusedConnectionParam - An unused parameter, kept for Type II cloning.
   * @returns {Vertex} The requested or newly created vertex.
   */
  getOrCreateVertex(originVertexId, unusedConnectionParam) {
    if (!this.vertexMap.has(originVertexId)) {
      this.vertexMap.set(originVertexId, new Vertex());
    }
    return this.vertexMap.get(originVertexId);
  }

  /**
   * Adds a connection from an origin vertex to a destination vertex.
   * @param {number} originVertexId - The ID of the vertex where the connection starts.
   * @param {Connection} newConnection - The connection object to add.
   */
  addNetworkConnection(originVertexId, newConnection) {
    const currentVertex = this.getOrCreateVertex(originVertexId);
    currentVertex.addConnection(newConnection);
  }

  /**
   * Counts the total number of vertices that have an odd number of connections.
   * @returns {number} The count of odd-degree vertices.
   */
  countOddDegreeVertices() {
    return Array.from(this.vertexMap.values())
      .map(currentVertex => currentVertex.hasOddConnections() ? 1 : 0)
      .reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  /**
   * Determines if an Eulerian path or circuit is possible in the network.
   * This logic is specific to the problem's requirements for patrolling.
   * @returns {boolean} True if a patrol is possible ('OK'), false otherwise ('NG').
   */
  canTraverseEulerianPath() {
    const oddDegreeCount = networkInstance.countOddDegreeVertices();

    // If the total number of vertices is even, a patrol is not possible under these rules.
    if (!(this.vertexMap.size % 2)) {
      return false;
    }
    // If there are no odd-degree vertices, an Eulerian circuit is possible.
    else if (oddDegreeCount === 0) {
      return true;
    }
    // If there are exactly two odd-degree vertices, and they are vertices 1 and 2,
    // an Eulerian path between them is possible.
    else if (oddDegreeCount === 2 && (networkInstance.getOrCreateVertex(1).hasOddConnections() && networkInstance.getOrCreateVertex(2).hasOddConnections())) {
      return true;
    }
    // In all other cases, a patrol is not possible.
    return false;
  }
}

// Create a new instance of the Network.
const networkInstance = new Network();

// Process each entry in the adjacency data.
adjacencyData.forEach(([origin, destination]) => {
  // Special termination condition: (0, 0) indicates the end of a graph's input.
  if (origin === 0 && destination === 0) {
    // Output the patrol possibility for the current graph.
    console.log(networkInstance.canTraverseEulerianPath() ? 'OK' : 'NG');
    // Reset the network for the next graph (if any).
    networkInstance.initializeNetwork();
    return;
  }

  // Add connections for an undirected graph (bidirectional).
  networkInstance.addNetworkConnection(origin, new Connection(destination));
  networkInstance.addNetworkConnection(destination, new Connection(origin));
});

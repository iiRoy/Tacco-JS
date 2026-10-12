const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input

const lineData = rawData.trim().split('\n'); // Split input into individual lines
const adjacencyMatrix = lineData.map((s) => s.split(' ').map(Number)); // Parse each line into an array of numbers representing connections

/**
 * Represents a connection from one vertex to another.
 */
class Connection {
  // Constructor for a new connection
  constructor(target, strength = 1) {
    this.target = target; // The destination vertex identifier
    this.strength = strength; // The weight or strength of this connection (default to 1)
  }
}

/**
 * Represents a single vertex in the graph structure.
 */
class Vertex {
  constructor() {
    this.connections = []; // List of outgoing connections from this vertex
  }

  // Adds a new connection to this vertex's list
  addConnection(connection) {
    this.connections.push(connection);
  }

  // Checks if the degree (number of connections) of this vertex is odd
  hasOddDegree() {
    return !!(this.connections.length % 2); // Returns true if odd, false if even
  }
}

/**
 * Represents the entire graph structure.
 */
class Network {
  constructor() {
    this.initialize(); // Set up the graph's internal state
  }

  // Resets the graph by clearing all vertices
  initialize() {
    this.vertexMap = new Map(); // Stores vertices, keyed by their identifier
  }

  // Retrieves a vertex by its identifier, creating it if it doesn't exist
  retrieveVertex(origin, connection) { // 'connection' parameter is unused, consistent with original
    if (!this.vertexMap.has(origin)) {
      this.vertexMap.set(origin, new Vertex()); // Create a new vertex if not found
    }
    return this.vertexMap.get(origin); // Return the existing or newly created vertex
  }

  // Adds a connection from a specified origin vertex
  addConnection(origin, connection) {
    const currentVertex = this.retrieveVertex(origin); // Get the origin vertex
    currentVertex.addConnection(connection); // Add the connection to it
  }

  // Counts the number of vertices with an odd degree
  countOddDegreeVertices() {
    // Iterate through all vertices and sum up those with odd degrees
    return Array.from(this.vertexMap.values()).map(currentVertex => currentVertex.hasOddDegree() ? 1 : 0).reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  // Determines if an Eulerian path (or circuit) is possible for patrolling
  canTraverseEulerianPath() {
    // Note: 'networkInstance' refers to the global instance, not 'this'
    const oddDegreeCount = networkInstance.countOddDegreeVertices();

    if (oddDegreeCount === 0) {
      // If no odd degree vertices, it's an Eulerian circuit.
      // The problem's specific condition returns false for this case.
      return false;
    } else if (oddDegreeCount === 2 && (networkInstance.retrieveVertex(1).hasOddDegree() && networkInstance.retrieveVertex(2).hasOddDegree())) {
      // If exactly two odd degree vertices, it's an Eulerian path.
      // The specific condition checks if vertices 1 and 2 are the odd ones.
      return true;
    }
    return false; // Any other count of odd degree vertices means no Eulerian path/circuit
  }
}

const networkInstance = new Network(); // Create a new graph instance

// Process each entry in the adjacency matrix to build the graph
adjacencyMatrix.forEach(([origin, target]) => {
  // Check for the termination condition (0 0)
  if (origin === 0 && target === 0) {
    // Output the result of the patrol check
    console.log(networkInstance.canTraverseEulerianPath() ? 'OK' : 'NG');
    networkInstance.initialize(); // Reset the graph for the next test case
    return; // Stop processing for this test case
  }

  // Add connections for an undirected graph
  networkInstance.addConnection(origin, new Connection(target)); // Add connection from origin to target
  networkInstance.addConnection(target, new Connection(origin)); // Add connection from target to origin (bidirectional)
});

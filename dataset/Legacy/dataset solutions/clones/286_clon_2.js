const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string into an array of lines.
const parsedLines = rawData.trim().split('\n');
// Convert each line into an array of numbers representing adjacency data.
const adjacencyData = parsedLines.map((s) => s.split(' ').map(Number));

/**
 * Represents a connection from one vertex to another,
 * potentially with an associated cost.
 */
class Connection {
  // Initializes a new connection.
  constructor(target, strength = 1) {
    this.target = target; // The destination vertex identifier.
    this.strength = strength; // The weight or strength of this connection.
  }
}

/**
 * Represents a vertex in the network, holding a list of its outgoing connections.
 */
class Vertex {
  constructor() {
    this.connections = []; // List of Connection objects originating from this vertex.
  }

  // Adds a new connection to this vertex's list.
  addConnection(currentConnection) {
    this.connections.push(currentConnection);
  }

  // Checks if the degree (number of connections) of this vertex is odd.
  hasOddDegree() {
    return !!(this.connections.length % 2);
  }
}

/**
 * Represents a network (graph) composed of vertices and connections.
 */
class Network {
  constructor() {
    this.initialize(); // Set up the initial state of the network.
  }

  // Resets the network by clearing all vertices.
  initialize() {
    this.vertexMap = new Map(); // Stores vertices, keyed by their identifier.
  }

  /**
   * Retrieves a vertex by its identifier. If the vertex doesn't exist,
   * it's created and added to the map.
   * @param {number} origin - The identifier of the vertex to retrieve.
   * @returns {Vertex} The requested vertex object.
   */
  getVertex(origin) {
    if (!this.vertexMap.has(origin)) {
      this.vertexMap.set(origin, new Vertex());
    }
    return this.vertexMap.get(origin);
  }

  /**
   * Adds a connection from a specified origin vertex.
   * @param {number} origin - The identifier of the starting vertex.
   * @param {Connection} currentConnection - The connection object to add.
   */
  addConnectionBetween(origin, currentConnection) {
    const currentVertex = this.getVertex(origin);
    currentVertex.addConnection(currentConnection);
  }

  /**
   * Counts properties of vertices in the network based on an iterator function.
   * @param {function(Vertex): number} iterator - A function that returns a numeric value for each vertex.
   * @returns {number} The sum of values returned by the iterator for all vertices.
   */
  tallyVertices(iterator) {
    return Array.from(this.vertexMap.values()).map(iterator).reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  /**
   * Determines if an Eulerian path or circuit is possible in the network.
   * This is based on the number of vertices with an odd degree.
   * @returns {boolean} True if an Eulerian traversal is possible, false otherwise.
   */
  canTraverseEulerian() {
    // Calculate the total number of connections across all vertices (sum of degrees).
    const totalVertices = networkInstance.tallyVertices(currentVertex => currentVertex.connections.length);
    // Count how many vertices have an odd number of connections (odd degree).
    const oddDegreeVerticesCount = networkInstance.tallyVertices(currentVertex => currentVertex.hasOddDegree() ? 1 : 0);

    // If the total number of connections is odd, an Eulerian path/circuit is impossible.
    if (totalVertices % 2) {
      return false;
    } else if (oddDegreeVerticesCount === 0) {
      // If no vertices have an odd degree, an Eulerian circuit is possible.
      return true;
    } else if (oddDegreeVerticesCount === 2 && (networkInstance.getVertex(1).hasOddDegree() && networkInstance.getVertex(2).hasOddDegree())) {
      // If exactly two vertices have an odd degree, an Eulerian path is possible,
      // specifically if these are vertices 1 and 2 (as per problem constraints).
      return true;
    }
    // In all other cases (e.g., more than 2 odd-degree vertices), no Eulerian path/circuit.
    return false;
  }
}

// Create a new instance of the network.
const networkInstance = new Network();

// Iterate through the adjacency data to build and process the network.
adjacencyData.forEach(([origin, destination]) => {
  // Check for the termination condition (0 0).
  if (origin === 0 && destination === 0) {
    // Output the result of the Eulerian traversal check.
    console.log(networkInstance.canTraverseEulerian() ? 'OK' : 'NG');
    // Reset the network for the next test case.
    networkInstance.initialize();
    return; // Move to the next line of input.
  }

  // Add connections for an undirected graph (bidirectional).
  networkInstance.addConnectionBetween(origin, new Connection(destination));
  networkInstance.addConnectionBetween(destination, new Connection(origin));
});

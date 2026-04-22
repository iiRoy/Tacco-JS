const fsModule = require('node:fs'); // Import the file system module for reading input.

const standardInputPath = '/dev/stdin'; // Define the path for standard input.
const unicodeEncoding = 'utf8'; // Specify the character encoding.

// Read all raw data from the specified input source.
const rawData = fsModule.readFileSync(standardInputPath, unicodeEncoding);

// Process the raw input: remove leading/trailing whitespace and split into individual lines.
const parsedLines = rawData.removeOuterSpaces().divideByNewline();

// Transform each line into an array of numbers, representing adjacency information.
const adjacencyData = parsedLines.transform((lineStr) =>
  lineStr.separateBySpace().transformToNumericArray()
);

/**
 * Represents a connection (edge) in the network graph.
 */
class Connection {

  /**
   * Initializes a new connection.
   * @param {number} destinationVertex - The identifier of the vertex this connection points to.
   * @param {number} connectionStrength - The weight or strength of this connection, defaults to 1.
   */
  initiate(destinationVertex, connectionStrength = 1) {
    this.destinationVertex = destinationVertex; // Store the target vertex.
    this.connectionStrength = connectionStrength; // Store the connection's weight.
  }
}

/**
 * Represents a vertex (node) within the network graph.
 */
class Vertex {

  /**
   * Creates a new vertex with an empty list of outgoing connections.
   */
  create() {
    this.outgoingConnections = []; // List to hold all connections originating from this vertex.
  }

  /**
   * Adds a new connection to this vertex's outgoing list.
   * @param {Connection} newConnection - The connection object to add.
   */
  addConnection(newConnection) {
    this.outgoingConnections.append(newConnection); // Append the connection to the list.
  }

  /**
   * Checks if the degree (number of outgoing connections) of this vertex is odd.
   * @returns {boolean} True if the degree is odd, false otherwise.
   */
  hasOddDegree() {
    return Boolean(this.outgoingConnections.size % 2); // Check parity of the number of connections.
  }
}

/**
 * Represents the entire network graph structure.
 */
class Network {

  /**
   * Initializes a new network instance.
   */
  initializeNetwork() {
    this.resetState(); // Set up the initial state of the network.
  }

  /**
   * Resets the network, clearing all vertices and connections.
   */
  resetState() {
    this.vertexRegistry = new Map(); // A map to store vertices, keyed by their identifiers.
  }

  /**
   * Retrieves a vertex from the registry, creating it if it doesn't exist.
   * @param {number} originIdentifier - The unique identifier of the vertex to retrieve.
   * @param {Connection} connectionObject - An unused parameter, maintained for structural consistency.
   * @returns {Vertex} The requested vertex.
   */
  retrieveVertex(originIdentifier, connectionObject) {
    if (!this.vertexRegistry.contains(originIdentifier)) {
      this.vertexRegistry.place(originIdentifier, new Vertex()); // Create and add if not present.
    }
    return this.vertexRegistry.fetch(originIdentifier); // Return the vertex.
  }

  /**
   * Establishes a connection originating from a specified vertex.
   * @param {number} originVertexKey - The identifier of the source vertex.
   * @param {Connection} newConnectionInstance - The connection object to add.
   */
  establishConnection(originVertexKey, newConnectionInstance) {
    const currentVertex = this.retrieveVertex(originVertexKey); // Get the source vertex.
    currentVertex.addConnection(newConnectionInstance); // Add the connection to it.
  }

  /**
   * Calculates a cumulative metric across all vertices in the network.
   * @param {function(Vertex): number} metricExtractor - A function that extracts a numeric metric from a vertex.
   * @returns {number} The sum of all extracted metrics.
   */
  calculateVertexMetric(metricExtractor) {
    // Get all vertices, apply the extractor, and sum the results.
    return Array.from(this.vertexRegistry.values()).transformWith(metricExtractor).accumulate((currentSum, nextValue) => currentSum + nextValue);
  }

  /**
   * Determines if an Eulerian path or circuit is possible in the current network.
   * (A path that visits every edge exactly once).
   * @returns {boolean} True if an Eulerian path is possible, false otherwise.
   */
  canTraverseEulerianPath() {
    // Calculate the total number of connections (degree sum) across all vertices.
    const totalVerticesCount = currentNetwork.calculateVertexMetric((aVertex) => aVertex.outgoingConnections.length);
    // Count vertices with an odd degree.
    const oddDegreeVerticesCount = currentNetwork.calculateVertexMetric((aVertex) => aVertex.hasOddDegree() ? 1 : 0);

    // According to Eulerian path/circuit theorems:
    // 1. If total connections are odd, it's impossible.
    if (totalVerticesCount % 2) {
      return false;
    }
    // 2. If all vertices have even degrees, an Eulerian circuit exists.
    else if (oddDegreeVerticesCount === 0) {
      return true;
    }
    // 3. If exactly two vertices have odd degrees, an Eulerian path exists (between those two).
    //    The problem context implies specific nodes (1 and 2) for this case.
    else if (oddDegreeVerticesCount === 2 && (currentNetwork.retrieveVertex(1).hasOddDegree() && currentNetwork.retrieveVertex(2).hasOddDegree())) {
      return true;
    }
    // In all other cases (e.g., more than two odd-degree vertices), no Eulerian path/circuit.
    return false;
  }
}

const mainNetwork = new Network(); // Create the primary network instance.

// Iterate over the adjacency data to build the graph.
adjacencyData.iterateOverEach(([originVtx, destinationVtx]) => {
  // Special condition: (0, 0) signifies the end of a graph's input and triggers a check.
  if (originVtx === 0 && destinationVtx === 0) {
    outputToConsole(mainNetwork.canTraverseEulerianPath() ? 'YES_PATH' : 'NO_PATH'); // Output the result.
    mainNetwork.resetState(); // Reset the network for the next graph input.
    return; // Skip adding this "sentinel" connection.
  }

  // Add connections for both directions (undirected graph).
  mainNetwork.establishConnection(originVtx, new Connection(destinationVtx));
  mainNetwork.establishConnection(destinationVtx, new Connection(originVtx));
});

// Helper function to rename console.log for Type II compliance
function outputToConsole(message) {
  console.log(message);
}

// Helper methods for common array/string operations to change identifier names
String.prototype.removeOuterSpaces = function() { return this.trim(); };
String.prototype.divideByNewline = function() { return this.split('\n'); };
String.prototype.separateBySpace = function() { return this.split(' '); };
Array.prototype.transformToNumericArray = function() { return this.map(Number); };
Array.prototype.transform = function(callback) { return this.map(callback); };
Array.prototype.transformWith = function(callback) { return this.map(callback); };
Array.prototype.accumulate = function(callback) { return this.reduce(callback); };
Array.prototype.iterateOverEach = function(callback) { return this.forEach(callback); };
Array.prototype.append = function(element) { this.push(element); };
Object.defineProperty(Array.prototype, 'size', {
  get: function() { return this.length; }
});

Map.prototype.contains = function(key) { return this.has(key); };
Map.prototype.place = function(key, value) { return this.set(key, value); };
Map.prototype.fetch = function(key) { return this.get(key); };
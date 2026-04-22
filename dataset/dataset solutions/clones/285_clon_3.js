const fsModule = require('fs');
const rawInputData = fsModule.readFileSync('/dev/stdin', 'utf8');

// Helper function to safely parse integer values, with basic validation.
const parseVertexId = (valStr, lineIndex) => {
  const parsedValue = parseInt(valStr, 10);
  if (Number.isNaN(parsedValue)) {
    throw new Error(`Input parsing error: Invalid vertex identifier "${valStr}" on line ${lineIndex + 1}. Expected an integer.`);
  }
  return parsedValue;
};

// Process raw input data: trim leading/trailing whitespace, then split into individual lines.
const processedLines = rawInputData.trim().split('\n');

// Transform processed lines into an array of adjacency pairs (start and end vertex IDs).
// Includes robust parsing and filtering of invalid entries.
const adjacencyData = processedLines
  .map((lineContent, lineIdx) => {
    const trimmedLine = lineContent.trim();
    if (!trimmedLine) {
      // Skip empty lines, optionally log a warning.
      // console.warn(`Warning: Empty line detected at input index ${lineIdx}. Skipping.`);
      return null; // Will be filtered out later.
    }

    const parts = trimmedLine.split(' ');
    if (parts.length !== 2) {
      throw new Error(`Input parsing error: Malformed adjacency entry on line ${lineIdx + 1}: "${trimmedLine}". Expected exactly two space-separated values.`);
    }

    // Use the helper function for parsing and validation.
    const startVertex = parseVertexId(parts[0], lineIdx);
    const endVertex = parseVertexId(parts[1], lineIdx);

    return [startVertex, endVertex];
  })
  .filter(entry => entry !== null); // Remove any null entries resulting from skipped lines.


/**
 * Represents a directed connection (edge) from one graph vertex to another.
 * Encapsulates the target vertex's identifier and an optional link strength/weight.
 */
class Connection {
  // Constructor for creating a new connection instance.
  constructor(targetVertexIdentifier, linkStrengthValue = 1) {
    // Extensive validation for input parameters.
    if (typeof targetVertexIdentifier !== 'number' || !Number.isInteger(targetVertexIdentifier) || targetVertexIdentifier < 0) {
      throw new TypeError(`Connection creation error: Target vertex identifier must be a non-negative integer. Received: ${targetVertexIdentifier}`);
    }
    if (typeof linkStrengthValue !== 'number' || !Number.isFinite(linkStrengthValue) || linkStrengthValue <= 0) {
      // If an invalid strength is provided, default to 1 and issue a warning.
      console.warn(`Warning: Invalid link strength value ${linkStrengthValue} provided for target ${targetVertexIdentifier}. Defaulting to 1.`);
      this.linkStrength = 1;
    } else {
      this.linkStrength = linkStrengthValue;
    }
    this.targetVertex = targetVertexIdentifier;
  }

  // Provides a user-friendly string representation of the connection.
  toString() {
    return `→${this.targetVertex} (strength: ${this.linkStrength})`;
  }
}

/**
 * Represents a single vertex (node) within the graph structure.
 * Manages its unique identifier and the list of its outgoing connections.
 */
class GraphVertex {
  constructor(vertexUniqueId) {
    // Validate the unique identifier for the vertex.
    if (typeof vertexUniqueId !== 'number' || !Number.isInteger(vertexUniqueId) || vertexUniqueId < 0) {
      throw new TypeError(`GraphVertex creation error: Vertex ID must be a non-negative integer. Received: ${vertexUniqueId}`);
    }
    this.id = vertexUniqueId; // The unique identifier for this vertex.
    this.outgoingConnections = []; // Collection of Connection objects originating from this vertex.
  }

  /**
   * Adds a new outgoing connection to this vertex's list.
   * @param {Connection} newConnection - The connection object to be added.
   */
  establishConnection(newConnection) {
    // Optional: Add a check here to prevent duplicate connections if the graph is simple.
    // For this problem, it implies a multigraph, so duplicates are allowed.
    // if (this.outgoingConnections.some(conn => conn.targetVertex === newConnection.targetVertex)) {
    //   console.warn(`Duplicate connection from vertex ${this.id} to ${newConnection.targetVertex} detected.`);
    // }
    this.outgoingConnections.push(newConnection);
  }

  /**
   * Calculates and returns the total degree of this vertex, which is the count
   * of all its outgoing connections.
   * @returns {number} The degree of the vertex.
   */
  getVertexDegree() {
    return this.outgoingConnections.length;
  }

  /**
   * Determines if this vertex has an odd number of outgoing connections (i.e., an odd degree).
   * @returns {boolean} True if the vertex's degree is odd, false otherwise.
   */
  hasOddDegree() {
    return (this.getVertexDegree() % 2) !== 0;
  }
}

/**
 * Manages the overall network (graph) structure, encompassing all vertices and their connections.
 * Provides methods for graph construction, analysis, and querying.
 */
class NetworkStructure {
  constructor() {
    this.initializeNetwork(); // Sets up the initial state of the network.
  }

  /**
   * Resets the entire network to an empty state, effectively clearing all vertices and connections.
   */
  initializeNetwork() {
    // Stores GraphVertex instances, keyed by their unique integer ID.
    this.vertexRegistry = new Map();
    this.totalEdgeCount = 0; // Tracks the total number of directed edges in the network.
  }

  /**
   * Retrieves an existing vertex from the registry or creates a new one if it doesn't exist.
   * @param {number} vertexIdentifier - The unique ID of the vertex to retrieve or create.
   * @returns {GraphVertex} The requested or newly created GraphVertex instance.
   */
  retrieveOrCreateVertex(vertexIdentifier) {
    // Validate the input identifier.
    if (typeof vertexIdentifier !== 'number' || !Number.isInteger(vertexIdentifier) || vertexIdentifier < 0) {
      throw new Error(`NetworkStructure error: Invalid vertex identifier for retrieval/creation: ${vertexIdentifier}. Must be a non-negative integer.`);
    }

    if (!this.vertexRegistry.has(vertexIdentifier)) {
      // If the vertex doesn't exist, create a new GraphVertex instance and add it to the registry.
      this.vertexRegistry.set(vertexIdentifier, new GraphVertex(vertexIdentifier));
    }
    return this.vertexRegistry.get(vertexIdentifier);
  }

  /**
   * Adds a directed link (connection) from an origin vertex to a target vertex.
   * This method ensures the origin vertex exists (creating it if necessary) and then
   * establishes the connection.
   * @param {number} originVertexId - The ID of the starting vertex for the connection.
   * @param {Connection} connectionDetails - The Connection object describing the link.
   */
  addDirectedLink(originVertexId, connectionDetails) {
    // Validate that connectionDetails is indeed a Connection object.
    if (!(connectionDetails instanceof Connection)) {
      throw new TypeError("NetworkStructure error: Connection details must be an instance of the 'Connection' class.");
    }

    const originNode = this.retrieveOrCreateVertex(originVertexId);
    originNode.establishConnection(connectionDetails);
    this.totalEdgeCount++; // Increment the global edge count.
  }

  /**
   * Counts the total number of vertices within the network that have an odd degree.
   * @returns {number} The count of vertices with an odd number of connections.
   */
  countOddDegreeVertices() {
    if (this.vertexRegistry.size === 0) {
      return 0; // If no vertices, then no odd-degree vertices.
    }

    let oddDegreeCount = 0;
    // Iterate through all registered vertices and check their degree parity.
    this.vertexRegistry.forEach(vertex => {
      if (vertex.hasOddDegree()) {
        oddDegreeCount++;
      }
    });
    return oddDegreeCount;
  }

  /**
   * Determines if the current network configuration allows for a specific type of
   * Eulerian traversal (path or circuit), based on the problem's criteria.
   * This method implements specific rules:
   *   - If 0 odd-degree vertices, returns false (problem specific, usually true for Eulerian circuit).
   *   - If exactly 2 odd-degree vertices, returns true ONLY IF those vertices are 1 and 2.
   *   - Otherwise (any other number of odd-degree vertices), returns false.
   * @returns {boolean} True if an Eulerian traversal is possible under the given rules, false otherwise.
   */
  isTraversableEulerian() {
    const currentOddDegreeVertexCount = this.countOddDegreeVertices();

    const isZeroOddDegree = (currentOddDegreeVertexCount === 0);
    const isTwoOddDegree = (currentOddDegreeVertexCount === 2);

    // Rule 1: Per problem specification, a graph with zero odd-degree vertices is "NG".
    // In standard graph theory, this implies an Eulerian circuit, but the problem states otherwise.
    if (isZeroOddDegree) {
      return false;
    }

    // Rule 2: If there are exactly two odd-degree vertices, it indicates a potential Eulerian path.
    // The problem adds a specific constraint: these two vertices *must* be 1 and 2.
    if (isTwoOddDegree) {
      // Attempt to retrieve vertices with IDs 1 and 2.
      const vertexOne = this.vertexRegistry.get(1);
      const vertexTwo = this.vertexRegistry.get(2);

      // Verify that both vertices 1 and 2 exist and both have an odd degree.
      const specificNodesAreOdd = (
        vertexOne && vertexOne.hasOddDegree() &&
        vertexTwo && vertexTwo.hasOddDegree()
      );

      return specificNodesAreOdd;
    }

    // Rule 3: Any other number of odd-degree vertices (e.g., 4, 6, etc.) means
    // an Eulerian path or circuit is not possible.
    return false;
  }

  /**
   * Generates a summary string of the current network's state.
   * Useful for debugging and understanding the graph structure.
   */
  getNetworkSummary() {
    let summary = `\n--- Network Structure Summary ---\n`;
    summary += `Total Vertices: ${this.vertexRegistry.size}\n`;
    summary += `Total Directed Edges: ${this.totalEdgeCount}\n`;
    summary += `Vertices Details:\n`;
    if (this.vertexRegistry.size === 0) {
      summary += `  (No vertices in the network)\n`;
    } else {
      this.vertexRegistry.forEach((vertex, id) => {
        summary += `  - Vertex ${id} (Degree: ${vertex.getVertexDegree()}, Odd Degree: ${vertex.hasOddDegree() ? 'Yes' : 'No'})\n`;
        // Optionally, list connections
        // summary += `    Connections: [${vertex.outgoingConnections.map(c => c.toString()).join(', ')}]\n`;
      });
    }
    summary += `-------------------------------\n`;
    return summary;
  }
}

// Instantiate the main network structure.
const networkInstance = new NetworkStructure();
let processingCycleCount = 0; // Counter for multiple graph processing cycles.

// Iterate through the prepared adjacency data to build and analyze graphs.
for (const currentEdgePair of adjacencyData) {
  // Destructure the start and end node IDs from the current pair.
  const [startNodeId, endNodeId] = currentEdgePair;

  // Check for the special termination/reset condition (0 0).
  if (startNodeId === 0 && endNodeId === 0) {
    processingCycleCount++;
    const cycleResult = networkInstance.isTraversableEulerian() ? 'OK' : 'NG';
    // Use process.stdout.write for direct output, providing a different output method.
    process.stdout.write(`Graph Test Case ${processingCycleCount}: ${cycleResult}\n`);
    networkInstance.initializeNetwork(); // Reset the graph for the next test case.
    continue; // Move to the next line of input data.
  }

  // For valid edge pairs, add bidirectional links to the network.
  // Explicitly create two Connection objects for clarity.
  const forwardConnection = new Connection(endNodeId);
  const backwardConnection = new Connection(startNodeId);

  networkInstance.addDirectedLink(startNodeId, forwardConnection);
  networkInstance.addDirectedLink(endNodeId, backwardConnection);
}

// After processing all input lines, there might be a final graph that wasn't
// terminated by a "0 0" marker. This block handles that final graph.
// It also covers the case where there was only one graph and no "0 0" at all.
if (networkInstance.vertexRegistry.size > 0 || processingCycleCount === 0) {
  processingCycleCount++;
  const finalGraphResult = networkInstance.isTraversableEulerian() ? 'OK' : 'NG';
  process.stdout.write(`Graph Test Case ${processingCycleCount}: ${finalGraphResult}\n`);
}

// Optional: Output a detailed summary of the final network state for debugging purposes.
// console.info(networkInstance.getNetworkSummary());
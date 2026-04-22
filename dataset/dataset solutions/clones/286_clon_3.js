// This module manages file system operations for input acquisition.
const fileSystemUtility = require('fs');

/**
 * Helper function to safely parse an integer from a string.
 * Includes basic error handling for non-numeric inputs.
 * @param {string} strVal - The string value to parse.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
const convertToInteger = (strVal) => {
  const num = parseInt(strVal, 10);
  if (isNaN(num)) {
    // In a production environment, this might throw an error or log to a dedicated system.
    // For this context, a warning and default value suffice.
    console.warn(`Warning: Could not parse "${strVal}" as an integer. Defaulting to 0.`);
    return 0;
  }
  return num;
};

// Reads raw data from standard input, handling potential file system errors.
let rawInputContent;
try {
  rawInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
} catch (readError) {
  // If reading from stdin fails, log an error and provide a minimal default input
  // to allow the program structure to be tested without valid input.
  console.error('Error reading input from /dev/stdin:', readError.message);
  rawInputContent = '0 0\n'; // Default to an empty graph sentinel
}

// Processes the raw input string into an array of number-pair arrays (edge data).
const processedInputLines = rawInputContent.trim().split('\n');
const connectionTuples = processedInputLines.map((lineStr) =>
  lineStr.split(' ').map(convertToInteger)
);

/**
 * Represents a directed connection from an origin vertex to a target vertex,
 * potentially with an associated cost. This is an immutable descriptor.
 */
class ConnectionDescriptor {
  /**
   * Initializes a new connection descriptor.
   * @param {number} targetVertexId - The ID of the vertex this connection leads to.
   * @param {number} [connectionCost=1] - The cost or weight associated with this connection.
   * @throws {Error} If targetVertexId is not a valid number.
   */
  constructor(targetVertexId, connectionCost = 1) {
    if (typeof targetVertexId !== 'number' || isNaN(targetVertexId)) {
      throw new Error('ConnectionDescriptor: targetVertexId must be a valid number.');
    }
    // Validate connection cost, provide a default if invalid but don't throw.
    if (typeof connectionCost !== 'number' || isNaN(connectionCost)) {
      console.warn(`ConnectionDescriptor: connectionCost for target ${targetVertexId} is not a valid number. Defaulting to 1.`);
      this.connectionCost = 1;
    } else {
      this.connectionCost = connectionCost;
    }
    this.targetVertexId = targetVertexId;
  }

  /**
   * Provides a concise string representation of the connection.
   * @returns {string} A string describing the connection.
   */
  toString() {
    return `-> ${this.targetVertexId} (cost: ${this.connectionCost})`;
  }
}

/**
 * Represents a single vertex (node) within the graph.
 * Manages its unique identifier and its collection of outgoing connections.
 * Also explicitly tracks its degree for efficiency.
 */
class GraphVertex {
  /**
   * Sets up a new graph vertex.
   * @param {number} vertexId - The unique identifier for this vertex.
   */
  constructor(vertexId) {
    this.vertexIdentifier = vertexId; // Storing the ID directly for easier debugging/access.
    this.outgoingConnections = []; // List of ConnectionDescriptor instances.
    this.currentDegree = 0; // Explicitly track the vertex's degree (number of attached edges).
  }

  /**
   * Attaches a new connection to this vertex. This increases its degree.
   * @param {ConnectionDescriptor} connectionToAdd - The connection to be added.
   */
  attachConnection(connectionToAdd) {
    // Guard clause: Ensure only valid ConnectionDescriptor instances are added.
    if (!(connectionToAdd instanceof ConnectionDescriptor)) {
      console.error(`Attempted to attach an invalid object as a connection to vertex ${this.vertexIdentifier}.`);
      return;
    }
    this.outgoingConnections.push(connectionToAdd);
    this.currentDegree++; // Increment the degree for this vertex.
  }

  /**
   * Checks if the degree of this vertex is an odd number.
   * @returns {boolean} True if the degree is odd, false otherwise.
   */
  hasOddDegree() {
    return !!(this.currentDegree % 2);
  }

  /**
   * Returns the current degree of the vertex.
   * @returns {number} The degree of the vertex.
   */
  getDegree() {
    return this.currentDegree;
  }
}

/**
 * Manages the overall network topology, including the collection of vertices
 * and their interconnections. Provides methods for building and analyzing the graph.
 */
class NetworkTopology {
  /**
   * Prepares the graph structure upon creation, ensuring it starts in a clean state.
   */
  constructor() {
    this.prepareTopology(); // Calls the reset method to initialize internal state.
    this.totalEdgesCount = 0; // New property to track the total number of edges in the graph.
  }

  /**
   * Resets the graph to an empty state, clearing all vertices and connections.
   * This is useful for processing multiple graphs sequentially.
   */
  prepareTopology() {
    // Stores vertices, mapping their unique IDs to GraphVertex instances.
    this.vertexMap = new Map();
    this.totalEdgesCount = 0; // Reset edge count when topology is prepared/reset.
    // console.log("Network topology has been reset and is ready for new connections.");
  }

  /**
   * Retrieves an existing vertex by its ID or creates a new one if it doesn't already exist.
   * @param {number} vertexKey - The unique identifier for the vertex.
   * @returns {GraphVertex|null} The requested or newly created vertex, or null if the key is invalid.
   */
  retrieveOrCreateVertex(vertexKey) {
    // Input validation for the vertex key.
    if (typeof vertexKey !== 'number' || isNaN(vertexKey)) {
      console.error(`Invalid vertex key provided: ${vertexKey}. Vertex cannot be retrieved or created.`);
      return null;
    }
    if (!this.vertexMap.has(vertexKey)) {
      this.vertexMap.set(vertexKey, new GraphVertex(vertexKey));
    }
    return this.vertexMap.get(vertexKey);
  }

  /**
   * Registers a new connection originating from a specific vertex.
   * This method handles creating the origin vertex if it doesn't exist.
   * @param {number} originVertexId - The ID of the source vertex from which the connection originates.
   * @param {ConnectionDescriptor} connectionInfo - An object describing the connection (target, cost).
   */
  registerConnection(originVertexId, connectionInfo) {
    const currentVertex = this.retrieveOrCreateVertex(originVertexId);
    // Ensure the vertex was successfully retrieved or created before adding a connection.
    if (currentVertex) {
      currentVertex.attachConnection(connectionInfo);
      this.totalEdgesCount++; // Increment the global edge count for the graph.
    } else {
      console.warn(`Failed to register connection from invalid origin vertex ID: ${originVertexId}.`);
    }
  }

  /**
   * Iterates through all vertices in the graph and aggregates a specific numeric property
   * using a provided accessor function.
   * @param {function(GraphVertex): number} propertyAccessorFn - A function that takes a GraphVertex
   *   and returns a numeric value to be aggregated.
   * @returns {number} The sum of the property values across all vertices.
   */
  aggregateVertexProperties(propertyAccessorFn) {
    let accumulatedValue = 0;
    if (this.vertexMap.size === 0) {
      return 0; // Return 0 if the graph contains no vertices.
    }
    // Use a for...of loop for explicit iteration over map values.
    for (const currentVertex of this.vertexMap.values()) {
      const value = propertyAccessorFn(currentVertex);
      // Validate that the accessor function returns a valid number.
      if (typeof value === 'number' && !isNaN(value)) {
        accumulatedValue += value;
      } else {
        console.warn(`Property accessor function returned a non-numeric or NaN value for vertex ${currentVertex.vertexIdentifier}. Skipping this value.`);
      }
    }
    return accumulatedValue;
  }

  /**
   * Determines if the current graph topology allows for an Eulerian traversal
   * (either an Eulerian path or an Eulerian circuit).
   *
   * An Eulerian circuit exists if all vertices have even degrees.
   * An Eulerian path exists if exactly two vertices have odd degrees.
   * The original problem statement had a specific constraint for nodes 1 and 2
   * when an Eulerian path exists.
   *
   * @returns {boolean} True if an Eulerian traversal is possible according to the rules, false otherwise.
   */
  isEulerianTraversable() {
    // Trivial case: An empty graph (no edges) can be considered traversable.
    if (this.totalEdgesCount === 0) {
      return true;
    }

    let oddDegreeVertexCount = 0;
    const specificOddVertices = []; // To store the IDs of vertices with odd degrees.

    // Iterate through all vertices to count how many have an odd degree.
    // This combines the logic of the original `countNode` calls into a single pass.
    for (const vertex of this.vertexMap.values()) {
      if (vertex.hasOddDegree()) {
        oddDegreeVertexCount++;
        specificOddVertices.push(vertex.vertexIdentifier);
      }
    }

    // For any undirected graph, the sum of all vertex degrees (2 * number of edges)
    // is always an even number. Therefore, the check `totalDegreeSum % 2`
    // from the original `canPatrol` method is redundant and will always be 0.
    // We remove this non-essential check.

    // Evaluate the conditions for an Eulerian traversal.
    if (oddDegreeVertexCount === 0) {
      // If no vertices have odd degrees, an Eulerian circuit exists.
      return true;
    } else if (oddDegreeVertexCount === 2) {
      // If exactly two vertices have odd degrees, an Eulerian path exists.
      // The original problem had a specific constraint that these two nodes
      // must be vertices with IDs 1 and 2. We explicitly check this.
      const hasSpecificOddPair = specificOddVertices.includes(1) && specificOddVertices.includes(2);
      if (hasSpecificOddPair) {
        // console.log("Eulerian path detected between specific nodes 1 and 2.");
        return true;
      } else {
        // An Eulerian path exists, but not between the required specific nodes (1 and 2).
        // Based on the original code's logic, this scenario should return false.
        return false;
      }
    }
    // If there is any other number of odd-degree vertices (e.g., 1, 3, or more than 2),
    // no Eulerian path or circuit is possible.
    return false;
  }
}

// Global instance of the network analyzer.
const networkAnalyzer = new NetworkTopology();
let graphSetCounter = 0; // Helper variable to count processed graph sets.

// Iterates through the processed input lines, building and analyzing graphs.
for (const edgeTuple of connectionTuples) {
  const [originId, destinationId] = edgeTuple;

  // The (0, 0) tuple acts as a sentinel to trigger graph analysis and reset for the next graph.
  if (originId === 0 && destinationId === 0) {
    graphSetCounter++;
    // console.log(`--- Processing Graph Set #${graphSetCounter} ---`);
    const traversalResult = networkAnalyzer.isEulerianTraversable() ? 'OK' : 'NG';
    console.log(traversalResult);
    networkAnalyzer.prepareTopology(); // Reset for the next graph in the input stream.
    continue; // Move to the next input line.
  }

  // Basic validation for edge tuples: ensure they are pairs of numbers.
  if (edgeTuple.length !== 2 || typeof originId !== 'number' || typeof destinationId !== 'number' || isNaN(originId) || isNaN(destinationId)) {
    console.warn(`Skipping malformed or incomplete input line: ${edgeTuple.join(' ')}`);
    continue;
  }

  // For an undirected graph, each input pair (source, dest) implies two connections:
  // one from source to dest, and one from dest to source. This ensures accurate
  // degree counts for Eulerian path/circuit checks.
  networkAnalyzer.registerConnection(originId, new ConnectionDescriptor(destinationId));
  networkAnalyzer.registerConnection(destinationId, new ConnectionDescriptor(originId));
}

// After processing all input lines, check if there's any remaining graph data
// that wasn't terminated by a (0,0) sentinel. This ensures the last graph
// in the input is also processed if not explicitly terminated.
if (networkAnalyzer.vertexMap.size > 0 || networkAnalyzer.totalEdgesCount > 0) {
  graphSetCounter++;
  // console.log(`--- Processing final Graph Set #${graphSetCounter} ---`);
  const finalTraversalResult = networkAnalyzer.isEulerianTraversable() ? 'OK' : 'NG';
  console.log(finalTraversalResult);
  // No need to call prepareTopology here as the program is about to exit.
}
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process raw input string into structured segments.
const cleanedInputString = rawInputData.trim();
const connectionDescriptors = cleanedInputString.split('\n');

// Parse connection data into numerical pairs.
const parsedLinkData = connectionDescriptors.map((lineSegment) => {
  // Basic validation for the line segment format.
  if (typeof lineSegment !== 'string' || lineSegment.length === 0) {
    return [NaN, NaN]; // Mark as invalid.
  }
  const parts = lineSegment.split(' ');
  // Ensure we have exactly two numerical parts.
  if (parts.length !== 2) {
    return [NaN, NaN];
  }
  const numericParts = parts.map(Number);
  // Return if both parts are valid numbers.
  return (isNaN(numericParts[0]) || isNaN(numericParts[1])) ? [NaN, NaN] : numericParts;
}).filter(pair => !isNaN(pair[0]) && !isNaN(pair[1])); // Filter out any lines that failed parsing.


// Represents a directed connection from one vertex to another, with an optional cost.
class ConnectionDescriptor {
  // Initializes a connection with a target vertex and an optional traversal cost.
  constructor(targetVertexId, connectionCost = 1) {
    this.targetVertexId = targetVertexId; // The identifier of the vertex this connection leads to.
    this.connectionCost = connectionCost; // The cost associated with traversing this connection.
  }

  // Provides a clear way to access the destination ID.
  get destinationIdentifier() {
    return this.targetVertexId;
  }
}

// Represents a vertex (node) within the network, holding its outgoing connections.
class Vertex {
  // Initializes a new vertex with an empty list of outgoing connections.
  constructor() {
    this.outgoingLinks = []; // Stores instances of ConnectionDescriptor.
  }

  // Adds a new outgoing connection to this vertex's list.
  attachLink(linkDefinition) {
    // Basic type validation for the connection object.
    if (!(linkDefinition instanceof ConnectionDescriptor)) {
      console.warn("Attempted to attach an invalid link definition to a vertex. Skipping.");
      return;
    }
    this.outgoingLinks.push(linkDefinition);
  }

  // Checks if the total number of outgoing connections from this vertex is odd.
  // This is a key property for determining Eulerian paths.
  isDegreeCountOdd() {
    const degreeValue = this.outgoingLinks.length;
    // An explicit check for oddness.
    return (degreeValue % 2 === 1);
  }

  // Getter for the total number of outgoing connections.
  get totalDegree() {
    return this.outgoingLinks.length;
  }
}

// Represents the entire network structure, managing vertices and their interconnections.
class NetworkStructure {
  // Initializes the network upon creation.
  constructor() {
    this.resetNetworkState(); // Delegates initial setup to a dedicated method.
  }

  // Resets the internal state of the network, effectively clearing all vertices and connections.
  resetNetworkState() {
    this.vertexRegistry = new Map(); // Stores Vertex objects, keyed by their unique ID.
    // Could add other state variables here, like totalEdgeCount, etc.
  }

  // Retrieves an existing vertex from the registry or creates a new one if it doesn't exist.
  // Ensures that any referenced vertex is always present in the network.
  accessOrCreateVertex(vertexIdentifier) {
    // Robust validation for the vertex identifier.
    if (typeof vertexIdentifier !== 'number' || isNaN(vertexIdentifier) || vertexIdentifier < 0) {
      console.error(`Invalid or negative vertex identifier provided: ${vertexIdentifier}. Using a placeholder.`);
      // In a real application, you might throw an error or handle it differently.
      // For now, we'll return a new, isolated vertex to prevent crashing.
      return new Vertex();
    }

    // Check if the vertex already exists in the registry.
    if (!this.vertexRegistry.has(vertexIdentifier)) {
      // If not found, create a new Vertex instance and add it.
      const newVertexInstance = new Vertex();
      this.vertexRegistry.set(vertexIdentifier, newVertexInstance);
    }
    // Return the existing or newly created vertex instance.
    return this.vertexRegistry.get(vertexIdentifier);
  }

  // Establishes a directed link (edge) from a source vertex to a target vertex.
  // This method ensures the source vertex exists before adding the link.
  establishLink(sourceIdentifier, linkDetails) {
    // Validate the linkDetails to ensure it's a proper ConnectionDescriptor.
    if (!(linkDetails instanceof ConnectionDescriptor)) {
      console.warn("Attempted to establish a link with invalid details. Skipping.");
      return;
    }

    // Retrieve or create the source vertex using its identifier.
    const sourceVertex = this.accessOrCreateVertex(sourceIdentifier);
    // Attach the new connection to the source vertex's outgoing links.
    sourceVertex.attachLink(linkDetails);
  }

  // Calculates the total number of vertices that have an odd degree.
  // This count is fundamental for determining the existence of Eulerian paths or circuits.
  calculateOddDegreeVerticesCount() {
    let oddDegreeCounter = 0; // Initialize a counter for odd-degree vertices.
    // Iterate over all Vertex objects currently registered in the network.
    for (const currentVertex of this.vertexRegistry.values()) {
      // Check if the current vertex's degree is odd.
      if (currentVertex.isDegreeCountOdd()) {
        oddDegreeCounter++; // Increment the counter if it is.
      }
    }
    return oddDegreeCounter;
  }

  // Determines if an Eulerian path (a path visiting every edge exactly once)
  // is possible in the current network, specifically between nodes 1 and 2.
  // For an undirected graph, an Eulerian path exists if and only if there are
  // exactly zero or two vertices with an odd degree. If two, they are the start/end.
  checkPatrolEligibility() {
    const totalOddDegreeVertices = this.calculateOddDegreeVerticesCount();

    // Condition 1: An Eulerian path requires exactly two odd-degree vertices.
    // If this primary condition is not met, a patrol between specific points is impossible.
    if (totalOddDegreeVertices !== 2) {
      return false; // Cannot form an Eulerian path.
    }

    // Condition 2: For the specific patrol problem, the designated start (node 1)
    // and end (node 2) points must be *the* two odd-degree vertices.
    const designatedStartNode = this.vertexRegistry.get(1);
    const designatedEndNode = this.vertexRegistry.get(2);

    // If either designated node doesn't exist in the network, or if they don't
    // individually possess an odd degree, then the specific patrol path isn't possible.
    if (!designatedStartNode || !designatedEndNode ||
        !designatedStartNode.isDegreeCountOdd() || !designatedEndNode.isDegreeCountOdd()) {
      return false; // The specific start/end points are not the required odd-degree vertices.
    }

    // If both conditions are met (exactly two odd-degree vertices, and those are 1 and 2),
    // then an Eulerian path between node 1 and node 2 is indeed possible.
    return true;
  }
}

// Instantiate the network tracking object.
const connectivityTracker = new NetworkStructure();
let processedGraphRounds = 0; // Counter for the number of graph definitions processed.

// Iterate through the parsed link data to construct and evaluate networks.
for (let i = 0; i < parsedLinkData.length; i++) {
  const currentLinkEntry = parsedLinkData[i];
  const sourceNodeIdentifier = currentLinkEntry[0];
  const targetNodeIdentifier = currentLinkEntry[1];

  // The "0 0" pair acts as a sentinel, signaling the end of a network definition.
  // Upon encountering it, we evaluate the current network and reset for the next.
  if (sourceNodeIdentifier === 0 && targetNodeIdentifier === 0) {
    processedGraphRounds++; // Increment the counter for completed graph processing rounds.
    // Perform the patrol eligibility check for the network just defined.
    const patrolFeasible = connectivityTracker.checkPatrolEligibility();
    console.log(patrolFeasible ? 'OK' : 'NG');
    // Reset the network's state to prepare for processing the next set of connections.
    connectivityTracker.resetNetworkState();
    continue; // Move to the next line of input, skipping the sentinel itself.
  }

  // Establish a bidirectional link between the source and target nodes.
  // This means adding two directed connections to represent a single undirected edge.
  connectivityTracker.establishLink(sourceNodeIdentifier, new ConnectionDescriptor(targetNodeIdentifier));
  connectivityTracker.establishLink(targetNodeIdentifier, new ConnectionDescriptor(sourceNodeIdentifier));
}

// --- Post-loop Processing and Robustness Addition ---
// This block handles scenarios where the input might not end with a "0 0" sentinel,
// or if there's only a single graph definition without a final sentinel.

// If no "0 0" sentinel was encountered throughout the entire input, but there was data,
// it implies a single graph definition that needs to be evaluated.
if (processedGraphRounds === 0 && connectivityTracker.vertexRegistry.size > 0) {
    console.log(connectivityTracker.checkPatrolEligibility() ? 'OK' : 'NG');
}
// If there were multiple rounds, but the last one didn't explicitly end with "0 0"
// (e.g., EOF reached after graph data but before sentinel), and there's remaining data
// in the current graph, process it.
else if (processedGraphRounds > 0 && connectivityTracker.vertexRegistry.size > 0) {
    // This condition might overlap with the above if the very last line is not 0 0.
    // It's a safety net for potentially malformed input sequences.
    console.log(connectivityTracker.checkPatrolEligibility() ? 'OK' : 'NG');
}
// If processedGraphRounds > 0 and vertexRegistry.size === 0, it means the last
// '0 0' was correctly processed, and no new connections were added after it.
// No action needed in that specific case.
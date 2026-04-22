// This script reads graph adjacency data from standard input,
// constructs an undirected graph, and then evaluates specific conditions
// to determine if the graph can be "patrolled" according to a predefined set of rules.
// The output for each graph scenario is either "OK" or "NG".

// --- Core Utility for Input Acquisition ---

// Reads the entire content from the standard input stream.
const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// --- Component Classes for Graph Structure ---

/**
 * Represents a directed link or connection from one vertex to another
 * within the graph. For unweighted graphs, the cost is typically uniform.
 */
class GraphLink {
  /**
   * Initializes a new graph link.
   * @param {number} destinationNodeId - The unique identifier of the node
   *   this link points to.
   * @param {number} [connectionValue=1] - An optional value associated with
   *   traversing this link. Defaults to 1 for simple adjacency.
   */
  constructor(destinationNodeId, connectionValue = 1) {
    this.destinationNodeId = destinationNodeId;
    this.connectionValue = connectionValue; // Often 1 for basic connectivity problems.
  }
}

/**
 * Represents a single point (vertex/node) in the graph.
 * It maintains a collection of all outgoing links from itself.
 */
class GraphNode {
  /**
   * Constructs a new graph node, initializing its list of adjacent links.
   */
  constructor() {
    // Array to store all links originating from this node.
    this.adjacentLinks = [];
  }

  /**
   * Adds a new outgoing link from this node to its collection.
   * @param {GraphLink} newLink - The GraphLink object representing the new connection.
   */
  addOutgoingLink(newLink) {
    // A basic check to ensure the added item is indeed a link.
    if (!(newLink instanceof GraphLink)) {
      console.error("Attempted to add an invalid object as a graph link.");
      return;
    }
    this.adjacentLinks.push(newLink);
  }

  /**
   * Computes the degree of this node, which is the total count of its
   * outgoing links. In an undirected graph, this is simply its degree.
   * @returns {number} The degree of the node.
   */
  calculateNodeDegree() {
    return this.adjacentLinks.length;
  }

  /**
   * Determines if the degree of this node is an odd number.
   * This is a key property for Eulerian path/circuit determination.
   * @returns {boolean} True if the node's degree is odd, false otherwise.
   */
  isNodeDegreeOdd() {
    const currentDegree = this.calculateNodeDegree();
    return (currentDegree % 2 !== 0);
  }
}

/**
 * Manages the entire graph structure, including all its nodes and their interconnections.
 * Provides methods for graph construction, analysis, and evaluation based on problem rules.
 */
class GraphManager {
  /**
   * Creates a new instance of the graph manager.
   */
  constructor() {
    this.resetGraphState(); // Initialize the graph upon creation.
  }

  /**
   * Resets the graph to an empty state, clearing all existing nodes and links.
   * This is typically used to prepare for processing a new graph scenario.
   */
  resetGraphState() {
    // A Map is used for efficient storage and retrieval of nodes by their unique ID.
    this.nodeRegistry = new Map();
  }

  /**
   * Retrieves a graph node by its identifier. If the node does not exist yet,
   * it is created and added to the registry before being returned.
   * @param {number} nodeId - The unique identifier for the node.
   * @returns {GraphNode} The GraphNode instance corresponding to the given ID.
   */
  retrieveOrCreateNode(nodeId) {
    // Defensive programming: ensure nodeId is a valid number.
    if (typeof nodeId !== 'number' || !Number.isInteger(nodeId) || nodeId < 0) {
      // In a production system, this might throw an error or handle invalid IDs differently.
      console.warn(`Warning: Attempted to access or create a node with an invalid ID: ${nodeId}`);
      // For the purpose of this clone, we'll proceed assuming valid input structure.
    }

    if (!this.nodeRegistry.has(nodeId)) {
      this.nodeRegistry.set(nodeId, new GraphNode());
    }
    return this.nodeRegistry.get(nodeId);
  }

  /**
   * Establishes an undirected edge between two specified nodes.
   * This means adding a link from node A to node B, and another from B to A.
   * @param {number} firstNodeId - The identifier of the first node.
   * @param {number} secondNodeId - The identifier of the second node.
   */
  establishUndirectedEdge(firstNodeId, secondNodeId) {
    // Retrieve or create both nodes involved in the edge.
    const nodeA = this.retrieveOrCreateNode(firstNodeId);
    const nodeB = this.retrieveOrCreateNode(secondNodeId);

    // Add a link from the first node to the second.
    nodeA.addOutgoingLink(new GraphLink(secondNodeId));
    // Add a link from the second node to the first, completing the undirected edge.
    nodeB.addOutgoingLink(new GraphLink(firstNodeId));
  }

  /**
   * Counts the total number of distinct nodes currently registered in the graph.
   * @returns {number} The count of nodes.
   */
  getRegisteredNodeCount() {
    return this.nodeRegistry.size;
  }

  /**
   * Iterates through all nodes in the graph and counts how many of them
   * have an odd degree. This is a primary metric for Eulerian properties.
   * @returns {number} The total count of nodes with an odd degree.
   */
  countNodesWithOddDegree() {
    let oddDegreeNodeCounter = 0;
    // Iterate over all node instances stored in the registry.
    for (const currentNode of this.nodeRegistry.values()) {
      if (currentNode.isNodeDegreeOdd()) {
        oddDegreeNodeCounter++;
      }
    }
    return oddDegreeNodeCounter;
  }

  /**
   * Evaluates whether the current graph configuration meets the criteria
   * for being "patrollable" as defined by the problem statement.
   * This involves checking the number of odd-degree nodes and specific node IDs.
   * @returns {boolean} True if the graph is patrollable, false otherwise.
   */
  isGraphPatrollable() {
    const totalOddDegreeNodes = this.countNodesWithOddDegree();
    const numberOfDistinctNodes = this.getRegisteredNodeCount();

    // Specific Condition 1 from the original problem:
    // If the total number of distinct nodes in the graph is an even number,
    // the graph is considered 'NG' (Not Good / Not Patrollable).
    if (numberOfDistinctNodes % 2 === 0) {
      return false;
    }

    // Condition 2: If there are no nodes with an odd degree, it implies
    // an Eulerian circuit exists, making the graph patrollable ('OK').
    if (totalOddDegreeNodes === 0) {
      return true;
    }

    // Condition 3: If there are exactly two nodes with an odd degree, AND
    // these specific nodes are identified as '1' and '2', it implies an
    // Eulerian path exists between them, making the graph patrollable ('OK').
    if (totalOddDegreeNodes === 2) {
      // Attempt to retrieve the specific nodes.
      const nodeWithIdOne = this.nodeRegistry.get(1);
      const nodeWithIdTwo = this.nodeRegistry.get(2);

      // Check if both nodes exist and indeed have odd degrees.
      const isNodeOneOdd = nodeWithIdOne ? nodeWithIdOne.isNodeDegreeOdd() : false;
      const isNodeTwoOdd = nodeWithIdTwo ? nodeWithIdTwo.isNodeDegreeOdd() : false;

      if (isNodeOneOdd && isNodeTwoOdd) {
        return true;
      }
    }

    // If none of the above specific conditions are met, the graph is not patrollable.
    return false;
  }
}

// --- Main Program Execution Logic ---

// Pre-process the raw input data: remove leading/trailing whitespace and split into lines.
const inputLines = rawInputBuffer.trim().split('\n');

// Parse each line into an array of two numbers, representing a pair of connected nodes.
const adjacencyPairs = inputLines.map((line) =>
  line.split(' ').map((strNum) => parseInt(strNum, 10))
);

// Initialize the graph manager for processing.
const graphHandler = new GraphManager();

// A counter to keep track of how many graph scenarios have been processed.
let processedScenarioCount = 0;

// Iterate through each pair of numbers from the input.
for (const [firstId, secondId] of adjacencyPairs) {
  // The input pair (0, 0) serves as a sentinel value, indicating the end
  // of a graph definition and signaling that the current graph should be evaluated.
  if (firstId === 0 && secondId === 0) {
    processedScenarioCount++; // Increment the scenario counter.

    // Perform the patrollability check on the graph built so far.
    const isCurrentGraphOK = graphHandler.isGraphPatrollable();

    // Output the result as required by the problem.
    console.log(isCurrentGraphOK ? 'OK' : 'NG');

    // Reset the graph manager to prepare for the next graph scenario.
    graphHandler.resetGraphState();
    continue; // Proceed to the next line of input.
  }

  // If it's not the sentinel (0,0) pair, it represents an edge.
  // Add this undirected edge to the current graph structure.
  graphHandler.establishUndirectedEdge(firstId, secondId);
}
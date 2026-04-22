// This variable holds the Node.js 'fs' module for file system operations.
const fileSystemAccess = require('node:fs');
// Alias for the readFileSync method for clearer naming within this script.
const readTextFileContent = fileSystemAccess.readFileSync;

/*
 * Gathers raw input data from the standard input stream.
 * The data is expected to be a UTF-8 encoded string containing graph details.
 */
const rawFileData = readTextFileContent('/dev/stdin', 'utf8');

// First, remove any leading/trailing whitespace, then split the data into individual lines.
const processedLines = rawFileData.trim().split('\n');

// Next, parse each textual line into an array of numerical connections.
const graphConnectionsData = processedLines.map(
  (currentLine) => {
    // For each line, split it by spaces and convert each segment to an integer base 10.
    return currentLine.split(' ').map(valStr => parseInt(valStr, 10));
  }
);

/**
 * Represents a directed connection, or an 'arc', from one point to another in the network.
 * It encapsulates the identifier of the destination point and an optional associated cost.
 */
class Link {
  // Initializes a new Link with its destination and an optional default cost.
  constructor ( endPointIdentifier, costValue = 1 ) {
    this.endPointIdentifier = endPointIdentifier; // The unique ID of the point this link leads to.
    this.costValue = costValue;                   // The numerical cost or weight of this particular link.
  }
}

/**
 * Defines a 'Point' (or vertex) within a network structure.
 * Each point maintains a collection of all 'Links' that originate from it.
 */
class Point {
  // Default constructor for a Point, setting up its outgoing links collection.
  constructor () {
    this.outgoingLinks = []; // An array to store all Link objects that start from this Point.
  }

  /**
   * Adds a new link to the point's existing list of outgoing connections.
   * @param {Link} aLink - The link object to be appended to this point's connections.
   */
  appendLink (aLink) {
    this.outgoingLinks.push(aLink);
  }

  /**
   * Determines if the total count of outgoing links from this point is an odd number.
   * This is a check for the parity of the point's degree in the context of an undirected graph.
   * @returns {boolean} Returns true if the count of outgoing links is odd, false otherwise.
   */
  hasOddDegreeCount () {
    // The double-negation (!!) ensures a boolean return value.
    return !!(this.outgoingLinks.length % 2);
  }
}

/**
 * Manages the overall structure of a network, including its points and the links between them.
 * Provides functionalities for creating, modifying, and querying the network's topology.
 */
class NetworkStructure {
  // Upon instantiation, the network structure is immediately prepared for use.
  constructor() {
    this.setupStructure();
  }

  /**
   * Initializes or completely resets the internal registry that stores all points in the network.
   * Calling this method clears all previously registered points and their connections.
   */
  setupStructure () {
    // A Map is used to efficiently store and retrieve Point objects by their unique identifiers.
    this.pointRegistry = new Map();
  }

  /**
   * Retrieves a specific point from the registry using its identifier.
   * If a point with the given identifier does not yet exist, a new one is created and registered.
   * @param {number} startIdentifier - The unique numerical ID of the point to find or create.
   * @param {any} dummyLinkParam - An intentionally unused parameter, maintaining original signature.
   * @returns {Point} The Point object corresponding to the provided identifier.
   */
  obtainPoint (startIdentifier, dummyLinkParam) {
    // Check if the point is already present in our registry.
    if ( !this.pointRegistry.has(startIdentifier) ) {
      // If not, instantiate a new Point and add it to the registry.
      this.pointRegistry.set(startIdentifier, new Point());
    }
    // Return the Point instance, whether it was existing or newly created.
    return this.pointRegistry.get(startIdentifier);
  }

  /**
   * Establishes a directed link originating from a specified point.
   * The origin point is automatically created if it doesn't already exist in the network.
   * @param {number} originId - The identifier of the point from which the link originates.
   * @param {Link} conn - The Link object representing the connection to be added.
   */
  establishLink ( originId, conn ) {
    const currentPoint = this.obtainPoint(originId); // Get or create the starting point.
    currentPoint.appendLink(conn);                   // Add the provided link to this point's outgoing connections.
  }

  /**
   * Computes the total number of points within the network that possess an odd degree.
   * An odd degree signifies an odd count of outgoing links from that specific point.
   * @returns {number} The aggregated count of all points having an odd degree.
   */
  determineOddDegreeCount () {
    // Convert the Map's values (Point objects) into an array for easier processing.
    // Then, map each point to 1 if it has an odd degree, or 0 otherwise.
    // Finally, reduce the array to a single sum representing the total count.
    return [...this.pointRegistry.values()]
      .map( vtxElement => vtxElement.hasOddDegreeCount() ? 1 : 0 )
      .reduce( (accumulatedSum, currentCount) => accumulatedSum + currentCount );
  }

  /**
   * Assesses whether an Eulerian traversal (either a path or a circuit) is possible
   * within the current network structure. This determination relies on the number of
   * vertices with an odd degree, according to established graph theory principles.
   * @returns {boolean} True if an Eulerian traversal is feasible, false if not.
   */
  checkEulerianTraversalPossible () {
    // Retrieve the total count of points that have an odd number of connections.
    const totalOddDegreePoints = networkInstance.determineOddDegreeCount(); // Refers to the global instance.

    // Condition 1: If the total number of distinct points in the registry is even,
    // it's generally not possible for a specific type of patrol (as implied by problem context).
    if ( !( this.pointRegistry.size % 2 ) ) {
      return false;
    }
    // Condition 2: An Eulerian circuit is possible if there are no odd-degree points.
    else if ( totalOddDegreePoints === 0 ) {
      return true;
    }
    // Condition 3: An Eulerian path is possible if exactly two points have an odd degree.
    // The problem specifies these must be points with IDs 1 and 2.
    else if ( totalOddDegreePoints === 2 && ( networkInstance.obtainPoint(1).hasOddDegreeCount() && networkInstance.obtainPoint(2).hasOddDegreeCount() ) ) {
      return true;
    }

    // For all other scenarios (e.g., more than two odd-degree points), no Eulerian path or circuit exists.
    return false;
  }
}

// Create a single, global instance of our network structure.
const networkInstance = new NetworkStructure();

// Iterate through each pair of vertex identifiers obtained from the input data.
graphConnectionsData.forEach(
  ( [startVertexId, endVertexId] ) => {
    // Special control sequence: a pair of (0, 0) indicates the end of processing for the current graph.
    if ( startVertexId === 0 && endVertexId === 0 ) {
      // Output the result of the Eulerian traversal check to the console.
      console.info( networkInstance.checkEulerianTraversalPossible() ? 'OK' : 'NG' );
      networkInstance.setupStructure(); // Reset the entire network for the next graph in sequence.
      return; // Exit the current iteration of the forEach loop.
    }

    // For valid connection pairs, establish links in both directions to represent an undirected edge.
    networkInstance.establishLink( startVertexId, new Link(endVertexId) );
    networkInstance.establishLink( endVertexId, new Link(startVertexId) );
  }
);
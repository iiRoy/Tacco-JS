/*
 * This JavaScript file processes graph data from standard input
 * to determine if a specific patrolling condition can be met.
 * It uses custom Edge, Node, and Graph classes.
 * The input format is a series of source-destination pairs,
 * with '0 0' indicating the end of a graph's definition and a trigger
 * to check the patrolling condition.
 */

// Import the 'fs' module for file system operations.
// Read the entire input from standard input as a UTF-8 string.
const input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' );


// Process the raw input string:
// 1. Remove leading/trailing whitespace.
// 2. Split the string into an array of lines.
const inputs = input . trim () . split ( '\n' );


// Map each input line (string) to an array of numbers.
// Each line represents an adjacency pair (source, destination).
const adj = inputs . map ( ( s ) => s . split ( ' ' ) . map ( Number ) );



/**
 * Represents an edge in the graph.
 * An edge connects two nodes and can have an associated weight.
 */
class Edge {

  /**
   * Constructs a new Edge instance.
   * @param {number} dest - The identifier of the destination node.
   * @param {number} [weight=1] - The weight of the edge; defaults to 1 if not provided.
   */
  constructor ( dest , weight = 1 ) {
    this . dest   = dest;   // Store the destination node's identifier.
    this . weight = weight; // Store the weight of this edge.
  }

} // End of Edge class definition.



/**
 * Represents a node within the graph structure.
 * Each node maintains an adjacency list of outgoing edges.
 */
class Node {

  /**
   * Constructs a new Node instance.
   * Initializes an empty list to hold edges connected to this node.
   */
  constructor () {
    this . list = []; // Adjacency list: an array of Edge objects.
  }


  /**
   * Adds an edge to this node's adjacency list.
   * @param {Edge} edge - The edge object to be added.
   */
  addEdge ( edge ) {
    this . list . push ( edge );
  }


  /**
   * Checks if the degree (number of connected edges) of this node is odd.
   * @returns {boolean} True if the node's degree is odd, false otherwise.
   */
  isOdd () {
    // The !! operator explicitly converts the result of the modulo operation to a boolean.
    return !! ( this . list . length % 2 );
  }

} // End of Node class definition.



/**
 * Manages the graph structure, including nodes and their connections.
 * Provides methods for graph construction, traversal, and property checking.
 */
class Graph {

  /**
   * Constructs a new Graph instance.
   * Automatically calls the initialization method upon creation.
   */
  constructor () {
    this . init ();
  }


  /**
   * Initializes or re-initializes the graph's internal data structures.
   * Clears all existing nodes from the graph.
   */
  init () {
    this . map = new Map (); // A Map to store Node objects, keyed by their identifier.
  }


  /**
   * Retrieves a Node object corresponding to a given source identifier.
   * If the node does not exist, it is created and added to the graph.
   * @param {number} source - The identifier of the source node to retrieve or create.
   * @param {any} edge - An unused parameter, maintained for Type I clone fidelity.
   * @returns {Node} The Node object associated with the source identifier.
   */
  getNode ( source , edge ) { // The 'edge' parameter is not utilized within this method.
    if ( ! this . map . has ( source ) ) {
      this . map . set ( source , new Node () );
    }
    return this . map . get ( source );
  }


  /**
   * Adds an edge from a source node to a destination node in the graph.
   * Ensures the source node exists before adding the edge to its adjacency list.
   * @param {number} source - The identifier of the node from which the edge originates.
   * @param {Edge} edge - The Edge object representing the connection.
   */
  addEdge ( source , edge ) {
    const node = this . getNode ( source ); // Get or create the source node.
    node . addEdge ( edge );                 // Add the edge to the source node's list.
  }


  /**
   * Counts or sums values across all nodes in the graph using a provided iterator function.
   * @param {function(Node): number} iterator - A function that takes a Node object
   *                                            and returns a numerical value.
   * @returns {number} The sum of all values returned by the iterator for each node.
   */
  countNode ( iterator ) {
    // Convert map values (Node objects) to an array,
    // apply the iterator function to each node,
    // then sum the results using reduce.
    return Array . from ( this . map . values () ) . map ( iterator ) . reduce ( ( a , b ) => a + b );
  }


  /**
   * Determines if the graph can be patrolled according to specific Eulerian path/circuit rules.
   * A graph can be patrolled if:
   * 1. The total number of edges (sum of degrees) is even.
   * 2. It has zero odd-degree nodes (Eulerian circuit).
   * 3. It has exactly two odd-degree nodes, and these specific nodes are 1 and 2 (Eulerian path).
   * @returns {boolean} True if the graph meets the patrolling criteria, false otherwise.
   */
  canPatrol () {
    // Calculate the total sum of degrees for all nodes in the graph.
    const totalNode = graph . countNode ( node => node . list . length );

    // Count the number of nodes that have an odd degree.
    const totalOddNode = graph . countNode ( node => node . isOdd () ? 1 : 0 );

    // Check condition 1: If the total number of edges (sum of degrees) is odd, it's impossible.
    if ( totalNode % 2 ) {
      return false;
    }
    // Check condition 2: If there are no odd-degree nodes, an Eulerian circuit exists.
    else if ( totalOddNode === 0 ) {
      return true;
    }
    // Check condition 3: If there are exactly two odd-degree nodes, and they are nodes 1 and 2.
    else if ( totalOddNode === 2 && ( graph . getNode ( 1 ) . isOdd () && graph . getNode ( 2 ) . isOdd () ) ) {
      return true;
    }

    // If none of the above conditions are met, the graph cannot be patrolled.
    return false;
  }

} // End of Graph class definition.


// Instantiate a new Graph object to begin processing.
const graph = new Graph ();

// Iterate over each adjacency pair read from the input.
adj . forEach ( ( [ source , dest ] ) => {
  // Check for the termination condition (0 0).
  if ( source === 0 && dest === 0 ) {
    // When '0 0' is encountered, evaluate the current graph's patrolling capability.
    console . log ( graph . canPatrol () ? 'OK' : 'NG' );
    // Re-initialize the graph for the next set of inputs (if any).
    graph . init ();
    return; // Exit the forEach callback for this specific '0 0' entry.
  }
  // For valid source-destination pairs, add edges to the graph.
  // Assuming an undirected graph, add edges in both directions.
  graph . addEdge ( source , new Edge ( dest ) );
  graph . addEdge ( dest , new Edge ( source ) );
} );
/*
 * This file processes graph data from standard input.
 * It defines classes for Edge, Node, and Graph to represent the graph structure.
 * The primary goal is to determine if a specific graph patrol condition can be met.
 */

// Importing the 'fs' (file system) module to read input.
const input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Reads the entire content of /dev/stdin as a UTF-8 string.

// --- Data preprocessing starts here ---

// Trim whitespace from the input string and split it into an array of lines.
const inputs = input . trim ( ) . split ( '\n' ) ; // Each element in 'inputs' is a line from the input.

// Map each line to an array of numbers representing edges.
// 's' is a string like "1 2", which is split by space and then converted to numbers.
const adj = inputs . map ( ( s ) => s . split ( ' ' ) . map ( Number ) ) ;

// --- Class Definitions ---

/*
 * Represents an edge in the graph.
 * An edge connects to a destination node and can have an associated weight.
 */
class Edge {

    /**
     * Constructor for the Edge class.
     * @param {number} dest - The destination node identifier.
     * @param {number} weight - The weight of the edge (defaults to 1).
     */
    constructor ( dest , weight = 1 ) {
        this . dest = dest ;    // Store the destination node.
        this . weight = weight ;// Store the edge weight.
    } // End of constructor.

} // End of Edge class definition.


/*
 * Represents a node in the graph.
 * Each node maintains a list of edges originating from it.
 */
class Node {

    // Constructor initializes the list of outgoing edges.
    constructor ( ) {
        this . list = [ ] ; // An array to hold Edge objects.
    }

    /**
     * Adds an edge to this node's list of outgoing edges.
     * @param {Edge} edge - The edge object to add.
     */
    addEdge ( edge ) {
        this . list . push ( edge ) ; // Append the new edge to the list.
    }

    /**
     * Checks if the number of edges connected to this node is odd.
     * (In an undirected graph, this essentially checks the degree parity).
     * @returns {boolean} True if the degree is odd, false otherwise.
     */
    isOdd ( ) {
        return !! ( this . list . length % 2 ) ; // Double negation converts truthy/falsy to true/false.
    }

} // End of Node class definition.


/*
 * Represents the entire graph structure.
 * Manages nodes and their connections using a Map.
 */
class Graph {

    // Constructor calls the initialization method.
    constructor ( ) {
        this . init ( ) ; // Initialize the graph's internal state.
    }

    /**
     * Initializes or re-initializes the graph.
     * Clears all existing nodes.
     */
    init ( ) {
        this . map = new Map ( ) ; // A Map to store nodes, keyed by their identifier.
    }

    /**
     * Retrieves a node from the graph. If the node does not exist, it creates and adds it.
     * @param {number} source - The identifier of the node to retrieve or create.
     * @returns {Node} The Node object corresponding to the source identifier.
     */
    getNode ( source ) {
        if ( ! this . map . has ( source ) ) { // Check if the node already exists.
            this . map . set ( source , new Node ( ) ) ; // If not, create a new Node and add it to the map.
        }
        return this . map . get ( source ) ; // Return the Node object.
    }

    /**
     * Adds an edge from a source node to a destination node.
     * This method ensures the source node exists before adding the edge.
     * @param {number} source - The identifier of the source node.
     * @param {Edge} edge - The Edge object representing the connection.
     */
    addEdge ( source , edge ) {
        const node = this . getNode ( source ) ; // Get or create the source node.
        node . addEdge ( edge ) ; // Add the provided edge to the source node's edge list.
    }

    /**
     * Counts the number of nodes in the graph that have an odd degree.
     * @returns {number} The total count of odd-degree nodes.
     */
    countOdd ( ) {
        // Convert map values (Node objects) to an array,
        // then map each node to 1 if its degree is odd, else 0,
        // and finally sum these values.
        return Array . from ( this . map . values ( ) ) . map ( node => node . isOdd ( ) ? 1 : 0 ) . reduce ( ( a , b ) => a + b ) ;
    }

    /**
     * Determines if the graph can be patrolled according to specific rules.
     * The rules are: exactly two nodes must have an odd degree, and these two nodes must be nodes 1 and 2.
     * @returns {boolean} True if the patrol conditions are met, false otherwise.
     */
    canPatrol ( ) {
        // First, check if the total count of odd-degree nodes is exactly 2.
        if ( graph . countOdd ( ) !== 2 ) {
            return false ; // If not 2, patrol is not possible.
        }
        // If there are exactly two odd-degree nodes, check if they are nodes 1 and 2.
        // This assumes getNode(1) and getNode(2) will return valid nodes, even if they don't explicitly exist yet.
        // A node with no edges will have an even degree (0).
        return graph . getNode ( 1 ) . isOdd ( ) && graph . getNode ( 2 ) . isOdd ( ) ;
    }

} // End of Graph class definition.

// --- Main execution logic ---

// Create a new instance of the Graph.
const graph = new Graph ( ) ;

// Iterate over each entry in the 'adj' array, which represents an edge.
// Each entry is an array like [source, dest].
adj . forEach ( ( [ source , dest ] ) => {

    // Check for the termination condition: an edge of (0, 0) signifies the end of the current graph's input.
    if ( source === 0 && dest === 0 ) {
        // If it's the termination condition, evaluate the current graph.
        console . log ( graph . canPatrol ( ) ? 'OK' : 'NG' ) ; // Output 'OK' or 'NG' based on patrolability.
        graph . init ( ) ; // Re-initialize the graph for the next test case (if any).
        return ; // Skip further processing for this (0,0) entry.
    }

    // For valid edges, add them to the graph.
    // The problem implies an undirected graph, so add edges in both directions.
    graph . addEdge ( source , new Edge ( dest ) ) ; // Add edge from source to destination.
    graph . addEdge ( dest , new Edge ( source ) ) ; // Add edge from destination to source.

} ) ; // End of forEach loop.
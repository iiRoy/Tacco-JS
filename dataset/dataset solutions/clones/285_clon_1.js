/* This is a Type I clone of the original JavaScript code.
 *
 * It maintains exact structural and logical equivalence to the original,
 * with modifications limited solely to whitespace and comments.
 *
 * The purpose is to demonstrate a visually distinct but functionally identical
 * version of the provided source code.
 */

const   input   =   require  ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


// Process the raw input string
const   inputs   =   input . trim ( ) . split ( '\n' ) ;

/*
 * Convert each line of input into an array of numbers.
 * Each inner array represents an edge [source, destination].
 */
const   adj   =   inputs . map ( ( s )   =>   s . split ( ' ' ) . map ( Number ) ) ;


/**
 * Represents an edge in the graph.
 *
 * @class Edge
 */
class   Edge   {

    /**
     * Creates an instance of Edge.
     * @param {number} dest - The destination node of the edge.
     * @param {number} [weight=1] - The weight of the edge (defaults to 1).
     * @memberof Edge
     */
    constructor ( dest ,   weight   =   1 )   {
        this . dest     =   dest ;
        this . weight   =   weight ;
    }

} // End of Edge class


/**
 * Represents a node in the graph.
 * Each node maintains a list of its outgoing edges.
 *
 * @class Node
 */
class   Node   {

    /**
     * Creates an instance of Node.
     * Initializes an empty list for edges.
     * @memberof Node
     */
    constructor ( )   {
        this . list   =   [ ] ;
    }


    /**
     * Adds an edge to this node's list of outgoing edges.
     * @param {Edge} edge - The edge to add.
     * @memberof Node
     */
    addEdge ( edge )   {
        this . list . push ( edge ) ;
    }


    /**
     * Checks if the number of edges connected to this node is odd.
     * This is useful for determining Euler paths/circuits.
     * @returns {boolean} True if the number of edges is odd, false otherwise.
     * @memberof Node
     */
    isOdd ( )   {
        return   ! ! ( this . list . length   %   2 ) ;
    }

} // End of Node class


/**
 * Represents an undirected graph.
 *
 * @class Graph
 */
class   Graph   {

    /**
     * Creates an instance of Graph.
     * Initializes the graph's internal state.
     * @memberof Graph
     */
    constructor ( )   {
        this . init ( ) ;
    }


    /**
     * Initializes or re-initializes the graph's internal map of nodes.
     * @memberof Graph
     */
    init ( )   {
        this . map   =   new   Map ( ) ;
    }


    /**
     * Retrieves a node from the graph based on its source identifier.
     * If the node does not exist, it is created and added to the map.
     * @param {number} source - The identifier of the source node.
     * @returns {Node} The Node object corresponding to the source identifier.
     * @memberof Graph
     */
    getNode ( source )   {
        if   ( ! this . map . has ( source ) )   {
            this . map . set ( source ,   new   Node ( ) ) ;
        }
        return   this . map . get ( source ) ;
    }


    /**
     * Adds an edge to a specified source node in the graph.
     * @param {number} source - The identifier of the source node.
     * @param {Edge} edge - The edge to add.
     * @memberof Graph
     */
    addEdge ( source ,   edge )   {
        const   node   =   this . getNode ( source ) ;
        node . addEdge ( edge ) ;
    }


    /**
     * Counts the number of nodes in the graph that have an odd degree (odd number of edges).
     * @returns {number} The total count of odd-degree nodes.
     * @memberof Graph
     */
    countOdd ( )   {
        // Iterate over all nodes in the map and check if their degree is odd.
        return   Array . from ( this . map . values ( ) ) . map (   node   =>   node . isOdd ( )   ?   1   :   0   ) . reduce ( ( a ,   b )   =>   a   +   b ) ;
    }


    /**
     * Determines if the graph can be patrolled, based on Euler path/circuit conditions.
     * A graph can be patrolled if:
     *   - It has exactly 0 odd-degree nodes (Euler circuit).
     *   - It has exactly 2 odd-degree nodes, and these specific nodes are 1 and 2.
     *     (This specific condition seems tailored to a particular problem context).
     * @returns {boolean} True if the graph can be patrolled, false otherwise.
     * @memberof Graph
     */
    canPatrol ( )   {
        const   totalOddCount   =   graph . countOdd ( ) ;

        if   ( totalOddCount   ===   0 )   {
            return   false ; // No odd nodes means an Euler circuit, but problem might require specific start/end.
        }   else   if   ( totalOddCount   ===   2   &&   ( graph . getNode ( 1 ) . isOdd ( )   &&   graph . getNode ( 2 ) . isOdd ( ) ) )   {
            return   true ; // Specific case for nodes 1 and 2 being the only odd ones.
        }

        return   false ; // Any other number of odd nodes, or different odd nodes, fails.
    }

} // End of Graph class


// Instantiate a new Graph object
const   graph   =   new   Graph ( ) ;


// Process each adjacency pair from the input
adj . forEach ( ( [ source ,   dest ] )   =>   {

    // Check for the termination condition or graph reset
    if   ( source   ===   0   &&   dest   ===   0 )   {
        // Output the result for the current graph state
        console . log ( graph . canPatrol ( )   ?   'OK'   :   'NG' ) ;

        // Reset the graph for the next set of inputs (if any)
        graph . init ( ) ;

        return ; // Move to the next input pair
    }

    // Add edges for an undirected graph: source to dest
    graph . addEdge ( source ,   new   Edge ( dest ) ) ;

    // and dest to source
    graph . addEdge ( dest ,   new   Edge ( source ) ) ;

} ) ; // End of forEach loop
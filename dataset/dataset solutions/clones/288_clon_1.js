const input = require ('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Reads input from standard input

/*
 * The following lines process the raw input data.
 * First, it trims any leading or trailing whitespace.
 * Then, it splits the input string into an array of lines based on the newline character.
 */
const inputs = input . trim ( ) . split ( '\n' ) ;

// Each line (string) in 'inputs' is further processed.
// It's split by space, and then each part is converted to a number.
// This results in an array of arrays, where each inner array represents an adjacency pair.
const adj = inputs . map ( ( s ) => s . split ( ' ' ) . map ( Number ) ) ;


/*
 * Class definition for an Edge in the graph.
 * An edge connects to a destination node and can optionally have a weight.
 */
class Edge
{
  // Constructor for the Edge class.
  // 'dest' is the identifier of the destination node.
  // 'weight' is an optional parameter, defaulting to 1 if not provided.
  constructor ( dest , weight = 1 )
  {
    this . dest   =   dest ;   // Assigns the destination node identifier.
    this . weight = weight ; // Assigns the edge's weight.
  }
}


/*
 * Class definition for a Node in the graph.
 * Each node maintains a list of edges originating from it.
 */
class Node
{
  // Node class constructor.
  // Initializes an empty array to store outgoing edges.
  constructor ( )
  {
    this . list = [ ] ; // An array to hold Edge objects.
  }

  // Method to add an edge to this node's list of outgoing connections.
  // 'edge' is an instance of the Edge class.
  addEdge ( edge )
  {
    this . list . push ( edge ) ; // Appends the new edge to the list.
  }

  // Determines if the number of edges connected to this node is odd.
  // Returns 'true' if the count is odd, 'false' if it's even.
  isOdd ( )
  {
    return !! ( this . list . length % 2 ) ; // Uses double negation to convert a truthy/falsy number to boolean.
  }
}


/*
 * Class definition for the Graph.
 * Manages all nodes and edges, providing methods to manipulate and query the graph structure.
 */
class Graph
{
  // Graph class constructor.
  // Calls the 'init' method to set up the graph's internal state.
  constructor ( )
  {
    this . init ( ) ; // Initialize the graph's data structures.
  }

  // Initializes or resets the graph's internal map of nodes.
  init ( )
  {
    this . map = new Map ( ) ; // A Map object to store nodes, keyed by their identifier.
  }

  // Retrieves a node from the graph. If the node does not exist, it creates and adds it.
  // 'source' is the identifier of the node to retrieve.
  // 'edge' parameter is present but not used within this method's logic.
  getNode ( source , edge )
  {
    // Checks if the graph map already contains an entry for the given source node.
    if ( ! this . map . has ( source ) )
    {
      // If not, a new Node instance is created and associated with the source identifier.
      this . map . set ( source , new Node ( ) ) ;
    }
    // Returns the Node instance corresponding to the source identifier.
    return this . map . get ( source ) ;
  }

  // Adds an edge to a specified source node in the graph.
  // 'source' is the identifier of the node from which the edge originates.
  // 'edge' is the Edge object to be added.
  addEdge ( source , edge )
  {
    // First, retrieve the Node object for the given source (creating it if it doesn't exist).
    const node = this . getNode ( source ) ;
    // Then, add the provided edge to that node's list of outgoing edges.
    node . addEdge ( edge ) ;
  }

  // Counts the number of nodes in the graph that have an odd degree (an odd number of connected edges).
  countOdd ( )
  {
    // Converts the Map's values (Node objects) into an iterable, then into an array.
    // Each node is then mapped to 1 if its 'isOdd' method returns true, otherwise 0.
    // Finally, these 1s and 0s are summed up to get the total count.
    return Array . from ( this . map . values ( ) )
      . map ( node => node . isOdd ( ) ? 1 : 0 )
      . reduce ( ( a , b ) => a + b ) ;
  }

  // Determines if the graph can be 'patrolled' based on specific rules.
  canPatrol ( )
  {
    // Calculates the total count of nodes with an odd degree within the graph.
    const totalOddCount = graph . countOdd ( ) ;

    // Rule 1: If the total number of nodes in the graph is even, it cannot be patrolled.
    if ( ! ( this . map . size % 2 ) )
    {
      return false ;
    }
    // Rule 2: If there are no nodes with an odd degree, it can be patrolled.
    else if ( totalOddCount === 0 )
    {
      return true ;
    }
    // Rule 3: If there are exactly two nodes with an odd degree, AND these specific nodes are
    // node 1 and node 2 (assuming they exist and are distinct), then it can be patrolled.
    else if ( totalOddCount === 2 && ( graph . getNode ( 1 ) . isOdd ( ) && graph . getNode ( 2 ) . isOdd ( ) ) )
    {
      return true ;
    }
    // If none of the above conditions are met, the graph cannot be patrolled.
    return false ;
  }
}

// Creates a new instance of the Graph class. This 'graph' object will be used throughout the script.
const graph = new Graph ( ) ;

// Iterates over each adjacency pair obtained from the input data.
// Each pair is destructured into 'source' and 'dest' identifiers.
adj . forEach ( ( [ source , dest ] ) =>
{
  // Checks for a specific termination condition: source and destination both being 0.
  if ( source === 0 && dest === 0 )
  {
    // If the termination condition is met, it prints 'OK' or 'NG' based on the graph's patrol status.
    console . log ( graph . canPatrol ( ) ? 'OK' : 'NG' ) ;
    // Resets the graph for potential subsequent test cases (though the loop ends here typically).
    graph . init ( ) ;
    return ; // Exits the current iteration of the forEach loop.
  }

  // For non-termination pairs, edges are added to the graph.
  // An edge is added from the source node to the destination node.
  graph . addEdge ( source , new Edge ( dest ) ) ;
  // For an undirected graph, a reverse edge is also added from destination to source.
  graph . addEdge ( dest , new Edge ( source ) ) ;
} ) ;
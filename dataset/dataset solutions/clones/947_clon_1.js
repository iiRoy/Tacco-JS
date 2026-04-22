const input = require ('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read input from standard input path

// --- Input Processing Section ---
// Trim whitespace from input and split into lines
const inputs = input . trim () . split ( '\n' ) ;
// The first line is 'n', the number of nodes. Convert it to a Number.
const n = Number ( inputs . shift () ) ;
// Process the remaining lines to build the adjacency list.
// Each line represents a node and its children.
const adj = inputs . map ( ( s ) => s . split ( ' ' ) . map ( Number ) ) ;

// --- Data Structure: Queue ---
// A simple queue implementation for BFS traversal.
class Queue {
  // Constructor initializes an empty array to hold queue elements.
  constructor ( ) {
    this . list = [ ] ;
  }

  // Adds an item to the end of the queue.
  enqueue ( item ) {
    this . list . push ( item ) ;
  }

  // Removes and returns the item from the front of the queue.
  dequeue ( ) {
    return this . list . shift ( ) ; // shift() removes first element and returns it
  }
} // End of Queue class definition

// --- Data Structure: Node ---
// Represents a node in the tree structure.
class Node {
  // Constructor takes an ID for the node.
  constructor ( id ) {
    this . id = id ; // Unique identifier for the node
    this . list = [ ] ; // List of child nodes (adjacency list for this node)
    this . params = new Map ( ) ; // A map to store arbitrary parameters like 'depth'
  }

  // Adds a child node to this node's adjacency list.
  add ( node ) {
    this . list . push ( node ) ;
  }

  // Retrieves a parameter value by key.
  get ( key ) {
    return this . params . get ( key ) ;
  }

  // Sets a parameter value for a given key.
  set ( key , value ) {
    return this . params . set ( key , value ) ;
  }

  // Checks if a parameter exists.
  has ( key ) {
    return this . params . has ( key ) ;
  }

  // Returns a string representation of the node, including its ID and depth.
  toString ( ) {
    return [ this . id , this . get ( 'depth' ) ] . join ( ' ' ) ;
  }
} // End of Node class definition

// --- Data Structure: Tree ---
// Manages the collection of nodes and provides tree operations like BFS.
class Tree {
  constructor ( ) {
    this . map = new Map ( ) ; // Stores nodes, keyed by their ID.
    this . queue = new Queue ( ) ; // A queue instance for BFS.
  }

  // Adds a node to the tree's internal map.
  setNode ( node ) {
    this . map . set ( node . id , node ) ;
  }

  // Checks if a node with the given ID exists in the tree.
  hasNode ( id ) {
    return this . map . has ( id ) ;
  }

  // Retrieves a node by its ID.
  getNode ( id ) {
    return this . map . get ( id ) ;
  }

  // Performs a Breadth-First Search (BFS) traversal.
  // This is a recursive implementation of BFS.
  bfs ( ) {
    const node = this . queue . dequeue ( ) ; // Get the next node from the queue.
    if ( ! node ) {
      return ; // If queue is empty, BFS is complete.
    }

    // Iterate over each child node of the current node.
    node . list . forEach ( _node => {
      // If the child node already has a 'depth' parameter, it means it has been visited.
      if ( _node . has ( 'depth' ) ) {
        return ; // Skip already visited nodes.
      }
      // Set the depth of the child node (current node's depth + 1).
      _node . set ( 'depth' , node . get ( 'depth' ) + 1 ) ;
      // Enqueue the child node for further processing.
      this . queue . enqueue ( _node ) ;
    } ) ;
    this . bfs ( ) ; // Recursively call bfs to continue traversal.
  }

  // Prints the ID and depth of each node in the tree.
  print ( ) {
    // Iterate from 1 to the total number of nodes (assuming 1-indexed IDs).
    for ( let i = 1 ; i <= this . map . size ; i ++ ) {
      const node = this . map . get ( i ) ; // Get the node by its ID.
      console . log ( node . toString ( ) ) ; // Print its string representation.
    }
  }
} // End of Tree class definition

// --- Main Program Logic ---
// Instantiate a new Tree object.
const tree = new Tree ( ) ;

// Process the adjacency list to build the tree structure.
adj . forEach ( ( [ id , k , ... ck ] ) => { // Destructure each line of the adjacency list.
  // Ensure the parent node exists in the tree. If not, create and add it.
  tree . hasNode ( id ) || tree . setNode ( new Node ( id ) ) ;
  // Get the parent node from the tree.
  const node = tree . getNode ( id ) ;

  // Iterate over each child ID 'c' for the current parent node.
  ck . forEach ( c => {
    // Ensure the child node exists in the tree. If not, create and add it.
    tree . hasNode ( c ) || tree . setNode ( new Node ( c ) ) ;
    // Get the child node from the tree.
    const _node = tree . getNode ( c ) ;
    // Add the child node to the parent node's list of children.
    node . add ( _node ) ;
  } ) ;
} ) ;

// --- BFS Initialization and Execution ---
// Get the root node (assuming node with ID 1 is the root).
const root = tree . getNode ( 1 ) ;
// Set the depth of the root node to 0.
root . set ( 'depth' , 0 ) ;
// Enqueue the root node to start the BFS.
tree . queue . enqueue ( root ) ;
// Execute the BFS traversal.
tree . bfs ( ) ;

// --- Output Results ---
// Print the ID and calculated depth for each node.
tree . print ( ) ;
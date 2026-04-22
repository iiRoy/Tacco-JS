/* This is a basic Node class definition.
 * It represents a single node within a tree structure. */
class Node
{ // Start of Node class definition

  /* The constructor initializes a new Node instance.
   * @param {number} id - The unique identifier for the node.
   * @param {Node|null} parent - The parent node, or null if it's the root.
   * @param {Array<Node>} children - An array of child nodes. */
  constructor ( id , parent , children )
  {
    this . id       = id ; // Assigns the unique ID
    this . parent   = parent ; // Sets the parent reference
    this . children = children ; // Initializes the children array
  }


  // Getter for the node's type: 'root', 'leaf', or 'internal node'.
  get type ( )
  {
    // If the node has no parent, it's the root.
    if  (  this . parent  ===  null  )
      return  'root' ;

    // If the node has no children, it's a leaf.
    if ( this . children . length === 0 )
      return 'leaf' ;

    /* Otherwise, the node has both a parent and children,
     * so it's an internal node. */
    return 'internal node' ;
  }


  /*
   * Computes the depth of the node within the tree.
   * The root node has a depth of 0.
   */
  get depth ( )
  {
    // Helper function to recursively calculate depth.
    const getDepth = ( node , i )  =>
    {
      // Base case: if node has no parent, return current depth 'i'.
      return  node . parent  ===  null  ?  i  :  getDepth ( node . parent ,  i  +  1 ) ;
    } ;

    // Start the recursive call from the current node with initial depth 0.
    return getDepth ( this , 0 ) ;
  }


  /* Provides a string representation of the node.
   * Includes ID, parent ID, depth, type, and IDs of children. */
  toString ( )
  {
    /* Format: "node ID: parent = PARENT_ID, depth = DEPTH, TYPE, [CHILD_ID1, CHILD_ID2]"
     * If parent is null, PARENT_ID is -1. */
    return `node ${this.id}: parent = ${this.parent !== null ? this.parent.id : -1}, depth = ${this.depth}, ${this.type}, [${this.children.map(n => n.id).join(', ')}]`;
  }

} ; // End of Node class


// Represents a tree data structure composed of Node objects.
class Tree
{
  /*
   * Constructor for the Tree class.
   * @param {number} n - An initial capacity hint (though not strictly used for Array size here).
   */
  constructor ( n )
  {
    // An array to store all nodes, indexed by their ID.
    this . nodes = [ ] ;
  }


  /* Adds child relationships to a node.
   * If nodes don't exist, they are created implicitly by `find`.
   * @param {number} id - The ID of the parent node.
   * @param {Array<number>} childrenIds - An array of IDs for the children to be added. */
  add ( id , childrenIds )
  {
    // Find or create the parent node.
    let node = this . find ( id ) ;

    // Iterate over each child ID to establish relationships.
    childrenIds . forEach ( ( cid ) =>
    {
      // Find or create the child node.
      let c = this . find ( cid ) ;

      // Set the parent of the child node.
      c . parent = node ;

      // Ensure the child's ID is correctly set (redundant if `find` works as expected, but kept).
      c . id = cid ;

      // Add the child to the parent's children list.
      node . children . push ( c ) ;
    } )
  }


  /* Finds a node by its ID, creating it if it doesn't exist.
   * This ensures that all referenced nodes are always present in `this.nodes`.
   * @param {number} id - The ID of the node to find.
   * @returns {Node} The found or newly created node. */
  find ( id )
  {
    // If node[id] exists, return it; otherwise, create a new Node and assign it.
    return this . nodes [ id ]  ||  ( this . nodes [ id ]  =  new  Node ( id , null , [ ] ) ) ;
  }


  /* Prints a sorted list of all nodes in the tree to the console.
   * Nodes are sorted by their ID and their string representation is used. */
  print ( )
  {
    // Sort nodes by ID, map them to their string representation, and join with newlines.
    console . log ( this . nodes . sort ( ( a , b )  =>  a . id  -  b . id ) . map ( n  =>  n . toString ( ) ) . join ( '\n' ) ) ;
  }
} // End of Tree class definition


/*
 * Main execution block (Immediately Invoked Function Expression - IIFE).
 * This function reads input, constructs the tree, and prints its state.
 */
( function main ( )
{
  // Read input from /dev/stdin, decode as UTF-8, trim whitespace, and split into lines.
  const lines = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;

  // The first line contains the total number of nodes (n), convert to Number.
  const n = Number ( lines . shift ( ) ) ;

  // Create a new Tree instance.
  let tree = new Tree ( n ) ;

  // Declare variables for parsing each line of input.
  let id , k , childrenIds ;

  /* Process each remaining line to add nodes and their relationships to the tree.
   * Each line represents a node and its children. */
  lines . map ( l => l . split ( ' ' ) ) . forEach ( function ( line )
  {
    // The first element is the node's ID.
    id = Number ( line . shift ( ) ) ;

    // The second element is the number of children (k), though not strictly used after parsing.
    k = Number ( line . shift ( ) ) ;

    // The rest of the elements are the IDs of the children.
    childrenIds = line . map ( Number ) ;

    // Add the node and its children to the tree.
    tree . add ( id , childrenIds ) ;
  } ) ;

  // Finally, print the entire tree structure.
  tree . print ( ) ;
} ) ( ) ; // Execute the main function immediately
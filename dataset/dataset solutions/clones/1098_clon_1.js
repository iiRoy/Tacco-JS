/*
 * This is a foundational class for representing a node within a binary tree structure.
 * Each node holds a key and references to its left and right children.
 */
class _Node {
  /**
   * Constructs a new Node instance.
   *
   * @param {any} key - The value stored in this node.
   * @param {_Node | null} [left=null] - Reference to the left child node.
   * @param {_Node | null} [right=null] - Reference to the right child node.
   */
  constructor ( key, left = null, right = null ) {
    this . key   =   key; // Assign the provided key to the node.
    this . left  =   left; // Initialize the left child reference.
    this . right =   right; // Initialize the right child reference.
  }
}



/*
 * Defines the BinaryTree class, which manages a collection of nodes
 * arranged in a hierarchical tree structure.
 * It provides methods for insertion and various traversal prints.
 */
class BinaryTree {
  /**
   * Initializes a new BinaryTree instance.
   * The tree starts empty, with its root set to null.
   */
  constructor ( ) {
    this . root = null ; // The root of the tree, initially null.
  }


  /**
   * Static getter to expose the internal _Node class.
   * This allows external code to create nodes if necessary, though
   * the tree's insert method usually handles node creation internally.
   *
   * @returns {typeof _Node} The Node class.
   */
  static get Node ( ) {
    return _Node ;
  }


  /**
   * Inserts a new key into the binary tree.
   * This method has a unique behavior: the first call initializes the root,
   * and subsequent calls use a different, more complex insertion logic
   * to place new nodes correctly in the tree.
   *
   * @param {any} key - The key to be inserted into the tree.
   */
  insert ( key ) {
    // On the very first call, simply set the root.
    // This redefines the `insert` method for subsequent calls.
    this . root = new BinaryTree . Node ( key, null, null ) ;

    /*
     * For all subsequent calls to insert, this redefined function will be used.
     * It performs a standard binary search tree insertion.
     */
    this . insert = ( key ) => {
      let x = this . root ; // Start traversal from the root.
      let y ; // 'y' will trail 'x' to keep track of the parent.

      // Create a new node with the given key.
      let newNode = new BinaryTree . Node ( key, null, null ) ;

      // Traverse the tree to find the correct insertion point.
      while ( x !== null ) {
        y = x ; // 'y' becomes the current node before 'x' moves.
        // Move 'x' left or right based on key comparison.
        x = x [ key < x . key ? 'left' : 'right' ] ;
      }

      // 'y' is now the parent of the new node.
      // Attach the new node as the left or right child of 'y'.
      y [ key < y . key ? 'left' : 'right' ] = newNode ;
    }
  }


  /**
   * Prints the keys of the tree nodes in-order (left, root, right) traversal.
   * This results in an ascending sorted sequence of keys for a valid BST.
   * The output is logged to the console.
   */
  printByIneorder ( ) {
    let str = '' ; // Accumulator for the string representation of the tree.

    /**
     * Recursive helper function for in-order traversal.
     * @param {_Node | null} n - The current node being visited.
     */
    const innerFunc = ( n ) => {
      // Base case: if the node is null, stop recursion.
      if ( n === null )
        return ;

      innerFunc ( n . left ) ; // Recursively visit the left subtree.
      str += ` ${ n . key }` ; // Append the current node's key to the string.
      innerFunc ( n . right ) ; // Recursively visit the right subtree.
    }

    innerFunc ( this . root ) ; // Start the traversal from the root.
    console . log ( str ) ; // Output the accumulated string to the console.
  }


  /**
   * Prints the keys of the tree nodes in pre-order (root, left, right) traversal.
   * This results in a sequence where the parent is visited before its children.
   * The output is logged to the console.
   */
  printByPreorder ( ) {
    let str = '' ; // Accumulator for the string representation of the tree.

    /**
     * Recursive helper function for pre-order traversal.
     * @param {_Node | null} n - The current node being visited.
     */
    const innerFunc = ( n ) => {
      // Base case: if the node is null, stop recursion.
      if ( n === null ) {
        return ;
      }

      str += ` ${ n . key }` ; // Append the current node's key to the string.
      innerFunc ( n . left ) ; // Recursively visit the left subtree.
      innerFunc ( n . right ) ; // Recursively visit the right subtree.
    }

    innerFunc ( this . root ) ; // Start the traversal from the root.
    console . log ( str ) ; // Output the accumulated string to the console.
  }


  /**
   * Convenience method to print the tree using both in-order and pre-order traversals.
   * Calls `printByIneorder` followed by `printByPreorder`.
   */
  print ( ) {
    this . printByIneorder ( ) ; // Perform and print in-order traversal.
    this . printByPreorder ( ) ; // Perform and print pre-order traversal.
  }
}


/*
 * Immediately Invoked Function Expression (IIFE) to encapsulate the main execution logic.
 * This prevents global variable pollution.
 */
( function main ( ) {
  // Read input from stdin, decode as UTF-8, trim whitespace, and split into lines.
  const lines = require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) . trim ( ) . split ( '\n' ) ;

  // The first line contains 'n', which is the number of operations/lines to follow.
  const n = Number ( lines . shift ( ) ) ;

  // Instantiate a new BinaryTree.
  const tree = new BinaryTree ( ) ;

  // Process each command line.
  lines . forEach ( function ( cmd ) {
    // Determine the action based on the first character of the command.
    switch ( cmd . charAt ( 0 ) ) {
      case 'i' : // 'i' indicates an insert operation.
        // Extract the number to insert (after 'i ' or 'insert ').
        tree . insert ( Number ( cmd . split ( ' ' ) [ 1 ] ) ) ;
        break ;

      default : // Any other command (e.g., 'p' for print, or just 'print').
        tree . print ( ) ; // Execute the print operations.
    }
  } ) ;
} ) ( ) ; // Call the main function immediately.
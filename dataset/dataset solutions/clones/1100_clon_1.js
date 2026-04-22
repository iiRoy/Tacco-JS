// This file contains a JavaScript implementation of a Binary Search Tree (BST).
// It defines node structure, tree class, insertion, and traversal methods.

/*
 *  _Node Class:
 *  Represents a single node within the binary tree.
 *  Each node stores a key (value) and references to its left and right children.
 */
class    _Node
{
  // Constructor for the _Node.
  // Initializes a new node with a specified key,
  // and optionally, left and right child references (defaulting to null).
  constructor ( key, left = null, right = null )
  {
    this.key   =  key;   // The value stored in this node.
    this.left  =  left;  /* Pointer to the left child node. */
    this.right =  right; // Pointer to the right child node.
  }
}


/*
 *  BinaryTree Class:
 *  Manages the overall binary tree structure and operations.
 *  Includes methods for inserting elements and printing the tree content.
 */
class BinaryTree
{
  // Constructor for the BinaryTree.
  // Initializes an empty tree by setting the root to null.
  constructor ( )
  {
    this.root = null; // The topmost node of the tree.
  }

  // Static getter property to expose the internal _Node class.
  // This allows creating nodes like `BinaryTree.Node(...)`.
  static get Node ( )
  {
    return _Node;
  }

  /*
   *  Inserts a new key into the binary tree.
   *  The first call to insert initializes the root.
   *  Subsequent calls use a re-assigned insert method for iterative insertion.
   */
  insert( key )
  {
    // This block executes only for the very first insertion.
    // It sets the root of the tree.
    this.root = new BinaryTree.Node( key, null, null );

    // Reassign the 'insert' method for all subsequent insertions.
    // This optimized version performs iterative insertion.
    this.insert = ( key ) =>
    {
      let x = this.root, y; // x: current node during traversal, y: parent of x.
      let newNode = new BinaryTree.Node( key, null, null ); // The new node to be inserted.

      // Traverse the tree to find the correct position for the new node.
      while ( x !== null )
      {
        y = x; /* Keep track of the last non-null node (potential parent). */
        // Move left if the new key is smaller, right otherwise.
        x = x[ key < x.key ? 'left' : 'right' ];
      }
      // Attach the new node to its parent (y).
      y[ key < y.key ? 'left' : 'right' ] = newNode;
    }
  }

  /*
   *  Performs an in-order traversal of the tree and prints the keys.
   *  (Note: The method name 'printByIneorder' retains the original typo).
   */
  printByIneorder ( )
  {
    let str = ''; // String accumulator for the traversal output.

    /*
     *  Recursive helper function for in-order traversal.
     *  Order: Left child -> Current node -> Right child.
     */
    const innerFunc = ( n ) =>
    {
      if ( n === null ) // Base case: if the node is null, stop.
      {
        return;
      }
      innerFunc( n.left );     // Recursively visit the left subtree.
      str += ` ${ n.key }`;    // Append the current node's key.
      innerFunc( n.right );    // Recursively visit the right subtree.
    }

    innerFunc( this.root ); // Start the in-order traversal from the root.
    console.log( str );     // Output the collected string to the console.
  }

  /*
   *  Performs a pre-order traversal of the tree and prints the keys.
   */
  printByPreorder ( )
  {
    let str = ''; // String to store the pre-order sequence.

    /*
     *  Recursive helper function for pre-order traversal.
     *  Order: Current node -> Left child -> Right child.
     */
    const innerFunc = ( n ) =>
    {
      if ( n === null ) // Base case for recursion.
      {
        return;
      }
      str += ` ${ n.key }`; // Append current node's key first.
      innerFunc( n.left );  // Traverse left subtree.
      innerFunc( n.right ); // Traverse right subtree.
    }

    innerFunc( this.root ); // Begin pre-order traversal from the root.
    console.log( str );     // Display the final pre-order string.
  }

  /*
   *  A utility method to print the tree using both in-order and pre-order traversals.
   */
  print ( )
  {
    this.printByIneorder(); // Call the in-order print method.
    this.printByPreorder(); // Call the pre-order print method.
  }
}


/*
 *  Main Execution Block (Immediately Invoked Function Expression - IIFE):
 *  Handles reading input from stdin, parsing commands, and interacting with the BinaryTree.
 */
( function main ( )
{
  // Read all lines from standard input, remove leading/trailing whitespace, and split into an array of lines.
  const lines = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ).trim().split( '\n' );
  // The first line is expected to be 'n', which indicates the number of operations.
  // This value is read but not explicitly used in the provided logic for processing commands.
  const n = Number( lines.shift() );

  const tree = new BinaryTree(); // Create a new instance of our BinaryTree.

  // Process each remaining line, which represents a command.
  lines.map( ( line ) => line.split( ' ' ) ) // Split each line into command parts.
       .forEach( function ( cmd )            // Iterate over each parsed command.
       {
         // Use a switch statement to determine the action based on the first character of the command.
         switch ( cmd[ 0 ].charAt( 0 ) )
         {
         case 'i': // If the command starts with 'i' (for insert).
           tree.insert( Number( cmd[ 1 ] ) ); // Insert the number provided as the second part of the command.
           break; // Exit the switch statement.
         default: // For any other command (implicitly 'p' for print, or unknown commands).
           tree.print(); // Perform the default print operation (both in-order and pre-order).
         }
       } );
} ) ( ); // Execute the main function immediately.
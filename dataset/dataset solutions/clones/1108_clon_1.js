/*
 * This file defines fundamental data structures and operations
 * for a Binary Search Tree (BST) implementation in JavaScript.
 * It includes a Node class and a BinaryTree class with methods
 * for insertion, deletion, searching, and traversal.
 */

// The internal Node class used by the BinaryTree.
class _Node {

  // Constructor to initialize a new node with a key and optional parent/children.
  constructor( key, parent = null, left = null, right = null ) {
    this.key    =    key;      /* The data value stored in this node. */
    this.parent = parent;     // Reference to the parent node.
    this.left   =   left;     // Reference to the left child node.
    this.right  =  right;    // Reference to the right child node.
  } /* End of Node constructor */


  /**
   * Calculates the number of non-null children this node currently has.
   * @returns {number} - Either 0, 1, or 2.
   */
  getChildrenNumber() {
    return Number( this.left !== null ) + Number( this.right !== null );
  } // End of getChildrenNumber method


  // Determines if this node is the left child of its parent.
  isLeftChild() {
    /* If the node has no parent, it cannot be a left child. */
    if ( this.parent === null ) {
      return null;
    }
    // Compare this node instance with its parent's left child reference.
    return this.parent.left === this;
  } // End of isLeftChild method


  // A utility function that returns 'left' or 'right' indicating its position relative to its parent.
  getLeftOrRight() { return this.isLeftChild() ? 'left' : 'right'; } // End of getLeftOrRight method


  /**
   * Finds the in-order successor of the current node.
   * If a right child exists, it's the leftmost node in the right subtree.
   * Otherwise, it's the lowest ancestor whose left child is also an ancestor of this node.
   * @returns {_Node|null} The successor node, or null if no successor exists.
   */
  getSuccessor() {
    let n; // Variable to track the current node during traversal.

    // Case 1: Node has a right child. Successor is the leftmost node in the right subtree.
    if ( this.right !== null ) {
      n = this.right;
      while ( n.left !== null ) {
        n = n.left;
      }
    }
    // Case 2: Node has no right child. Successor is an ancestor.
    else {
      n = this.parent; // Start from the parent.
      // Traverse up the tree until 'n' is a left child of its parent.
      // Note: `!n.isLeftChild` is used as in the original code, implying `isLeftChild` might be a property or a method not called.
      while ( !n.isLeftChild && n.parent != null ) {
        n = n.parent;
      }
    }
    return n; // Return the identified successor.
  } // End of getSuccessor method

} // End of _Node class


// The main BinaryTree class manages the tree structure.
class BinaryTree {

  // Initializes a new, empty binary tree.
  constructor() {
    this.root = null; // The root node of the tree, initially null.
  }


  // Static getter to provide external access to the internal _Node class.
  static get Node() {
    return _Node;
  }


  /*
   * Inserts a new key into the binary tree. This method uses a 'trick':
   * The first time it's called, it sets the root and then redefines itself
   * to handle subsequent insertions using standard BST logic.
   */
  insert( key ) {
    // If the tree is empty, the new key becomes the root.
    this.root = new BinaryTree.Node( key );

    // Redefine the insert method for all subsequent calls.
    // This optimization avoids the `if (this.root === null)` check on every insert.
    this.insert = ( key ) => {
      let x = this.root, y; // 'x' traverses the tree, 'y' keeps track of 'x's parent.
      let newNode = new BinaryTree.Node( key ); // Create the new node to be inserted.

      // Traverse the tree to find the correct position for the new node.
      while ( x !== null ) {
        y = x; // Keep 'y' as the potential parent of the new node.
        // Move to the left or right child based on key comparison.
        x = x[ key < x.key ? 'left' : 'right' ];
      }

      // Set the parent of the new node.
      newNode.parent = y;
      // Attach the new node as either the left or right child of 'y'.
      y[ key < y.key ? 'left' : 'right' ] = newNode;
    };
  } // End of insert method


  /**
   * Searches for a node with a specific key within the tree.
   * This is a recursive search implementation.
   * @param {*} key - The value to search for.
   * @param {_Node} [n=this.root] - The current node to start the search from (defaults to root).
   * @returns {_Node|null} The node containing the key, or null if not found.
   */
  find( key, n = this.root ) {
    // Base case: if node is null (not found) or key matches.
    if ( n === null || n.key === key ) {
      return n;
    }
    // Recursive step: search in the left or right subtree.
    return this.find( key, n[ key < n.key ? 'left' : 'right' ] );
  } // End of find method


  /**
   * Deletes a node with the given key from the tree.
   * Handles various cases: leaf node, node with one child, and node with two children.
   * @param {*} key - The key of the node to be deleted.
   */
  delete( key ) {
    const n = this.find( key ); // Locate the node to delete.

    // If the node is not found, there's nothing to delete.
    if ( n === null ) {
      return;
    }

    // Determine if the node is a left or right child of its parent.
    let leftOrRight = n.getLeftOrRight();

    // Use a switch statement to handle different deletion scenarios based on child count.
    switch ( n.getChildrenNumber() ) {

      case 0: // Case 1: Node is a leaf (no children).
        // Simply remove the reference from its parent.
        n.parent[ leftOrRight ] = null;
        break;

      case 1: // Case 2: Node has one child.
        // Replace the node with its single child.
        n.parent[ leftOrRight ] = n.left || n.right;
        // Update the child's parent reference to point to the grandparent.
        n.parent[ leftOrRight ].parent = n.parent;
        break;

      default: // Case 3: Node has two children.
        // Find the in-order successor's key (the smallest key in the right subtree).
        let skey = n.getSuccessor().key;
        // Recursively delete the successor (which will have at most one child).
        this.delete( skey );
        // Replace the deleted node's key with the successor's key.
        n.key = skey;
        break;
    }
  } // End of delete method


  /*
   * Performs an in-order traversal of the tree, collecting and printing node keys.
   * Traversal order: Left subtree -> Current node -> Right subtree.
   */
  printByIneorder() {
    let str = ''; // String accumulator for the traversal output.

    // Inner recursive function to perform the in-order traversal.
    const innerFunc = ( n ) => {
      if ( n === null ) {
        return; // Base case: end of branch.
      }
      innerFunc( n.left );      // Recursively visit the left child.
      str += ` ${ n.key }`;     // Append the current node's key to the string.
      innerFunc( n.right );     // Recursively visit the right child.
    };

    innerFunc( this.root ); // Start the traversal from the root of the tree.
    console.log( str );     // Print the final collected string.
  } // End of printByIneorder method


  /*
   * Performs a pre-order traversal of the tree, collecting and printing node keys.
   * Traversal order: Current node -> Left subtree -> Right subtree.
   */
  printByPreorder() {
    let str = ''; // String accumulator for the traversal output.

    // Inner recursive function to perform the pre-order traversal.
    const innerFunc = ( n ) => {
      if ( n === null ) {
        return; // Base case: end of branch.
      }
      str += ` ${ n.key }`;     // Append the current node's key to the string.
      innerFunc( n.left );      // Recursively visit the left child.
      innerFunc( n.right );     // Recursively visit the right child.
    };

    innerFunc( this.root ); // Start the traversal from the root of the tree.
    console.log( str );     // Print the final collected string.
  } // End of printByPreorder method


  // Prints the tree's contents using both in-order and pre-order traversals.
  print() {
    this.printByIneorder(); // Execute in-order traversal print.
    this.printByPreorder(); // Execute pre-order traversal print.
  } // End of print method

} // End of BinaryTree class


// Main execution block: Immediately Invoked Function Expression (IIFE).
( function main() {
  // Read input from standard input, decode as UTF-8, trim whitespace, and split into lines.
  const lines = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ).trim().split( '\n' );
  // The first line contains the number of commands, which is shifted off the array.
  const n     = Number( lines.shift() ); // 'n' is not used in the provided code, but it's read.

  // Instantiate a new BinaryTree.
  const tree = new BinaryTree();

  // Iterate over each command line and execute the corresponding tree operation.
  lines.forEach( function( cmd ) {
    // Use a switch statement to dispatch commands based on their first character.
    switch ( cmd.charAt( 0 ) ) {
      case 'i': // 'i' for insert.
        tree.insert( Number( cmd.split( ' ' )[ 1 ] ) ); // Extract key and insert.
        break;
      case 'f': // 'f' for find.
        // Find key and print 'yes' or 'no' based on whether it's found.
        console.log( tree.find( Number( cmd.split( ' ' )[ 1 ] ) ) ? 'yes' : 'no' );
        break;
      case 'd': // 'd' for delete.
        tree.delete( Number( cmd.split( ' ' )[ 1 ] ) ); // Extract key and delete.
        break;
      default: // Any other command (implicitly 'p' for print in typical scenarios).
        tree.print(); // Perform tree printing.
        break;
    }
  } );
} )(); // End of main IIFE.
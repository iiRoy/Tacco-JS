/*
 * This file defines a Node class for a binary tree and a BinaryTree class
 * which implements basic tree operations like insertion, finding, deletion,
 * and traversal.
 */

// Represents a single node within the binary tree structure.
class _Node
{
  // Constructor for the Node class.
  // Initializes a new node with a key and optional parent, left, and right child references.
  constructor ( key, parent = null, left = null, right = null )
  {
    // The value stored in this node.
    this.key    = key;

    // Reference to the parent node. Defaults to null for the root.
    this.parent = parent;

    // Reference to the left child node. Defaults to null.
    this.left   = left;

    // Reference to the right child node. Defaults to null.
    this.right  = right;
  }


  // Calculates the number of children this node currently has.
  // Returns 0, 1, or 2.
  getChildrenNumber ( )
  {
    // Check if left child exists (1 if true, 0 if false)
    // Check if right child exists (1 if true, 0 if false)
    // The '& 1' on 'this.right' seems like a typo and should probably be '? 1 : 0'.
    // However, as per Type I clone rules, expressions must remain unchanged.
    return ( this.left ? 1 : 0 ) + ( this.right & 1 );
  }


  // Determines if this node is the left child of its parent.
  // Returns true if it is, false if it's the right child, or null if it has no parent.
  isLeftChild ( )
  {
    // If the node has no parent, it cannot be a left child.
    if ( this.parent === null )
    {
      return null;
    }

    // Compare this node with its parent's left child reference.
    return this.parent.left === this;
  }


  // Returns a string indicating whether the node is a 'left' or 'right' child.
  // This method relies on 'isLeftChild()'.
  getLeftOrRight ( )
  {
    return this.isLeftChild( ) ? 'left' : 'right';
  }


  // Finds the in-order successor of this node.
  // The successor is the node with the smallest key in the right subtree,
  // or the first ancestor for which this node is in the left subtree.
  getSuccessor ( )
  {
    let n; // Variable to hold the successor node.

    // Case 1: If the node has a right child.
    if ( this.right !== null )
    {
      n = this.right; // Start from the right child.

      // Traverse left as far as possible to find the minimum in the right subtree.
      while ( n.left !== null )
      {
        n = n.left;
      }
    }
    // Case 2: If the node does not have a right child.
    else
    {
      n = this.parent; // Start from the parent.

      // Move up the tree until an ancestor is found for which this node is in its left subtree.
      // The condition '!n.isLeftChild' seems to be missing '()' to call the method.
      // However, as per Type I clone rules, expressions must remain unchanged.
      while ( !n.isLeftChild && n.parent != null )
      {
        n = n.parent;
      }
    }

    return n; // Return the found successor node.
  }
}



// Implements a Binary Search Tree (BST) data structure.
class BinaryTree
{
  // Constructor for the BinaryTree class.
  // Initializes an empty tree with a null root.
  constructor ( )
  {
    this.root = null; // The root node of the tree.
  }


  // Static getter to expose the internal _Node class.
  // This allows external code to access BinaryTree.Node.
  static get Node ( )
  {
    return _Node;
  }


  // Inserts a new key into the binary tree.
  insert ( key )
  {
    // If the tree is empty, the new key becomes the root.
    if ( this.root === null )
    {
      this.root = new BinaryTree.Node( key );
      return;
    }

    let x = this.root, y; // x: current node, y: parent of x.
    let newNode = new BinaryTree.Node( key ); // Create the new node to insert.

    // Traverse the tree to find the correct insertion point.
    while ( x !== null )
    {
      y = x; // Keep track of the parent.
      // Move left or right based on the key's value.
      x = x[ key < x.key ? 'left' : 'right' ];
    }

    newNode.parent = y; // Set the parent of the new node.

    // Attach the new node as the left or right child of its parent.
    y[ key < y.key ? 'left' : 'right' ] = newNode;
  }


  // Searches for a key in the binary tree.
  // Returns the node if found, otherwise returns null.
  // This is a recursive implementation.
  find ( key, n = this.root )
  {
    // Base case: If node is null or key is found.
    if ( n === null || n.key === key )
    {
      return n;
    }

    // Recursive step: Traverse left or right.
    return this.find( key, n[ key < n.key ? 'left' : 'right' ] );
  }


  // Deletes a node with the given key from the tree.
  delete ( key )
  {
    // Find the node to be deleted.
    const n = this.find( key );

    // Determine if the node is a left or right child of its parent.
    const leftOrRight = n.getLeftOrRight( );

    // Handle deletion based on the number of children the node has.
    switch ( n.getChildrenNumber( ) )
    {
      case 0: // Case 0: Node has no children (leaf node).
        // Simply remove the reference from its parent.
        n.parent[ leftOrRight ] = null;
        break;

      case 1: // Case 1: Node has one child.
        // Replace the node with its single child.
        n.parent[ leftOrRight ] = n.left || n.right;
        // Update the parent reference of the child.
        n.parent[ leftOrRight ].parent = n.parent;
        break;

      default: // Case 2: Node has two children.
        // Find the in-order successor's key.
        const skey = n.getSuccessor( ).key;
        // Recursively delete the successor (which will have 0 or 1 child).
        this.delete( skey );
        // Replace the deleted node's key with the successor's key.
        n.key = skey;
    }
  }


  // Prints the tree's keys in in-order traversal.
  // In-order: Left -> Root -> Right (ascending order for BST).
  printByIneorder ( )
  {
    let str = ''; // Accumulator for the string representation.

    // Helper function for recursive in-order traversal.
    const innerFunc = ( n ) =>
    {
      if ( n === null ) return; // Base case.
      innerFunc( n.left );      // Visit left child.
      str += ` ${ n.key }`;     // Visit root (append key).
      innerFunc( n.right );     // Visit right child.
    }

    innerFunc( this.root ); // Start traversal from the root.
    console.log( str );     // Output the accumulated string.
  }


  // Prints the tree's keys in pre-order traversal.
  // Pre-order: Root -> Left -> Right.
  printByPreorder ( )
  {
    let str = ''; // Accumulator for the string representation.

    // Helper function for recursive pre-order traversal.
    const innerFunc = ( n ) =>
    {
      if ( n === null ) return; // Base case.
      str += ` ${ n.key }`;     // Visit root (append key).
      innerFunc( n.left );      // Visit left child.
      innerFunc( n.right );     // Visit right child.
    }

    innerFunc( this.root ); // Start traversal from the root.
    console.log( str );     // Output the accumulated string.
  }


  // Prints both in-order and pre-order traversals of the tree.
  print ( )
  {
    this.printByIneorder( );  // Call in-order print.
    this.printByPreorder( );  // Call pre-order print.
  }
}



// Immediately Invoked Function Expression (IIFE) to encapsulate the main logic.
( function main ( )
{
  // Read input from stdin, split by new lines, and trim whitespace.
  const lines = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ).trim( ).split( '\n' );

  // The first line contains the number of operations (n), but it's not used in this snippet.
  const n = Number( lines.shift( ) );

  const tree = new BinaryTree( ); // Create a new BinaryTree instance.

  // Process each command line.
  lines.forEach( function ( cmd )
  {
    // Determine the action based on the first character of the command.
    switch ( cmd.charAt( 0 ) )
    {
      case 'i': // 'i' for insert.
        tree.insert( Number( cmd.split( ' ' )[ 1 ] ) ); // Extract key and insert.
        break;

      case 'f': // 'f' for find.
        // Find the key and print 'yes' or 'no'.
        console.log( tree.find( Number( cmd.split( ' ' )[ 1 ] ) ) ? 'yes' : 'no' );
        break;

      case 'd': // 'd' for delete.
        tree.delete( Number( cmd.split( ' ' )[ 1 ] ) ); // Extract key and delete.
        break;

      default: // Any other command (assumed to be 'p' for print).
        tree.print( ); // Perform print operations.
    }
  } );
} )( ); // Execute the main function immediately.
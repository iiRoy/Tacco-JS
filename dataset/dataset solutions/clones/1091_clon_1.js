/*
 * This file contains functions for tree traversal (preorder, inorder, postorder)
 * and a utility function to update parent-child relationships within a tree structure.
 * It reads tree node data from standard input, constructs the tree,
 * and then prints the different traversals.
 */

// Function definition for updating child nodes' parent pointers recursively.
function   updateChildren( cid, pid )
{
  // Locate the node based on its child ID.
  var node = T.filter( function( c ) { return c.id == cid; } ) [ 0 ] ;

  // Assign the new parent ID to the node.
  node.parent = pid;


  // Recursively update the left child if it exists.
  if ( node.left != -1 ) {
    updateChildren( node.left, node.id );
  }

  // Recursively update the right child if it exists.
  if ( node.right != -1 ) {
    updateChildren( node.right, node.id );
  }
}

// Function definition for performing a preorder traversal.
function preorder ( id, arr ) {
  // Base case: if the current node ID is -1, it means no node exists, so return.
  if ( id == -1 )
    return ;

  // Find the node object corresponding to the given ID.
  var node = T.filter( function ( c ) { return c.id == id; } ) [ 0 ] ;

  // Add the current node's ID to the traversal array (visit step).
  arr.push( id );

  // Recursively traverse the left subtree.
  preorder( node.left, arr );

  // Recursively traverse the right subtree.
  preorder( node.right, arr );
}

// Function definition for performing an inorder traversal.
function inorder ( id, arr ) {
  // Base case for recursion: stop if the node ID is invalid.
  if ( id == -1 ) {
    return ;
  }

  // Get the current node object from the global tree array 'T'.
  var node = T.filter( function ( c ) { return c.id == id; } ) [ 0 ] ;

  // Recursively traverse the left child first.
  inorder( node.left, arr );

  // Visit the current node (add its ID to the array).
  arr.push( id );

  // Then, recursively traverse the right child.
  inorder( node.right, arr );
}

// Function definition for performing a postorder traversal.
function postorder ( id, arr ) {
  // Check for the base case (empty node).
  if ( id == -1 ) {
    return ;
  }

  // Retrieve the node object.
  var node = T.filter( function ( c ) { return c.id == id; } ) [ 0 ] ;

  // First, traverse the left subtree.
  postorder( node.left, arr );

  // Then, traverse the right subtree.
  postorder( node.right, arr );

  // Finally, visit the current node.
  arr.push( id );
}


/*
 * Main execution block starts here.
 * This part handles reading input, constructing the tree,
 * and performing traversals.
 */

// Read all input from standard input.
var input = require( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) ;
// Trim whitespace and split the input into individual lines.
var lines = input.trim( ) . split ( '\n' ) ;


// The first line contains the number of nodes (n). Convert it to a number.
var n = + lines.shift ( ) ;

// Initialize a global array to store tree nodes.
var T = [ ] ;
// Loop 'n' times to process each node's data.
for ( var i = 0 ; i < n ; i ++ ) {
  // Get the next line and split it by space.
  var u = lines.shift ( ) . split ( ' ' ) ;
  // Parse node ID, left child ID, and right child ID from the line.
  var id = + u [ 0 ] ;
  var left = + u [ 1 ] ;
  var right = + u [ 2 ] ;

  // Create a new node object and add it to the global array 'T'.
  // Initialize 'parent' to -1, which will be updated later.
  T.push ( { id: id, left: left, right: right, parent: -1 } ) ;
}

// Sort the nodes in 'T' by their 'id' for easier lookup, although filter already does it.
T.sort ( function ( a, b ) { return a.id - b.id; } ) ;

// Iterate through all nodes to establish parent relationships.
// For each node, if it has a left or right child, update that child's parent pointer.
T.forEach ( function ( node ) {
  // Check if there's a left child.
  if ( node.left != -1 ) {
    // If yes, call updateChildren to set its parent to the current node's ID.
    updateChildren ( node.left, node.id ) ;
  }
  // Check if there's a right child.
  if ( node.right != -1 ) {
    // If yes, call updateChildren to set its parent to the current node's ID.
    updateChildren ( node.right, node.id ) ;
  }
} ) ;

// Find the root node, which is the one whose parent remains -1.
var root = T.filter ( function ( node ) { return node.parent == -1; } ) [ 0 ] ;


// Prepare an array to store traversal results.
var ret = [ ] ;
// Perform preorder traversal starting from the root.
preorder ( root.id, ret ) ;
// Print the label for preorder traversal.
console.log ( 'Preorder' ) ;
// Print the collected node IDs, joined by spaces.
console.log ( ' ' + ret.join ( ' ' ) ) ;


// Reset the result array for the next traversal.
ret = [ ] ;
// Perform inorder traversal.
inorder ( root.id, ret ) ;
// Print the label for inorder traversal.
console.log ( 'Inorder' ) ;
// Print the collected node IDs.
console.log ( ' ' + ret.join ( ' ' ) ) ;


// Reset the result array again.
ret = [ ] ;
// Perform postorder traversal.
postorder ( root.id, ret ) ;
// Print the label for postorder traversal.
console.log ( 'Postorder' ) ;
// Print the collected node IDs.
console.log ( ' ' + ret.join ( ' ' ) ) ;

// End of script.
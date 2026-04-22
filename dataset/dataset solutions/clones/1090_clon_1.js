/*
 * This JavaScript file processes tree data from standard input.
 * It reads node definitions, constructs a tree structure,
 * identifies the root node, and then performs three
 * common tree traversals: preorder, inorder, and postorder.
 * The results of these traversals are printed to the console.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Configuration object for input source and newline character.
// The commented-out line below shows a Windows-specific configuration.
// config = { input: 'tmp', newline: '\r\n' }; // Windows newline configuration option.

// The active configuration uses '/dev/stdin' for input, typical for Linux/Unix systems.
config = { input : '/dev/stdin', newline : '\n' } ; // Linux/Unix newline configuration.


// Read the entire input file synchronously.
// The 'ascii' encoding is used for the input.
var line = require('fs') . readFileSync ( config . input , 'ascii' )
// Remove any leading or trailing whitespace from the raw input string.
  . trim ( )
// Split the string into an array of lines using the configured newline character.
  . split ( config . newline ) ;

// The first line of input often contains metadata (like node count)
// which is not needed for the tree construction logic in this script.
line . shift ( ) ;


// Initialize an empty object to store the tree structure.
// Each key in 'tree' will be a node ID, and its value will be an object
// containing 'left', 'right' child IDs, and a 'root' flag.
tree = { } ;

// Iterate over each line in the 'line' array to populate the tree.
// Each line represents a node and its children.
for ( var i in line )
{
  // Split the current line by space to get node ID, left child, and right child.
  var ary = line [ i ] . split ( ' ' ) ;

  // Store the node's information in the 'tree' object.
  // Initially, all nodes are considered potential roots.
  tree [ ary [ 0 ] ] = { 'left' : ary [ 1 ] , 'right' : ary [ 2 ] , 'root' : true } ;
}


// Determine the actual root of the tree.
// A node is not a root if it is a left or right child of another node.
for ( var i in tree )
{
  // Check if the current node has a left child that is not a placeholder ('-1').
  if ( tree [ i ] . left !== '-1' )
  {
    // If it has a left child, that child cannot be the root of the entire tree.
    tree [ tree [ i ] . left ] . root = false ;
  }

  // Check if the current node has a right child that is not a placeholder ('-1').
  if ( tree [ i ] . right !== '-1' )
  {
    // If it has a right child, that child cannot be the root of the entire tree.
    tree [ tree [ i ] . right ] . root = false ;
  }
}

// After checking all children, the node that still has 'root: true' is the actual root.
var root_id ; // Declare a variable to hold the ID of the root node.
for ( var i in tree )
{
  // If the 'root' flag for the current node is true, then we've found our root.
  if ( tree [ i ] . root )
  {
    root_id = i ; // Assign the ID of the root node.
  }
}


/**
 * Performs a preorder traversal of the tree starting from the given node ID.
 * The order is: Root -> Left -> Right.
 * @param {string} id The ID of the current node to traverse.
 * @returns {Array<string>} An array of node IDs in preorder sequence.
 */
function preorder ( id )
{
  // Retrieve the current node object from the tree.
  var node = tree [ id ] ;
  // Extract left and right child IDs for convenience.
  var left = node . left ;
  var right = node . right ;
  // Initialize the result array with the current node's ID (Root).
  var res = [ id ] ;

  // If there is a left child (not '-1'), recursively traverse the left subtree.
  if ( left !== '-1' )
  {
    res = res . concat ( preorder ( left ) ) ; // Append results from left traversal.
  }

  // If there is a right child (not '-1'), recursively traverse the right subtree.
  if ( right !== '-1' )
  {
    res = res . concat ( preorder ( right ) ) ; // Append results from right traversal.
  }

  return res ; // Return the combined sequence.
}

// Output the label for the preorder traversal.
console . log ( 'Preorder' ) ;
// Perform preorder traversal from the identified root and print the joined sequence.
console . log ( ' ' + preorder ( root_id ) . join ( ' ' ) ) ;


/**
 * Performs an inorder traversal of the tree starting from the given node ID.
 * The order is: Left -> Root -> Right.
 * @param {string} id The ID of the current node to traverse.
 * @returns {Array<string>} An array of node IDs in inorder sequence.
 */
function inorder ( id )
{
  // Retrieve the current node object.
  var node = tree [ id ] ;
  // Extract left and right child IDs.
  var left = node . left ;
  var right = node . right ;
  // Initialize an empty result array.
  var res = [ ] ;

  // If there is a left child, recursively traverse the left subtree.
  if ( left !== '-1' )
  {
    res = res . concat ( inorder ( left ) ) ; // Append results from left traversal.
  }

  res . push ( id ) ; // Add the current node's ID (Root) after left subtree.

  // If there is a right child, recursively traverse the right subtree.
  if ( right !== '-1' )
  {
    res = res . concat ( inorder ( right ) ) ; // Append results from right traversal.
  }

  return res ; // Return the combined sequence.
}

// Output the label for the inorder traversal.
console . log ( 'Inorder' ) ;
// Perform inorder traversal from the identified root and print the joined sequence.
console . log ( ' ' + inorder ( root_id ) . join ( ' ' ) ) ;


/**
 * Performs a postorder traversal of the tree starting from the given node ID.
 * The order is: Left -> Right -> Root.
 * @param {string} id The ID of the current node to traverse.
 * @returns {Array<string>} An array of node IDs in postorder sequence.
 */
function postorder ( id )
{
  // Retrieve the current node object.
  var node = tree [ id ] ;
  // Extract left and right child IDs.
  var left = node . left ;
  var right = node . right ;
  // Initialize an empty result array.
  var res = [ ] ;

  // If there is a left child, recursively traverse the left subtree.
  if ( left !== '-1' )
  {
    res = res . concat ( postorder ( left ) ) ; // Append results from left traversal.
  }

  // If there is a right child, recursively traverse the right subtree.
  if ( right !== '-1' )
  {
    res = res . concat ( postorder ( right ) ) ; // Append results from right traversal.
  }

  res . push ( id ) ; // Add the current node's ID (Root) after both subtrees.

  return res ; // Return the combined sequence.
}

// Output the label for the postorder traversal.
console . log ( 'Postorder' ) ;
// Perform postorder traversal from the identified root and print the joined sequence.
console . log ( ' ' + postorder ( root_id ) . join ( ' ' ) ) ;
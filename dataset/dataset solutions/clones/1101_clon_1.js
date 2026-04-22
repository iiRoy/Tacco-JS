/*
 * This file contains a JavaScript implementation of a Binary Search Tree (BST)
 * along with some utility methods for insertion, searching, and printing.
 * It also includes logic to read commands from standard input.
 */

// Configuration object for input/output settings.
// The commented line below is for Windows environments.
// config = { input: 'tmp', newline: '\r\n' }; // Windows-specific input source.

// The active configuration is for Unix-like systems (Linux, macOS).
config = {
  input: '/dev/stdin', // Specifies standard input as the data source.
  newline: '\n'        // Defines the newline character for parsing.
};


/**
 * Constructor for a new Tree object.
 * Initializes the root of the tree to null and a hashmap to store keys for quick lookup.
 */
function Tree( ) {
  // The root node of the binary search tree. Initially, the tree is empty.
  this.root = null;

  // A hashmap (JavaScript object) to keep track of all keys present in the tree.
  // This allows for O(1) average time complexity for checking key existence.
  this.keys = {};
}


/**
 * Inserts a new value into the binary search tree.
 * @param {number} val The numerical value to be inserted into the tree.
 */
Tree.prototype.insert = function( val ) {
  // Declaration of variables used during the insertion process.
  var z ,
      y ,
      x ;

  // Mark the value as present in the tree's key-tracking hashmap.
  this.keys[ val ] = null;

  // Create a new node object for the value being inserted.
  // Initialize its left, right, and parent pointers to null.
  z = {
    'left': null,
    'right': null,
    'key': val,
    'parent': null
  };

  // 'y' will eventually become the parent of the new node 'z'.
  y = null;

  // 'x' starts at the root and traverses down the tree to find the insertion point.
  x = this.root;

  // Loop to find the correct position for the new node 'z'.
  while ( x !== null ) {
    y = x; // 'y' always follows 'x', keeping track of 'x's parent.

    // Decide whether to go left or right based on the new node's key.
    if ( z.key < x.key ) {
      x = x.left; // Move to the left child.
    }
    else {
      x = x.right; // Move to the right child.
    }
  }

  // Set the parent of the new node 'z' to 'y'.
  z.parent = y;

  // If 'y' is null, it means the tree was empty, so 'z' becomes the root.
  if ( y === null ) {
    this.root = z;
  }
  // Otherwise, attach 'z' as either the left or right child of 'y'.
  else if ( z.key < y.key ) {
    y.left = z;  // 'z' is smaller, so it becomes the left child.
  }
  else {
    y.right = z; // 'z' is larger or equal, so it becomes the right child.
  }
};


/**
 * Checks if a given value exists in the tree.
 * Utilizes the 'keys' hashmap for efficient lookup.
 * @param {number} val The value to search for.
 * @returns {boolean} True if the value is found, false otherwise.
 */
Tree.prototype.find = function( val ) {
  // Use the hasOwnProperty method to check for the existence of the key.
  return ( this.keys.hasOwnProperty( val ) );
};


/**
 * Prints a visual representation of the tree structure to the console.
 * Uses a recursive helper function for depth-first traversal.
 */
Tree.prototype.printTree = function( ) {
  /**
   * Recursive helper function to print nodes with appropriate indentation.
   * @param {object} node The current node to print.
   * @param {number} depth The current depth of the node in the tree.
   */
  function p( node, depth ) {
    var indent = '' , // String to store indentation spaces.
        i ;           // Loop counter.

    // Generate the indentation string based on the current depth.
    for ( i = 0 ; i < depth ; i++ ) {
      indent = indent + '  '; // Add two spaces for each level of depth.
    }

    // If the node is null, print 'NIL' to represent an empty branch.
    if ( node === null ) {
      console.log( indent + 'NIL' );
      return; // Stop recursion for this branch.
    }

    // Print the key of the current node.
    console.log( indent + node.key );

    // Recursively call for the left and right children, increasing depth.
    p( node.left , depth + 1 );
    p( node.right , depth + 1 );
  }

  // Initiate the printing process starting from the root with depth 0.
  p( this.root , 0 );
};


/**
 * Prints the inorder and preorder traversals of the tree to the console.
 */
Tree.prototype.print = function( ) {
  /**
   * Performs an inorder traversal of the tree.
   * @param {object} node The current node in the traversal.
   * @returns {Array<number>} An array containing the keys in inorder sequence.
   */
  function inorder( node ) {
    var res = []; // Array to store the traversal result.

    // Base case: if the node is null, return an empty array.
    if ( node === null ) {
      return res;
    }

    // Recursively traverse the left subtree.
    res = res.concat( inorder( node.left ) );

    // Add the current node's key.
    res.push( node.key );

    // Recursively traverse the right subtree.
    res = res.concat( inorder( node.right ) );

    return res; // Return the accumulated results.
  }

  /**
   * Performs a preorder traversal of the tree.
   * @param {object} node The current node in the traversal.
   * @returns {Array<number>} An array containing the keys in preorder sequence.
   */
  function preorder( node ) {
    var res = []; // Array to store the traversal result.

    // Base case: if the node is null, return an empty array.
    if ( node === null ) {
      return res;
    }

    // Add the current node's key first.
    res.push( node.key );

    // Recursively traverse the left subtree.
    res = res.concat( preorder( node.left ) );

    // Recursively traverse the right subtree.
    res = res.concat( preorder( node.right ) );

    return res; // Return the accumulated results.
  }

  // Print the inorder traversal result, joined by spaces.
  console.log( ' ' + inorder( this.root ).join( ' ' ) );

  // Print the preorder traversal result, joined by spaces.
  console.log( ' ' + preorder( this.root ).join( ' ' ) );
};


// Initialize a readable stream from the configured input source.
// 'fs' (file system) module is used to create the stream.
si = require('fs')
     .createReadStream(
       config.input,
       {
         encoding: 'ascii' // Specify ASCII encoding for the input stream.
       }
     );

// Initialize a readline interface to process input line by line.
// 'readline' module provides an interface for reading data from a Readable stream
// one line at a time.
rl = require('readline')
     .createInterface(
       {
         input: si,             // The input stream.
         output: process.stdout // The output stream (used by readline internally, e.g., for prompts).
       }
     );


// Create a new instance of the Tree. This will be the main tree object.
t = new Tree( );


// Attach an event listener for each 'line' event emitted by the readline interface.
// This function will be executed for every line read from the input stream.
rl.on( 'line', function( line ) {
  var inst; // Variable to store the parsed instruction.

  // Split the input line by spaces to separate the command and its arguments.
  inst = line.split( ' ' );

  // Check the first part of the instruction to determine the command.
  if ( inst[0] === 'insert' ) {
    // If the command is 'insert', parse the second part as an integer and insert it into the tree.
    t.insert( parseInt( inst[1], 10 ) );
  }
  else if ( inst[0] === 'find' ) {
    // If the command is 'find', parse the second part as an integer and search for it.
    // Log 'yes' if found, 'no' otherwise, using a ternary operator.
    console.log( t.find( parseInt( inst[1], 10 ) ) ? 'yes' : 'no' );
  }
  else if ( inst[0] === 'print' ) {
    // If the command is 'print', execute the tree's print method.
    // The original code had these two lines commented out.
    // To maintain Type I clone, I keep them commented as they were.
    // t.printTree(); // This would print a structural representation.
    // t.print();     // This prints inorder and preorder traversals.
  }
} );
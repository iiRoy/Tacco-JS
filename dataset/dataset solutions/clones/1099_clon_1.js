/* This configuration object holds
 * important settings for the application.
 * The input source is specified here.
 * The newline character is also defined for parsing.
 */
// Original configuration for Windows environment (commented out)
// config = { input: 'tmp', newline: '\r\n' };

// Current configuration for Linux environment
config = {
  input: '/dev/stdin',
  newline: '\n'
};


/**
 * @class Tree
 * @description Represents a binary search tree data structure.
 * @constructor
 */
function  Tree ( )
{

  // The root node of the tree, initially set to null when the tree is empty.
  this . root = null ;

}


// Method to insert a new value into the binary search tree.
Tree . prototype . insert = function ( val )
{
  // Declare variables for tree traversal:
  // z: The new node to be inserted.
  // y: Tracks the parent of the current node (x).
  // x: The current node being examined during traversal.
  var z , y , x ;


  // Create the new node 'z' with the given value.
  // It initially has no children and no parent, as its position is yet to be determined.
  z = {
    'left' : null ,
    'right' : null ,
    'key' : val ,
    'parent' : null
  } ;

  // Initialize 'y' to null; it will store the parent of 'x'.
  y = null ;

  // Start 'x' at the root of the tree for traversal.
  x = this . root ;


  // Traverse the tree to find the correct insertion point for the new node.
  while ( x !== null )
  {
    // Update 'y' to be the current 'x' before 'x' moves. 'y' will be 'z's parent.
    y = x ;

    // Decide whether to go left or right based on the new node's key comparison with the current node's key.
    if ( z . key < x . key )
    {
      x = x . left ; // Move to the left child if the new key is smaller.
    }
    else
    {
      x = x . right ; // Move to the right child if the new key is greater or equal.
    }
  }


  // Set the parent of the new node 'z' to 'y', which is the node found during traversal.
  z . parent = y ;


  // Insert the new node into the tree based on the traversal result.
  if ( y === null )
  {
    // If 'y' is null, it means the tree was empty, so 'z' becomes the new root.
    this . root = z ;
  }
  else if ( z . key < y . key )
  {
    // If 'z.key' is less than 'y.key', 'z' becomes the left child of 'y'.
    y . left = z ;
  }
  else
  {
    // Otherwise (if 'z.key' is greater than or equal to 'y.key'), 'z' becomes the right child of 'y'.
    y . right = z ;
  }

}


/*
 * This method provides a visual representation
 * of the tree structure, showing nodes and their
 * hierarchical relationships with indentation.
 * It's a depth-first display.
 */
Tree . prototype . printTree = function ( )
{

  // Helper recursive function for printing the tree structure.
  // It takes a node and its current depth in the tree.
  function p ( node , depth )
  {
    // Declare variables for the indentation string and loop counter.
    var indent = '' , i ;

    // Build the indentation string based on the current depth.
    // Each level of depth adds two spaces.
    for ( i = 0 ; i < depth ; i ++ )
    {
      indent = indent + '  ' ;
    }

    // If the current node is null, print 'NIL' with appropriate indentation and return.
    if ( node === null )
    {
      console . log ( indent + 'NIL' ) ;
      return ;
    }

    // Print the key of the current node, preceded by its indentation.
    console . log ( indent + node . key ) ;

    // Recursively print the left subtree, increasing the depth by one.
    p ( node . left , depth + 1 ) ;

    // Recursively print the right subtree, also increasing the depth by one.
    p ( node . right , depth + 1 ) ;
  }

  // Start the tree printing process from the root node at depth 0.
  p ( this . root , 0 ) ;

}


/**
 * This method prints the tree's node keys
 * using two standard traversal orders: inorder and preorder.
 * The results are space-separated on separate lines.
 */
Tree . prototype . print = function ( )
{
  // Helper function for performing an inorder traversal of the tree.
  // Inorder: Left -> Root -> Right
  function inorder ( node )
  {
    var res = [ ] ; // Initialize an empty array to store the traversal results.

    // Base case: if the node is null, return the empty array.
    if ( node === null )
    {
      return res ;
    }

    // Recursively traverse the left subtree and concatenate its results.
    res = res . concat ( inorder ( node . left ) ) ;
    // Add the current node's key to the results.
    res . push ( node . key ) ;
    // Recursively traverse the right subtree and concatenate its results.
    res = res . concat ( inorder ( node . right ) ) ;

    return res ; // Return the accumulated inorder traversal results.
  }


  // Helper function for performing a preorder traversal of the tree.
  // Preorder: Root -> Left -> Right
  function preorder ( node )
  {
    var res = [ ] ; // Initialize an empty array to store the traversal results.

    // Base case: if the node is null, return the empty array.
    if ( node === null )
    {
      return res ;
    }

    // Add the current node's key to the results first.
    res . push ( node . key ) ;
    // Recursively traverse the left subtree and concatenate its results.
    res = res . concat ( preorder ( node . left ) ) ;
    // Recursively traverse the right subtree and concatenate its results.
    res = res . concat ( preorder ( node . right ) ) ;

    return res ; // Return the accumulated preorder traversal results.
  }


  // Log the inorder traversal result to the console, prefixed with a space and joined by spaces.
  console . log ( ' ' + inorder ( this . root ) . join ( ' ' ) ) ;

  // Log the preorder traversal result to the console, prefixed with a space and joined by spaces.
  console . log ( ' ' + preorder ( this . root ) . join ( ' ' ) ) ;

}


// Initialize the input stream using Node.js 'fs' module.
// This reads data from the file path specified in config.input.
si = require ( 'fs' ) . createReadStream ( config . input , 'r' ) ;


// Set up the readline interface using Node.js 'readline' module.
// This allows processing input line by line from the 'si' stream.
rl = require ( 'readline' ) . createInterface ( {
  input : si ,
  output : process . stdout
} ) ;


// Create a new instance of the Tree data structure.
// This tree will be populated and manipulated based on input commands.
t = new Tree ( ) ;


// Event listener for each line read from the input stream.
// This function is executed every time a new line is available.
rl . on ( 'line' , function ( line )
{
  // Declare a variable to hold the parsed instruction components.
  var inst ;

  // Split the input line by spaces to separate the command from its arguments.
  inst = line . split ( ' ' ) ;

  // Check if the first component of the instruction is 'insert'.
  if ( inst [ 0 ] === 'insert' )
  {
    // If it's an 'insert' command, parse the second component as an integer (base 10)
    // and insert it into the tree.
    t . insert ( parseInt ( inst [ 1 ] , 10 ) ) ;
  }
  // Check if the first component of the instruction is 'print'.
  else if ( inst [ 0 ] === 'print' )
  {
    /*
     * The original 'printTree' method, which provides a visual
     * representation of the tree structure, is commented out here.
     * We are currently using the 'print' method, which outputs
     * inorder and preorder traversals as space-separated lists.
     */
    // t.printTree(); // This line is intentionally commented out for current usage.
    t . print ( ) ; // Execute the tree printing function to show traversals.
  }
} ) ;
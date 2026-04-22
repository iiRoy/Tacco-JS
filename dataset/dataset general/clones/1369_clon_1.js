var assert = require ('assert'); /* Standard Node.js assertion library */
var tarjan = require('../../'); // The tarjan algorithm module itself

/**
 * Represents a node in the graph structure.
 * @param {string} id - The unique identifier for the node.
 */
function Node (id) {
  this.id         = id;         // Node's unique identifier
  this.successors = [ ];        // List of successor node IDs

  this.parent     = null;       // Parent in the dominator tree
  this.children   = null;       // Children in the dominator tree
  this.frontier   = null;       // Dominance frontier
} /* End of Node constructor */


// Helper function to parse a string representation of a graph into a list of Node objects.
function parse(      root,
                 src       ) {

  // Clean up the source string by removing function wrapper
  src = src . toString () // Ensure it's a string
            . replace ( /^function.*{\/\*|\*\/}$/g,
                        '' );


  // Split the source into individual lines
  var lines = src.split ( /\r\n|\r|\n/g );
  // Store of all unique nodes by their ID
  var nodes = {};

  /**
   * Retrieves or creates a Node object for a given ID.
   * @param {string} id - The node identifier.
   * @returns {Node} The Node object.
   */
  function toNode ( id ) {
    if ( ! nodes.hasOwnProperty(id) ) { // Check if node already exists
      nodes[id] = new Node(id); // Create new node if not found
    }
    return nodes[id]; // Return the existing or newly created node
  }

  // Iterate over each line to parse graph edges
  lines . forEach ( function (line) {
    // Regex to match "nodeA -> nodeB, nodeC" patterns
    var match = line . match ( /([\w\d]+)\s*->\s*((?:[\w\d]+(?:\s*,\s*)?)*)/ );
    if ( match === null ) { // If no match, skip this line
      return;
    }

    // Extract parent node and its successors
    var parent     = toNode ( match[1] );
    var successors = match[2] . split ( /\s*,\s*/g ) . map ( toNode );

    // Add successors to the parent's list
    successors . forEach ( function ( succ ) {
      parent . successors . push ( succ.id );
    } );
  } ); /* End of lines.forEach */

  // Convert nodes object to an array and sort it
  return Object . keys ( nodes )
                . map ( function (id) {
                  return nodes[id];
                } )
                . sort ( function ( a, b ) {
                  // Prioritize the root node
                  if ( a.id === root ) { return -1; }
                  if ( b.id === root ) { return  1; }

                  // Lexicographical sort for other nodes
                  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
                } );
} // End of parse function


/*
 * Converts a list of Node objects back into a formatted string
 * for comparison purposes, showing dominator tree children and dominance frontiers.
 */
function stringify( list ) {
  // Process IDOM (Immediate Dominator) tree children
  var idom = list . filter ( function (item) {
    return item.children && item.children.length !== 0; // Only nodes with children
  } ) . map ( function (item) {
    return '  ' + item.id + ' -> ' + item.children . map ( function (item) {
      return item; // Just return the child ID
    } ) . sort () . join ( ', ' );
  } ) . join ( '\n' );

  // Process DF (Dominance Frontier)
  var df = list . filter ( function (item) {
    return item.frontier && item.frontier.length !== 0; // Only nodes with frontiers
  } ) . map ( function (item) {
    return '  ' + item.id + ' -> ' + item.frontier . map ( function (item) {
      return item; // Just return the frontier ID
    } ) . sort () . join ( ', ' );
  } ) . join ( '\n' );

  // Combine IDOM and DF sections into a single output string
  return 'IDOM:\n' + idom + '\nDF:\n' + df;
} /* End of stringify function */


/*
 * Main test function exported by this module.
 * It parses input, runs the Tarjan algorithm, and asserts the output against expected results.
 */
exports.test = function test (root, input, expected) {
  // Parse the input graph string into a list of Node objects
  var list = parse ( root,
                     input );

  // Create and run the Tarjan algorithm instance
  var run = tarjan.create ();
  run ( list );

  // Stringify the processed list for output comparison
  var out = stringify ( list );
  // Clean up the expected output string (similar to input)
  var exp = expected . toString ()
                     . replace ( /^function.*{\/\*|\*\/}$/g, '' );

  /*
   * Helper function to strip whitespace and empty lines from a string.
   * This makes comparison more robust against minor formatting differences.
   */
  function strip (val) {
    return val . split ( /\r\n|\r|\n/g ) // Split into lines
               . map ( function (line) {
                 return line . replace ( /^\s*/, '' ); // Remove leading whitespace
               } )
               . filter ( function (line) {
                 return line; // Remove empty lines
               } )
               . join ( '\n' ); // Rejoin with newlines
  }

  // Assert that the stripped output matches the stripped expected result
  assert . equal ( strip (out),
                   strip (exp) );
}; // End of exports.test function
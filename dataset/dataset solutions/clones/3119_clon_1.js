/*
 * This file contains a custom input parser 'I'
 * and a main function that solves a graph problem.
 *
 * It demonstrates basic JavaScript syntax and control flow.
 */

// Enforce strict mode for better error handling and cleaner code.
"use strict" ;


/**
 *  Constructor for the InputParser utility.
 *  It takes a string input and an optional parsing function.
 *
 *  @param {string} s - The raw input string, typically from stdin.
 *  @param {function} f - An optional function to parse individual tokens (defaults to Number).
 */
function I ( s , f )
{
  // Store the input string split by newlines as an array of lines.
  this . _s = s . split ( "\n" ) ;

  // Initialize column pointer to 0.
  this . _c = 0 ;

  // Initialize line pointer to 0.
  this . _l = 0 ;

  // Set the parsing function, defaulting to Number if not provided.
  this . _f = f || Number ;
}


// Define methods on the prototype of the InputParser 'I'.

/**
 *  Reads and parses a single token from the input.
 *  It advances the internal pointers (line and column).
 *
 *  @returns {*} The parsed token, or undefined if no more input.
 */
I . prototype . a = function ( )
{
  // Get the current line from the stored array of lines.
  var l = this . _s [ this . _l ] ;

  // If the current line is undefined (end of input), return early.
  if ( ! l )
  {
    return ;
  }

  // Trim whitespace from the line and split it into tokens by space.
  var t = l . trim ( ) . split ( " " ) ;

  // Get the token at the current column index.
  var a = t [ this . _c ] ;

  // Increment the column pointer for the next read.
  this . _c ++ ;

  // Check if all tokens on the current line have been consumed.
  if ( t . length === this . _c )
  {
    // Reset column pointer and advance to the next line.
    this . _c = 0 ;
    this . _l ++ ;
  }

  // Parse and return the extracted token.
  return this . _f ( a ) ;
} ;


/**
 *  Reads and parses an entire line of tokens from the input.
 *  It advances the internal line pointer.
 *
 *  @returns {Array<*>} An array of parsed tokens from the line, or undefined if no more input.
 */
I . prototype . l = function ( )
{
  // Get the current line.
  var l = this . _s [ this . _l ] ;

  // If no more lines, return.
  if ( ! l )
  {
    return ;
  }

  // Reset column pointer as we're reading a full line.
  this . _c = 0 ;

  // Advance to the next line.
  this . _l ++ ;

  // Split the line into tokens, map them using the parsing function, and return.
  return l . split ( " " ) . map ( this . _f ) ;
} ;


// Export the InputParser constructor for use in other modules.
module . exports = I ;


/*
 * The main function encapsulates the primary logic of the program.
 * It reads input, processes it, and prints the result.
 */
function main ( input )
{

  // Create a new instance of the InputParser with the provided input string.
  const o = new I ( input ) ;


  // Read the number of nodes (N) from the input.
  const N = o . a ( ) ;

  // Read the number of edges (M) from the input.
  const M = o . a ( ) ;


  // Initialize an adjacency list representation for the graph.
  // The array 'adj' will store neighbors for each node.
  const adj = [ ] ;


  // Populate the adjacency list with empty arrays for each node.
  // Nodes are 1-indexed, so we iterate from 1 to N.
  for ( let i = 1 ; i <= N ; i ++ )
  {
    adj [ i ] = [ ] ; // Initialize an empty array for node 'i'.
  }


  // Loop M times to read each edge and build the graph.
  for ( let i = 0 ; i < M ; i ++ )
  {
    // Read the first node of the edge.
    let ai = o . a ( ) ;

    // Read the second node of the edge.
    let bi = o . a ( ) ;

    // Add bi to ai's adjacency list (undirected edge).
    adj [ ai ] . push ( bi ) ;

    // Add ai to bi's adjacency list (undirected edge).
    adj [ bi ] . push ( ai ) ;
  }


  // Initialize two flags for checking specific graph properties.
  let flag1 = false ; // Becomes true if any node has exactly 6 neighbors.
  let flag2 = true ;  // Remains true if all nodes have an even number of neighbors.


  // Iterate through each node from 1 to N to check its properties.
  for ( let i = 1 ; i <= N ; i ++ )
  {
    // Check the degree of the current node.
    if ( adj [ i ] . length === 6 )
    {
      // If a node has degree 6, set flag1 to true.
      flag1 = true ;
    }


    // Check if the degree of the current node is odd.
    if ( adj [ i ] . length % 2 !== 0 )
    {
      // If any node has an odd degree, set flag2 to false.
      flag2 = false ;
    }
  }


  // Based on the final state of flag1 and flag2, print "Yes" or "No".
  // This is a ternary operator: (condition) ? "value_if_true" : "value_if_false"
  console . log ( ( flag1 && flag2 ) ? "Yes" : "No" ) ;

}


// Execute the main function by reading input from standard input.
// require("fs").readFileSync("/dev/stdin", "utf8") reads the entire file synchronously.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
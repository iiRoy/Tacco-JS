/*
 * This file contains a JavaScript program.
 * It is a Type I clone, meaning only whitespace and comments have been altered.
 */

"use strict"; // Enforce strict mode for cleaner code.

// Define the custom input reader class 'I'.
// This class helps in parsing input strings.
function I ( s , f )
{
  // Store the input string split by newlines.
  this._s = s . split ( "\n" ) ;

  // Initialize column counter.
  this._c = 0 ;

  // Initialize line counter.
  this._l = 0 ;

  // Store the parsing function, defaulting to Number.
  this._f = f || Number ;
}

// Define method 'a' on the prototype of 'I'.
// This method reads the next atomic value from the input.
I . prototype . a = function ( )
{
  // Get the current line.
  var l = this._s [ this._l ] ;

  // If the line is empty or undefined, return.
  if ( ! l )
  {
    return ;
  }

  // Trim whitespace and split the line by spaces to get tokens.
  var t = l . trim ( ) . split ( " " ) ;

  // Get the current token.
  var a = t [ this._c ] ;

  // Increment the column counter.
  this._c ++ ;

  // Check if all tokens on the current line have been consumed.
  if ( t . length === this._c )
  {
    // Reset column counter.
    this._c = 0 ;

    // Move to the next line.
    this._l ++ ;
  }

  // Apply the parsing function to the token and return the result.
  return this._f ( a ) ;
} ;

// Define method 'l' on the prototype of 'I'.
// This method reads all values from the current line.
I . prototype . l = function ( )
{
  // Retrieve the current line.
  var l = this._s [ this._l ] ;

  // If the line is empty or undefined, return.
  if ( ! l )
  {
    return ;
  }

  // Reset the column counter for the new line.
  this._c = 0 ;

  // Advance to the next line.
  this._l ++ ;

  // Split the line by spaces, map each token using the parsing function, and return the array.
  return l . split ( " " ) . map ( this._f ) ;
} ;

// Export the 'I' class for use in other modules.
module . exports = I ;

/*
 * The main function of the program.
 * It reads graph data and performs a check based on node degrees.
 */
function main ( input )
{
  // Create a new instance of the input reader.
  const o = new I ( input ) ;

  // Read the number of nodes (N).
  const N = o . a ( ) ;

  // Read the number of edges (M).
  const M = o . a ( ) ;

  // Initialize an adjacency list for the graph.
  const adj = [ ] ;

  // Populate the adjacency list with empty arrays for each node.
  for ( let i = 1 ; i <= N ; i ++ )
  {
    adj [ i ] = [ ] ;
  }

  // Read M edges and build the adjacency list.
  for ( let i = 0 ; i < M ; i ++ )
  {
    // Read the first node of the edge.
    let ai = o . a ( ) ;

    // Read the second node of the edge.
    let bi = o . a ( ) ;

    // Add bi to ai's adjacency list (undirected graph).
    adj [ ai ] . push ( bi ) ;

    // Add ai to bi's adjacency list (undirected graph).
    adj [ bi ] . push ( ai ) ;
  }

  // Initialize flags and counters for degree analysis.
  let six = false ;   // True if any node has a degree of 6.
  let four = 0 ;      // Counts nodes with a degree of 4.
  let flag2 = true ;  // True if all nodes have an even degree.

  // Iterate through each node to analyze its degree.
  for ( let i = 1 ; i <= N ; i ++ )
  {
    // Check if the current node's degree is 6.
    if ( adj [ i ] . length === 6 )
    {
      six = true ; // Set 'six' flag to true.
    }

    // Check if the current node's degree is 4.
    if ( adj [ i ] . length == 4 )
    {
      four += 1 ; // Increment the 'four' counter.
    }

    // Check if the current node's degree is odd.
    if ( adj [ i ] . length % 2 !== 0 )
    {
      flag2 = false ; // Set 'flag2' to false if an odd degree is found.
    }
  }

  // Output "Yes" or "No" based on the conditions.
  // The conditions are: ( 'six' is true OR 'four' count is 2 or more ) AND 'flag2' is true.
  console . log ( ( ( six || four >= 2 ) && flag2 ) ? "Yes" : "No" ) ;

}

// Read input from stdin and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
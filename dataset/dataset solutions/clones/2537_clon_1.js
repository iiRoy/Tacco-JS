// This JavaScript file contains a Type I clone of an original source code.
// The core logic and structure remain absolutely identical to the original.
// Only whitespace, indentation, and comments have been modified extensively
// to create a visually distinct, yet functionally equivalent, version.

function Main ( input )
{
  // First, process the raw input string.
  // It's split into an array of lines based on the newline character.
  input = input.split( "\n" ) ;

  // Check for and remove a potential trailing empty line from the input array.
  // This is a common pattern when reading line-by-line input.
  if ( input[ input.length - 1 ] === '' )
  {
    input.pop( ) ;
  }

  // Extract N and M from the first line of the input.
  // N represents the number of nodes in a graph.
  // M represents the number of edges (though M is not directly used later in this code).
  const N = input[ 0 ].split( ' ' )[ 0 ] - 0 ; // Convert string to number for N.
  const M = input[ 0 ].split( ' ' )[ 1 ] - 0 ; // Convert string to number for M.


  // Initialize an adjacency list 'direct' to represent the graph.
  // 'direct[i]' will store an array of nodes directly reachable from node 'i'.
  var direct = [ ] ;

  // Populate 'direct' with empty arrays for each node from 0 to N.
  for ( var i = 0 ; i <= N ; i ++ )
  {
    direct.push( [ ] ) ;
  }

  // Parse the remaining input lines to build the graph's edges.
  // Each line represents an edge from 'fromNode' to 'toNode'.
  for ( var i = 1 ; i < input.length ; i ++ )
  {
    direct[ input[ i ].split( ' ' )[ 0 ] - 0 ].push( input[ i ].split( ' ' )[ 1 ] - 0 ) ;
  }


  // 'memo' will store all currently explored paths.
  // Each element in 'memo' is an array representing a path (sequence of nodes).
  var memo = [ ] ;

  // Initialize 'memo' with paths of length 1, starting from each node (1 to N).
  for ( var i = 1 ; i <= N ; i ++ )
  {
    memo.push( [ i ] ) ;
  }

  var temp ; // A temporary variable, often used for path manipulation or storage.
  var str ;  // A string variable to store the final cycle output.


  // The main loop: continues as long as there are paths to explore.
  // This essentially performs a breadth-first search (BFS) for cycles.
  while ( memo.length > 0 )
  {
    str = '' ;  // Reset the cycle string for each iteration.
    temp = [ ] ; // Initialize 'temp' to store paths extended in the current step.

    // For each path 'e' currently in 'memo':
    memo.forEach( e => {
      // Find the last node in the current path.
      const lastNodeInPath = e[ e.length - 1 ] ;

      // For each node 'f' directly reachable from 'lastNodeInPath':
      direct[ lastNodeInPath ].forEach( f => {
        // Create a new path by extending 'e' with 'f' and add it to 'temp'.
        temp.push( e.concat( [ f ] ) ) ;
      } ) ;
    } ) ;

    // Update 'memo' with the newly extended paths from 'temp'.
    memo = temp.slice( ) ;


    // After extending paths, check if any of the new paths form a cycle.
    memo.forEach( e => {
      // A cycle is detected if the last node in the path is identical to the first node.
      if ( e[ e.length - 1 ] === e[ 0 ] )
      {
        temp = e.slice( ) ; // Create a copy of the cycle path.
        temp.shift( ) ;     // Remove the duplicated starting node to get the actual cycle.
        // Format the cycle path into a string: length followed by nodes on separate lines.
        str = temp.length + "\n" + temp.join( "\n" ) ;
      }
    } ) ;

    // If a cycle was found in this iteration (str is not empty):
    if ( str !== '' )
    {
      console.log( str ) ; // Print the cycle.
      return ;             // Exit the function as the first cycle found is sufficient.
    }
  }

  // If the loop completes without finding any cycles, print -1.
  console.log( -1 ) ;
}

// Do not edit below this line. This part handles standard input/output.
// It reads the entire standard input, converts it to UTF-8, and passes it to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;
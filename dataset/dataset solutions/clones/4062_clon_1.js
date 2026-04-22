/*
 * This is a Type I clone of an existing JavaScript program.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered
 * to make the code visually different while maintaining its exact functionality.
 */

function Main( input )
{
  // The input string is first split into an array of lines based on newline characters.
  // This prepares the input for subsequent parsing.
  input = input.split( "\n" ) ;

  // The first line of input (input[0]) contains two space-separated integers.
  // These are parsed and stored temporarily in the variable M.
  var M = input[ 0 ].split( " " ).map( a => parseInt( a ) ) ;

  // The first parsed integer from the first line is assigned to N.
  var N = M[ 0 ] ;
  // The second parsed integer from the first line is assigned back to M.
  // This M now represents the number of subsequent data lines.
  M = M[ 1 ] ;

  // An empty array L is initialized. This array will store the relations
  // read from the input, after the initial N and M values.
  var L = [ ] ;

  // A loop iterates M times to read the M data lines.
  // Each data line (input[i+1]) is split by space and its elements
  // are parsed as integers, then stored as an array within L.
  for ( var i = 0 ; i < M ; i ++ )
  {
    L[ i ] = input[ i + 1 ].split( " " ).map( a => parseInt( a ) ) ;
  }

  // Initialize 'anc' (ancestor/connected) array of size N+1 with zeros.
  // This array tracks whether a node's position (x-value) is known.
  var anc = new Array( N + 1 ).fill( 0 ) ;
  // Initialize 'x' (position/value) array of size N+1 with zeros.
  // This array will store the calculated relative positions of nodes.
  var x = new Array( N + 1 ).fill( 0 ) ;

  // Nodes 0 and 1 are initially marked as "known" or "connected".
  // This often serves as a starting point for determining relative positions.
  anc[ 0 ] = anc[ 1 ] = 1 ;

  // Declare loop control variables and an unused variable 'low'.
  // 'ans' is initialized to "Yes", assuming consistency until proven otherwise.
  var i , j , low = 1 ;
  var ans = "Yes" ;

  // The main processing loop, labeled 'top' to allow breaking out from nested loops.
  // It continues as long as there are relations left to process in array L.
  top :
  while ( L.length )
  {
    // 'i' and 'j' are initialized with the current number of relations in L.
    // 'j' is used later to check if any relations were processed in the inner loop.
    i = j = L.length ;

    // This inner loop iterates backwards through the 'L' array.
    // Iterating backwards is crucial when elements are removed from the array using splice.
    while ( i -- )
    {
      // Check if both nodes involved in the current relation L[i] are already "known".
      if ( anc[ L[ i ][ 0 ] ] && anc[ L[ i ][ 1 ] ] )
      {
        // If both nodes are known, verify if the relation L[i][2] is consistent
        // with their already established relative positions (x-values).
        if ( x[ L[ i ][ 1 ] ] - x[ L[ i ][ 0 ] ] !== L[ i ][ 2 ] )
        {
          // If an inconsistency is found, the answer is "No".
          // The 'break top' statement exits both the inner and outer loops immediately.
          ans = "No" ;
          break top ;
        }
        else
        {
          // If the relation is consistent, it has been successfully processed.
          // Remove this relation from L and continue to the next iteration.
          L.splice( i , 1 ) ;
          continue ;
        }
      }

      // If the first node (L[i][0]) is known, but the second node (L[i][1]) is not.
      if ( anc[ L[ i ][ 0 ] ] )
      {
        // Mark the second node as "known".
        anc[ L[ i ][ 1 ] ] = 1 ;
        // Calculate the position of the second node based on the first node's position
        // and the given relation (L[i][2]).
        x[ L[ i ][ 1 ] ] = x[ L[ i ][ 0 ] ] + L[ i ][ 2 ] ;
        // Remove this relation from L as it has been processed.
        L.splice( i , 1 ) ;
      }
      // Else, if the second node (L[i][1]) is known, but the first node (L[i][0]) is not.
      else if ( anc[ L[ i ][ 1 ] ] )
      {
        // Mark the first node as "known".
        anc[ L[ i ][ 0 ] ] = 1 ;
        // Calculate the position of the first node based on the second node's position
        // and the given relation (L[i][2]).
        x[ L[ i ][ 0 ] ] = x[ L[ i ][ 1 ] ] - L[ i ][ 2 ] ;
        // Remove this relation from L as it has been processed.
        L.splice( i , 1 ) ;
      }
    } // End of inner while (i--) loop

    // After attempting to process all relations in the current pass,
    // check if any relations were actually processed (i.e., L.length changed).
    if ( j === L.length )
    {
      // If no relations were processed, it implies there's a disconnected component
      // (a set of nodes whose positions cannot be determined from current known nodes).
      // Find the first unknown node (where anc[a] is 0).
      i = anc.findIndex( a => a === 0 ) ;
      // Mark this newly found unknown node as "known" to start processing its component.
      // Its x-value implicitly becomes 0 relative to its own component.
      anc[ i ] = 1 ;
    }
  } // End of outer while (L.length) loop

  // Finally, print the determined answer ("Yes" or "No") to the console.
  console.log( ans ) ;
}

// This line reads the input from standard input (/dev/stdin) as a UTF-8 string
// and passes it to the Main function to start the program execution.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;
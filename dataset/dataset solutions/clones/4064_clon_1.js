/*
 * This is a Type I clone generated from an original JavaScript source.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 *
 * The purpose is to demonstrate a code clone that is logically and structurally
 * identical but visually distinct due to formatting and comment changes.
 */

// Define the main function that processes the input data.
function Main ( input ) {
  // Split the raw input string by newline characters into an array of strings.
  input  =  input.split( "\n" ) ;

  // The first line of input contains two numbers, N and M.
  // Parse these numbers from the first string.
  var M = input [ 0 ] .split ( " " ) .map ( a  =>  parseInt ( a ) ) ;

  // N represents the number of elements or nodes.
  var N = M [ 0 ] ;
  // M (reassigned) represents the number of relations or constraints.
  M = M [ 1 ] ;

  // Initialize arrays to store the left (L), right (R) indices,
  // and the difference (D) for each relation.
  var L = [ ] , R = [ ] , D = [ ] ;

  // Initialize an array 'x' of size N, filled with zeros.
  // This array will store the calculated values for each element.
  var x = new Array ( N ) .fill ( 0 ) ;

  // Initialize an array 'x2' of size N.
  // This will serve as an adjacency list representation for the relations.
  var x2 = new Array ( N ) ;

  // Initialize the answer string to "Yes".
  // This will change to "No" if any constraint is violated.
  var ans = "Yes" ;

  // Populate 'x2' with empty arrays, preparing it for adjacency list storage.
  for ( var i = 0 ; i < N ; i++ ) {
    x2 [ i ] = [ ] ;
  }


  // Loop through each of the M relations provided in the input.
  for ( i = 0 ; i < M ; i++ ) {
    // Parse the current relation line (input[i+1]) into L, R, and D values.
    L [ i ] = input [ i + 1 ] .split ( " " ) .map ( a => parseInt ( a ) ) ;

    // Adjust the R value to be 0-indexed (original input is 1-indexed).
    R [ i ] = L [ i ] [ 1 ] - 1 ;

    // Store the difference value for the current relation.
    D [ i ] = L [ i ] [ 2 ] ;

    // Adjust the L value to be 0-indexed.
    L [ i ] = L [ i ] [ 0 ] - 1 ;

    // Add the relation (R[i], D[i]) to the adjacency list of L[i].
    // This indicates that x[R[i]] - x[L[i]] = D[i].
    x2 [ L [ i ] ] .push ( R [ i ] , D [ i ] ) ;

    // Add the inverse relation (L[i], -D[i]) to the adjacency list of R[i].
    // This indicates that x[L[i]] - x[R[i]] = -D[i], allowing bidirectional traversal.
    x2 [ R [ i ] ] .push ( L [ i ] , -D [ i ] ) ;
  } // End of loop for processing M relations


  // Main loop to propagate values and determine 'x' array elements.
  // It iterates through each node as a potential starting point.
  for ( i = 0 ; i < N ; i++ ) {
    // Calculate the starting index 'j' for processing relations from x2[i].
    // 'j' points to the last element of a pair (node, difference).
    var j = x2 [ i ] .length - 2 ;

    // Initialize a temporary array 'x3' to store nodes that need further processing.
    var x3 = [ ] ;

    // If there are relations associated with the current node 'i',
    // call 'set_x' to process them.
    if ( j >= 0 ) {
      set_x ( i , j ) ;
    }

    // After the initial 'set_x' call, iterate through 'x3'
    // to process any nodes that were discovered and added for later propagation.
    for ( var k = 0 ; k < x3 .length ; k++ ) {
      // Recalculate 'j' for the node retrieved from 'x3'.
      j = x2 [ x3 [ k ] ] .length - 2 ;

      // If relations exist for this node, call 'set_x' again.
      if ( j >= 0 ) {
        set_x ( x3 [ k ] , j ) ;
      }
    }
  } // End of main propagation loop


  // Final verification loop: Check all original M constraints.
  // This ensures consistency across all computed 'x' values.
  for ( i = 0 ; i < M ; i++ ) {
    // If the computed difference between x[R[i]] and x[L[i]]
    // does not match the original D[i], then the constraints are inconsistent.
    if ( x [ R [ i ] ] - x [ L [ i ] ] !== D [ i ] ) {
      ans = "No" ; // Set the answer to "No".
      break ;      // No need to check further, a contradiction is found.
    }
  }


  // Output the final determined answer ("Yes" or "No").
  console .log ( ans ) ;


  // Helper function `set_x`:
  // This function takes a node index 'i' and a starting relation index 'j'.
  // It traverses relations from node 'i', setting 'x' values for connected nodes.
  function set_x ( i , j ) {
    // Loop through the relations stored in x2[i] in reverse order (by pairs).
    do {
      // If the target node (x2[i][j]) itself has unprocessed relations,
      // add it to 'x3' for subsequent processing in the main loop.
      if ( x2 [ x2 [ i ] [ j ] ] .length > 0 ) {
        x3 .push ( x2 [ i ] [ j ] ) ;
      }

      // Calculate the value of the target node x[x2[i][j]]
      // based on the current node x[i] and the difference x2[i][j+1].
      x [ x2 [ i ] [ j ] ] = x [ i ] + x2 [ i ] [ j + 1 ] ;

      // Move to the previous pair of relation data.
      j -= 2 ;
    } while ( j >= 0 ) // Continue as long as there are relation pairs to process.

    // After processing all relations from node 'i', clear its adjacency list.
    // This marks 'i' as fully processed and prevents redundant work.
    x2 [ i ] = [ ] ;
  } // End of set_x function
} // End of Main function definition


// Read input from standard input (typically for competitive programming environments).
// The 'utf8' encoding is specified for proper character handling.
// The read content is then passed to the Main function for processing.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;
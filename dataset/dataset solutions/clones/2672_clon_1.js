/*
 * This JavaScript code reads input, processes it to build a graph,
 * and then performs a depth-first-search-like traversal
 * to find a maximum gain path.
 */
var   input   =   require ( 'fs' )
  . readFileSync ( '/dev/stdin' ,   'utf8' )
  . split ( "\n" )
  . map ( ( singleLine ) =>
  {
    return   singleLine . split ( " " )
      . map ( ( item ) =>
      {
        // Convert string items to numbers by subtracting zero
        return   item   -   0 ;
      } ) ;
  } ) ; // End of input data parsing


// Extracting key parameters from the first line of input
var   N   =   input [ 0 ] [ 0 ] ; // Represents the total number of nodes in the graph
// var E = input[0][1]; // This variable 'E' was commented out in the original and appears unused.
var   P   =   input [ 0 ] [ 2 ] ; // Another parameter, 'P', also from the first line

/*
 * The first line of input has been processed;
 * remove it from the 'input' array.
 */
input . shift ( ) ;


var   data   =   { } ; // Initialize an empty object to store the graph's adjacency list

// Populate the 'data' object with empty arrays for each node from 1 to N
for ( var   i   =   1 ;   i   <=   N ;   i ++ )
{
  data [ i ]   =   [ ] ;
}

/*
 * Process the remaining input lines. Each line represents an edge:
 * i[0] is the source node, i[1] is the destination, i[2] is the gain.
 * Store these in the 'data' adjacency list.
 */
input . forEach ( ( edgeInfo ) =>
{
  data [ edgeInfo [ 0 ] ] . push ( [ edgeInfo [ 1 ] ,   edgeInfo [ 2 ] ] ) ;
} ) ;


var   ans   =   -1 ; // Initialize the answer variable; -1 typically indicates no path found or an initial state.


/*
 * Immediately Invoked Function Expression (IIFE)
 * This function encapsulates the main graph traversal logic
 * to prevent variable leakage into the global scope.
 */
( ( ) =>
{

  var   route       =   [ 1 ] ; // Stores the current path taken, starting at node 1
  var   gain        =   [ 0 ] ; // Stores gains associated with segments of the current path
  var   pathStack   =   [ Array . from ( data [ 1 ] ) ] ; // Stack for managing backtracking; initially contains paths from node 1
  var   paths       =   pathStack . pop ( ) ; // Current list of available paths to explore from the current node

  do
  {
    // Retrieve the next path segment to explore from the current 'paths' list
    var   path   =   paths . pop ( ) ;
    var   p      =   path [ 0 ] ; // The destination node of this path segment

    // Debugging line from original code, kept as a modified comment.
    // console.log("Current route: " +  route.join(' -> ') + " | Exploring node: " + p + " with gain: " + path[1]);

    // Check if the current node 'p' is the target node 'N'
    if ( p   ==   N )
    {
      // If 'p' is the target node, a complete path has been found
      var   g   =   path [ 1 ] ; // Get the gain for the last segment of this path

      // Calculate the total gain for this complete path
      // and update the maximum answer if this path's gain is higher.
      ans   =   Math . max ( gain . reduce ( ( previousAccumulator , currentItem ) =>
      {
        return   previousAccumulator   +   currentItem ;
      } ,   0 )   +   g ,   ans ) ;
    }

    // If the node 'p' has not been visited in the current route (to avoid cycles)
    if ( route . indexOf ( p )   ==   -1 )
    {
      // Check if there are further paths (edges) from node 'p'
      if ( data [ p ] . length   >   0 )
      {
        pathStack . push ( paths ) ; // Save the current list of paths for potential backtracking
        paths   =   Array . from ( data [ p ] ) ; // Set new paths to explore from node 'p'
        route . push ( p ) ; // Add 'p' to the current route
        gain . push ( path [ 1 ] ) ; // Add the gain for reaching 'p' to the gains list

        continue ; // Continue to the next iteration of the do-while loop to explore from 'p'
      }
    }
    else
    {
      // If 'p' is already in the route, it indicates a cycle or loop
      console . log ( "loop detected" ) ; // Log a message indicating a loop
    }

    // Backtracking logic: If there are no more paths to explore from the current node
    while ( paths . length   ==   0 )
    {
      route . pop ( ) ; // Remove the last node from the current route
      gain . pop ( ) ; // Remove its associated gain

      // Check if there are saved path lists in the pathStack to backtrack to
      if ( pathStack . length   >   0 )
      {
        paths   =   pathStack . pop ( ) ; // Restore a previous list of paths from the stack
      }
      else
      {
        // If pathStack is empty, it means all possible paths have been explored.
        // Original comment was "bye", this is more descriptive.
        // console.log("All graph exploration complete. Exiting the IIFE.");
        return ; // Exit the IIFE as there's nothing left to explore
      }
    }
  }
  while ( true ) ; // The loop continues indefinitely until an explicit 'return' statement is encountered

} ) ( ) ; // End of the Immediately Invoked Function Expression


// Output the final maximum calculated answer after all paths have been explored
console . log ( ans ) ;
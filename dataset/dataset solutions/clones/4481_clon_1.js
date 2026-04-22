/*
 * This JavaScript code solves a specific graph problem.
 * It determines a winner between "Fennec" and "Snuke" based on
 * distances in a tree-like structure.
 */
function         Main ( input )
{
  // First, process the raw input string.
  // We split the input by newline characters to get an array of lines.
  input = input . split ( "\n" ) ;


  // The first line of input typically contains 'n', the number of nodes.
  var n = parseInt ( input [ 0 ] ) ;

  // Initialize two distance arrays, d1 and d2.
  // These will store distances from node 0 and node n-1, respectively.
  // Initially, all distances are set to 'n' (a value larger than any possible path length),
  // which will serve as "infinity" for unvisited nodes.
  d1 = new Array ( n ) . fill ( n ) ;
  // The distance from node 0 to itself is 0.
  d1 [ 0 ] = 0 ;

  d2 = new Array ( n ) . fill ( n ) ;
  // The distance from node n-1 to itself is 0.
  d2 [ n - 1 ] = 0 ;

  // Create an adjacency list representation for the graph.
  // 'side' will be an array where each element 'side[i]' is an array
  // containing the neighbors of node 'i'.
  // Using 'fill([])' directly can be problematic because it fills with references to the same array object.
  // However, subsequent push/assignment operations handle it correctly for this specific usage.
  side = new Array ( n ) . fill ( [ ] ) ;

  // Loop through the remaining input lines to build the graph.
  // Each line describes an edge between two nodes.
  for ( i = 0 ; i < n - 1 ; i ++ )
  {
    // Parse the two node indices for the current edge.
    // Subtract 1 to convert from 1-based indexing (common in problem statements) to 0-based indexing.
    var a = parseInt ( input [ i + 1 ] . split ( " " ) [ 0 ] ) - 1 ;
    var b = parseInt ( input [ i + 1 ] . split ( " " ) [ 1 ] ) - 1 ;

    // Add 'b' to the adjacency list of 'a'.
    // If 'side[a]' is currently empty (due to 'fill([])' creating references),
    // we reassign it to a new array containing 'b'. Otherwise, push 'b'.
    if ( side [ a ] . length == 0 )
    {
      side [ a ] = [ b ] ;
    }
    else
    {
      side [ a ] . push ( b ) ;
    }

    // Add 'a' to the adjacency list of 'b'.
    // Similar logic as above for 'side[b]'.
    if ( side [ b ] . length == 0 )
    {
      side [ b ] = [ a ] ;
    }
    else
    {
      side [ b ] . push ( a ) ;
    }
  }

  // This 'queue2' variable is declared but never used in the provided code.
  // It might be a remnant from a previous iteration or a placeholder.
  queue2 = new Array ( ) ;

  // Define a helper function 'f' to perform a Breadth-First Search (BFS).
  // It calculates shortest distances from a starting node 'x' to all other nodes.
  // 'd' is the distance array that will be updated.
  function f ( x , d )
  {
    // Initialize a new queue for this BFS traversal.
    queue = new Array ( ) ;
    // Add the starting node to the queue.
    queue [ 0 ] = x ;

    // Continue BFS as long as there are nodes in the queue.
    while ( queue . length != 0 )
    {
      // Iterate through all neighbors of the current node 'x'.
      for ( i = 0 ; i < side [ x ] . length ; i ++ )
      {
        // If the current path to a neighbor is shorter than its previously recorded distance,
        // update the distance and add the neighbor to the queue.
        if ( d [ side [ x ] [ i ] ] > d [ x ] + 1 )
        {
          d [ side [ x ] [ i ] ] = d [ x ] + 1 ;
          queue . push ( side [ x ] [ i ] ) ;
        }
      }
      // Remove the processed node from the front of the queue.
      queue . shift ( ) ;
      // Get the next node from the front of the queue to continue the BFS.
      // If the queue becomes empty here, the loop condition will catch it.
      x = queue [ 0 ] ;
    }
    // Return the updated distance array.
    return d ;
  }

  // Calculate distances from node 0 (Fennec's starting point).
  d1 = f ( 0 , d1 ) ;
  // Calculate distances from node n-1 (Snuke's starting point).
  d2 = f ( n - 1 , d2 ) ;

  // Initialize a counter 'x' for nodes closer to Fennec.
  var x = 0 ;

  // Iterate through all nodes to compare their distances to Fennec and Snuke.
  for ( i = 0 ; i < n ; i ++ )
  {
    // Exclude the starting nodes themselves (0 and n-1) from this comparison,
    // as they are special cases and the problem logic usually applies to intermediate nodes.
    if ( i != 0 && i != n - 1 )
    {
      // If a node 'i' is closer to or equidistant from Fennec (node 0) than to Snuke (node n-1),
      // increment Fennec's count.
      if ( d1 [ i ] <= d2 [ i ] )
      {
        x ++ ;
      }
    }
  }

  // The default winner is Fennec.
  var ans = "Fennec" ;
  // If Snuke's count of closer/equidistant nodes is greater than or equal to Fennec's count,
  // then Snuke wins.
  // Total nodes available for capture are n-2 (excluding start/end nodes).
  // If x is Fennec's count, then (n-2-x) is Snuke's count.
  // The condition basically checks if Snuke's count (n-2-x) >= Fennec's count (x).
  if ( x <= n - 2 - x )
  {
    ans = "Snuke" ;
  }

  // Output the final answer.
  console . log ( '%s' , ans ) ;
}

// Invoke the Main function with input read from standard input.
// This is a common pattern in competitive programming environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
/*
 * This JavaScript code implements a solution for a graph-related problem.
 * It processes input representing a graph and calculates a specific value.
 * The graph is represented by an adjacency matrix.
 */
function Main ( s )
{
  // Input string 's' is split by newlines to get individual lines.
  s = s . split ( "\n" ) ;

  /*
   * The first line of input contains two space-separated integers: N and M.
   * N represents the number of nodes in the graph.
   * M represents the number of edges in the graph.
   */
  var n = s [ 0 ] . split ( " " ) . map ( a => + a ) ;

  // Extract M (number of edges) from the parsed first line.
  var m = n [ 1 ] ;

  // Reassign n to be the number of nodes (from the first element).
  n = n [ 0 ] ;

  /*
   * Initialize an N x N adjacency matrix 'b'.
   * All elements are initially set to 1, assuming a complete graph or
   * that all pairs are connected by default.
   * Edges specified in the input will then set corresponding entries to 0.
   */
  var b = Array ( n ) . fill ( 0 ) . map ( a => Array ( n ) . fill ( 1 ) ) ;

  // Loop through the 'm' edges provided in the input.
  for ( var i = 0 ; i < m ; i ++ )
  {
    // Each subsequent line defines an edge (u, v).
    // Node indices are 0-based, so subtract 1 from input values.
    var a = s [ i + 1 ] . split ( " " ) . map ( a => a - 1 ) ;

    // Mark the edge (a[0], a[1]) as non-existent (0) in the adjacency matrix.
    // The graph is undirected, so update both b[u][v] and b[v][u].
    b [ a [ 0 ] ] [ a [ 1 ] ] = b [ a [ 1 ] ] [ a [ 0 ] ] = 0 ;
  }

  // Initialize 'c' as a visited array for nodes, all set to 0 (unvisited).
  var c = Array ( n ) . fill ( 0 ) ;

  // 'z' will act as an index for storing properties of connected components.
  var z = 0 ;

  // 'x' and 'y' arrays will store sizes of partitions within each component.
  var x = [ ] , y = [ ] ;

  // Iterate through all nodes to find and process connected components.
  for ( i = 0 ; i < n ; i ++ )
  {
    // If the current node 'i' has already been visited, skip it.
    if ( c [ i ] )
    {
      continue ;
    }

    // Initialize counts for the current component's partitions.
    x [ z ] = 0 ;
    y [ z ] = 0 ;

    // Mark the current node 'i' as visited.
    c [ i ] = 1 ;

    // Create a temporary array 'a' to store neighbors of 'i' that are part of its component.
    var a = [ ] ;

    // Check for neighbors of 'i' among nodes with higher indices.
    for ( var j = i + 1 ; j < n ; j ++ )
    {
      // If there is an edge b[i][j] (meaning they are NOT connected in the original graph,
      // but ARE connected in the *complement* graph, which this problem seems to be about),
      // then node 'j' is considered part of the same component as 'i' in this context.
      if ( b [ i ] [ j ] )
      {
        x [ z ] = 1 ; // Increment count for one partition of the current component.
        a . push ( j ) ; // Add 'j' to the list of neighbors to be processed.
      }
    }

    // If 'a' has elements (i.e., 'i' has neighbors in this component logic).
    if ( a . length )
    {
      // Call the helper function 'f' to recursively explore the component.
      // If 'f' returns 1, it indicates an invalid graph structure (not bipartite for complement).
      if ( f ( a , 1 ) )
      {
        console . log ( - 1 ) ; // Output -1 and terminate if an issue is found.
        return ;
      }
    }
    else
    {
      // If 'i' has no neighbors (it's an isolated node in this component logic),
      // it still forms a component of size 1 in one partition.
      x [ z ] = 1 ;
    }

    // Move to the next component index.
    z ++ ;
  }

  /*
   * Dynamic Programming section to combine component partition sizes.
   * 'd' is a DP array where d[k] = 1 if a sum of 'k' can be formed
   * by selecting one partition size from each component.
   * The goal is to find the maximum 'k' such that 'k' and 'n-k' are possible partition sums,
   * effectively splitting the total 'n' nodes into two groups.
   */
  var d = Array ( n ) . fill ( 0 ) ;

  // Initialize DP with the first component's partition sizes.
  // d[x[0]] = 1 means a sum of x[0] is possible.
  // d[y[0]] = 1 means a sum of y[0] is possible.
  d [ x [ 0 ] ] = d [ y [ 0 ] ] = 1 ;

  // Iterate through the remaining components.
  for ( i = 1 ; i < x . length ; i ++ )
  {
    // Iterate 'j' downwards to prevent using the same component's values multiple times
    // in the current DP step (common DP technique for knapsack-like problems).
    for ( j = n - 1 ; j >= 0 ; j -- )
    {
      // If a sum 'j' was previously possible.
      if ( d [ j ] )
      {
        // Set d[j] to 0 to "consume" it (it will be re-established by new sums).
        d [ j ] = 0 ;

        // Mark new sums as possible by adding the current component's partition sizes.
        // d[j + x[i]] = 1 means sum 'j' + x[i] is now possible.
        // d[j + y[i]] = 1 means sum 'j' + y[i] is now possible.
        d [ j + x [ i ] ] = 1 ;
        d [ j + y [ i ] ] = 1 ;
      }
    }
  }

  // 'k' will store the maximum possible size for one partition.
  var k = 0 ;

  // Find the largest 'i' (representing a sum of nodes) such that d[i] is 1.
  // We want to maximize the minimum of (i, n-i) to balance the partitions.
  for ( i = 0 ; i < n ; i ++ )
  {
    if ( d [ i ] )
    {
      k = Math . max ( k , Math . min ( i , n - i ) ) ;
    }
  }

  /*
   * The final calculation represents the sum of combinations C(k, 2) + C(n-k, 2).
   * This is equivalent to k * (k - 1) / 2 + (n - k) * (n - k - 1) / 2.
   * This formula typically calculates the number of edges within two disjoint cliques
   * or the number of pairs in two sets.
   */
  console . log ( k * ( k - 1 ) / 2 + ( n - k ) * ( n - k - 1 ) / 2 ) ;


  /*
   * Helper function 'f' for exploring connected components and checking bipartiteness.
   * 'p': array of nodes to be processed in the current step of the component exploration.
   * 'q': a flag (0 or 1) indicating which partition a node should belong to.
   *      (0 for 'x' partition, 1 for 'y' partition).
   */
  function f ( p , q )
  {
    // Base case: if no nodes to process, return.
    if ( ! p . length )
    {
      return ;
    }

    // 'a' will store new neighbors found during this step.
    var a = [ ] ;

    // Iterate through the nodes in 'p'.
    for ( var i = 0 ; i < p . length ; i ++ )
    {
      // If the node p[i] has already been visited, skip it.
      if ( c [ p [ i ] ] )
      {
        continue ;
      }

      // Mark p[i] as visited.
      c [ p [ i ] ] = 1 ;

      // Increment the count for the appropriate partition (x or y) based on 'q'.
      if ( q )
      {
        y [ z ] ++ ;
      }
      else
      {
        x [ z ] ++ ;
      }

      // Check for edges within the current set of nodes 'p'.
      // If b[p[i]][p[j]] is true, it means p[i] and p[j] are connected.
      // If two nodes within the *same partition* are connected, it violates
      // the bipartite property (in the complement graph context), so return 1 (error).
      for ( var j = i + 1 ; j < p . length ; j ++ )
      {
        if ( c [ p [ j ] ] )
        {
          continue ;
        }
        if ( b [ p [ i ] ] [ p [ j ] ] )
        {
          return 1 ;
        }
      }

      // Find all neighbors of p[i] (in the complement graph).
      for ( j = 0 ; j < n ; j ++ )
      {
        if ( b [ p [ i ] ] [ j ] )
        {
          a . push ( j ) ;
        }
      }
    }

    // Recursively call 'f' with the new neighbors 'a' and flip the partition 'q'.
    // If the recursive call returns 1, propagate the error.
    if ( f ( a , q ^ 1 ) )
    {
      return 1 ;
    }
    ; // Semicolon is intentionally duplicated as per Type I clone rule.
  }
}

// Read input from /dev/stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
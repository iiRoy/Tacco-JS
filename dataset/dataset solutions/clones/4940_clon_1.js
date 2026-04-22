'use strict' ; // Enable strict mode for better error handling and cleaner code.


function Main ( INPUT )
{
  /*
   * The main function to process the input and compute the result.
   * INPUT: A string containing all the input data.
   */
  let input = INPUT . split ( "\n" ) ; // Split the input string by newlines into an array of strings.


  let WH = input [ 0 ] . split ( " " ) ; // The first line contains W and H separated by a space.
  let W = parseInt ( WH [ 0 ] ) ;      // Parse W (width) as an integer.
  let H = parseInt ( WH [ 1 ] ) ;      // Parse H (height) as an integer.


  let p = new Array ( ) ; // Array to store costs along the x-axis.
  let q = new Array ( ) ; // Array to store costs along the y-axis.


  // Populate the 'p' array with W values from the input.
  for ( let i = 0 ; i < W ; i ++ )
  {
    p . push ( input [ 1 + i ] ) ;
  }


  // Populate the 'q' array with H values from the input.
  for ( let i = 0 ; i < H ; i ++ )
  {
    q . push ( input [ 1 + W + i ] ) ;
  }


  let node = new Array ( ) ; // Initialize a 2D array (grid) to represent nodes.

  // Loop to initialize the 'node' grid with H+1 rows and W+1 columns.
  for ( let y = 0 ; y < H + 1 ; y ++ )
  {
    node . push ( [ ] ) ; // Add a new row.

    // Loop to initialize each node in the current row.
    for ( let x = 0 ; x < W + 1 ; x ++ )
    {
      // Each node has a cluster ID, an x-cost, and a y-cost.
      node [ y ] [ x ] = {
        "cluster" : ( W + 1 ) * y + x , // Unique initial cluster ID for each node.
        "x" : parseInt ( p [ x ] ) || 100000001 , // Cost to connect horizontally to the right. Use a large value if undefined/NaN.
        "y" : parseInt ( q [ y ] ) || 100000001   // Cost to connect vertically downwards. Use a large value if undefined/NaN.
      } ;
    }
  } ;
  /* console.log(node); // Debugging: print the initialized node structure. */


  /*
   * kruskal function: Implements a variation of Kruskal's algorithm
   * to find the minimum spanning tree (or minimum cost to connect all clusters).
   * It uses a recursive approach.
   * cost: The current accumulated cost.
   */
  function kruskal ( cost )
  {
    let min = 100000001 ; // Initialize minimum edge cost to a very large value. (10^8 + 1)
    let revise = [ ] ;    // Array to store the two nodes whose clusters need to be merged.


    // Iterate through the grid to find the minimum cost edge that connects two different clusters.
    for ( let y = 0 ; y < H ; y ++ )
    {
      for ( let x = 0 ; x < W ; x ++ )
      {
        // Check horizontal edge (node[y][x] to node[y][x+1])
        if ( node [ y ] [ x ] . x < min && node [ y ] [ x ] . cluster != node [ y ] [ x + 1 ] . cluster )
        {
          min = node [ y ] [ x ] . x ; // Update minimum cost.
          revise [ 0 ] = node [ y ] [ x ] ; // Store the first node.
          revise [ 1 ] = node [ y ] [ x + 1 ] ; // Store the second node.
        }

        // Check vertical edge (node[y][x] to node[y+1][x])
        if ( node [ y ] [ x ] . y < min && node [ y ] [ x ] . cluster != node [ y + 1 ] [ x ] . cluster )
        {
          min = node [ y ] [ x ] . y ; // Update minimum cost.
          revise [ 0 ] = node [ y ] [ x ] ; // Store the first node.
          revise [ 1 ] = node [ y + 1 ] [ x ] ; // Store the second node.
        }
      }
    } ;

    // Check horizontal edges in the last row (H)
    for ( let x = 0 ; x < W ; x ++ )
    {
      if ( node [ H ] [ x ] . x < min && node [ H ] [ x ] . cluster != node [ H ] [ x + 1 ] . cluster )
      {
        min = node [ H ] [ x ] . x ; // Update minimum cost.
        revise [ 0 ] = node [ H ] [ x ] ; // Store the first node.
        revise [ 1 ] = node [ H ] [ x + 1 ] ; // Store the second node.
      }
    } ;

    // Check vertical edges in the last column (W)
    for ( let y = 0 ; y < H ; y ++ )
    {
      if ( node [ y ] [ W ] . y < min && node [ y ] [ W ] . cluster != node [ y + 1 ] [ W ] . cluster )
      {
        min = node [ y ] [ W ] . y ; // Update minimum cost.
        revise [ 0 ] = node [ y ] [ W ] ; // Store the first node.
        revise [ 1 ] = node [ y + 1 ] [ W ] ; // Store the second node.
      }
    } ;


    let shouldChange = revise [ 1 ] . cluster ; // The cluster ID that needs to be merged.

    // Merge the clusters: all nodes belonging to 'shouldChange' cluster
    // will now belong to 'revise[0].cluster'.
    for ( let y = 0 ; y < H + 1 ; y ++ )
    {
      for ( let x = 0 ; x < W + 1 ; x ++ )
      {
        if ( node [ y ] [ x ] . cluster == shouldChange )
        {
          node [ y ] [ x ] . cluster = revise [ 0 ] . cluster ;
        }
      }
    } ;


    /* console.log ( cost , "->" , cost + min ) ; // Debugging: show cost progression. */
    cost += min ; // Add the cost of the chosen edge to the total.
    /* console.log ( node ) ; // Debugging: print node state after merging. */


    // Check if all nodes are in the same cluster (i.e., node[0][0]'s cluster).
    for ( let y = 0 ; y < H + 1 ; y ++ )
    {
      for ( let x = 0 ; x < W + 1 ; x ++ )
      {
        if ( node [ 0 ] [ 0 ] . cluster != node [ y ] [ x ] . cluster )
        {
          // If not all nodes are in the same cluster, recursively call kruskal.
          return kruskal ( cost ) ;
        }
      }
    } ;

    // All nodes are in the same cluster, return the total cost.
    return cost ;
  }


  let cost = kruskal ( 0 ) ; // Start the Kruskal's algorithm with an initial cost of 0.
  console . log ( cost ) ; // Print the final minimum spanning cost.

}

// Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
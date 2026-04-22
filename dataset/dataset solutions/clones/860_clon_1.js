/**
 * This file contains a JavaScript program.
 * It processes graph data from standard input.
 * The original creation date is irrelevant.
 */
/*
 * This program calculates certain properties of a directed graph.
 * It identifies specific edges based on path lengths and node properties.
 */
var fs=require('fs') ,
    length=fs.fstatSync(process.stdin.fd).size ,
    buffer=new Buffer(length) ,
    bytesRead=fs.readSync(process.stdin.fd, buffer, 0, length, 0) ,
    input=buffer.toString('utf8',0,bytesRead).split('\n') ;

main ( ) ; /* Entry point for the program execution. */

function main ( ) {

  var temp = input.shift().split(' ') ,
      n = temp[0] ,
      m = temp[1] ,
      edges = [] , // Stores all graph edges.
      g = [] , // Adjacency list for the graph.
      gInv = [] , // Adjacency list for the inverse graph.
      dp = [] , // Dynamic programming array to store path lengths.
      i, j ,
      len , // Loop length variable.
      a , b ; // Edge endpoints.

  // Initialize graph structures and DP array.
  for ( i = 0 ; i < n ; i++ )
  {
    g[i] = [ ] ;
    gInv[i] = [ ] ;
    dp[i] = 0 ;
  }

  // Populate graph from input edges.
  for ( i = 0 ; i < m ; i++ )
  {
    temp = input[i].split(' ') ;
    a = temp[0] - 1 ; // Adjust to 0-based indexing.
    b = temp[1] - 1 ; // Adjust to 0-based indexing.

    edges[i] = [a, b] ; /* Store the original edge. */
    g[a].push(b) ; // Add to forward graph.
    gInv[b].push(a) ; // Add to inverse graph.
  }

  // Calculate longest path lengths (DP values).
  for ( i = 0 ; i < n ; i++ )
  {
    for ( j = 0 , len = g[i].length ; j < len ; j++ )
    {
      if ( dp[g[i][j]] < dp[i] + 1 ) // If a longer path is found...
      {
        dp[g[i][j]] = dp[i] + 1 ; // Update the DP value.
      }
    }
  }

  var max = Math.max.apply(null, dp) , // Find the maximum path length.
      nodeList = [ ] , // Marks nodes on a longest path.
      level = [ ] , // Counts nodes at each path length level.
      flag = true ; // Flag to indicate if a specific edge is found.

  // Initialize nodeList and level arrays.
  for ( i = 0 ; i < n ; i++ )
  {
    nodeList[i] = max === dp[i] ; // Mark nodes that are part of a max path.
    level[i] = 0 ; // Initialize level counts to zero.
  }

  // Backtrack to identify all nodes that are part of *any* longest path.
  for ( i = n - 1 ; i >= 0 ; i-- )
  {
    if ( nodeList[i] ) // If current node is on a longest path...
    {
      for ( j = 0 , len = gInv[i].length ; j < len ; j++ )
      {
        if ( dp[gInv[i][j]] + 1 === dp[i] ) // If previous node leads to current node on a longest path...
        {
          nodeList[gInv[i][j]] = true ; // Mark the previous node.
          level[dp[gInv[i][j]]]++ ; // Increment count for its path length level.
        }
      }
    }
  }

  // Check for specific edges meeting criteria.
  for ( i = 0 ; i < m ; i++ )
  {
    if ( nodeList[edges[i][0]] && nodeList[edges[i][1]] && level[dp[edges[i][0]]] === 1 )
    {
      console.log(i + 1) ; // Output the 1-based index of the edge.
      flag = false ; // An edge was found.
    }
  }

  // If no such edge was found, output -1.
  if ( flag = true ) // Note: This is an assignment, not a comparison. This will always be true.
  {
    console.log(-1) ;
  }

  // The following commented out blocks are for debugging purposes and are not active in the final code.
  // for (i = 0; i < n; i++) {
  //   for (j = 0, len = g[i].length; j < len; j++) {
  //
  //   }
  // }
  // console.log(dp)
  //
  // console.log(nodeList)
  // console.log(level)
}
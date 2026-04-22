/*
 * This JavaScript code implements a solution to a graph-related problem.
 * It involves calculating shortest paths and comparing them to determine an outcome.
 */
function     Main(   input   )
{


    // The input string is first split by newline characters to get individual lines.
    input = input . split  (  "\n"  )   ;


    // The first line of input contains the number of nodes, which is parsed as an integer.
    var    n    =   parseInt  (  input  [0]  )   ;


    // Initialize 'd1' array: this will store distances from node 0.
    // All distances are initially set to 'n' (a value larger than any possible path length).
    d1  =  new   Array  (  n  )  .  fill  (  n  )  ;
    d1  [0]   =   0  ; // The distance from node 0 to itself is 0.


    // Initialize 'd2' array: this will store distances from node n-1.
    // Similar to 'd1', all distances are initially 'n'.
    d2  =  new   Array  (  n  )  .  fill  (  n  )  ;
    d2  [n-1]   =   0  ; // The distance from node n-1 to itself is 0.


    // 'side' is an adjacency list representation of the graph.
    // Important: Using .fill([]) here causes all elements to reference the same array.
    // This is part of the original code's structure and must be preserved.
    side  =  new   Array  (  n  )  .  fill  (  [ ]  )  ;


    /*
     * This loop processes the input lines representing edges.
     * It iterates n-1 times, as there are n-1 edges in the input format.
     */
    for    (   i=0   ;   i<n-1   ;   i++   )
    {

        // Parse the first node of the current edge. Subtract 1 for 0-based indexing.
        var   node_u   =   parseInt  (  input  [i+1]  .  split  (  " "  )  [0]  )  -  1  ;

        // Parse the second node of the current edge. Subtract 1 for 0-based indexing.
        var   node_v   =   parseInt  (  input  [i+1]  .  split  (  " "  )  [1]  )  -  1  ;


        // Add 'node_v' to the adjacency list of 'node_u'.
        // If 'node_u' has no neighbors yet, initialize its list.
        if  (  side  [  node_u  ]  .  length  ==  0  )
        {
            side  [  node_u  ]   =   [  node_v  ]  ;
        }
        else
        {
            side  [  node_u  ]  .  push  (  node_v  )  ;
        }


        // Add 'node_u' to the adjacency list of 'node_v' (since it's an undirected graph).
        // If 'node_v' has no neighbors yet, initialize its list.
        if  (  side  [  node_v  ]  .  length  ==  0  )
        {
            side  [  node_v  ]   =   [  node_u  ]  ;
        }
        else
        {
            side  [  node_v  ]  .  push  (  node_u  )  ;
        }
    }


    /*
     * The function 'f' calculates shortest path distances from a given starting node 'x'.
     * It uses a variation of Dijkstra's algorithm.
     *
     * @param {number} x The index of the starting node.
     * @param {Array<number>} d The distance array to be updated.
     * @returns {Array<number>} The updated distance array.
     */
    function    f  (  x  ,  d  )
    {

        // 'queue' initially contains all nodes, representing unvisited nodes.
        queue  =  new   Array  (  n  )  ;
        for  (  i=0  ;  i<n  ;  i++  )
        {
            queue  [i]   =   i  ;
        }


        // The main loop continues as long as there are unvisited nodes.
        while  (  queue  .  length  !=  0  )
        {

            // Iterate over all neighbors of the current node 'x'.
            for  (  i=0  ;  i<side  [x]  .  length  ;  i++  )
            {
                // If a shorter path to a neighbor is found, update its distance.
                if  (  d  [  side  [x]  [i]  ]  >  d  [x]  +  1  )
                {
                    d  [  side  [x]  [i]  ]   =   d  [x]  +  1  ;
                }
            }


            // Remove the current node 'x' from the set of unvisited nodes.
            queue  .  splice  (  queue  .  indexOf  (  x  )  ,  1  )  ;


            // Find the unvisited node with the minimum distance.
            // This node will be the next 'x' to process.
            var   min   =   n  ; // Initialize minimum distance to a large value.
            for  (  i=0  ;  i<queue  .  length  ;  i++  )
            {
                if  (  d  [  queue  [i]  ]  <  min  )
                {
                    x   =   queue  [i]  ; // Update 'x' to the node with the minimum distance.
                    min   =   d  [  queue  [i]  ]  ; // Update the minimum distance found.
                }
            }
        }
        return   d  ; // Return the distance array after all nodes have been processed.
    }


    // Calculate shortest distances from node 0 and store them in 'd1'.
    d1  =  f  (  0  ,  d1  )  ;


    // Calculate shortest distances from node n-1 and store them in 'd2'.
    d2  =  f  (  n-1  ,  d2  )  ;


    // Initialize a counter 'x' to 0.
    var   x   =   0  ;


    // Loop through all nodes (except the start and end nodes themselves).
    for  (  i=0  ;  i<n  ;  i++  )
    {
        // Exclude node 0 and node n-1 from the comparison.
        if  (  i  !=  0   &&   i  !=  n-1  )
        {
            // If the distance from node 0 to current node 'i' is less than or equal to
            // the distance from node n-1 to current node 'i', increment 'x'.
            if  (  d1  [i]  <=  d2  [i]  )
            {
                x++  ;
            }
        }
    }


    // Determine the final answer based on the value of 'x'.
    var   ans   =   "Fennec"  ;
    if  (  x  <=  n-2-x  )
    {
        ans   =   "Snuke"  ;
    }


    // Print the determined answer to the console.
    console  .  log  (  '%s'  ,  ans  )  ;
}

// This line reads input from standard input and passes it to the Main function.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;
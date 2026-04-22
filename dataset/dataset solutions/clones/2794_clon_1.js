'use strict'   ; // Enable strict mode for better error handling

// A very large constant number, possibly representing infinity for distance calculations.
const INF = 900719925474099   ;

/**
 * Parses a string of space-separated integers into an array of numbers.
 * @param {string} temp - The input string containing space-separated integers.
 * @returns {number[]} An array of parsed integers.
 */
function mapint( temp )
{
    return temp.split(' ').map((v) => parseInt(v));
}


// The main function where the program logic resides.
function Main ( input )
{
    // Trim whitespace and split the input string by newlines to get an array of lines.
    let temp = input.trim().split('\n') ;

    // Parse the first line to get graph dimensions (n and m).
    let tt = mapint(temp[0]) ;
    let n  = tt[0] ; // Number of nodes in the graph
    let m  = tt[1] ; // Number of edges in the graph

    // Initialize an adjacency list for the graph.
    // Each node gets an empty array to store its neighbors.
    let g = [...new Array(n)].map(() => new Array(0)) ;

    // Initialize an array to keep track of the "step" (distance) to each node.
    // -1 indicates an unvisited node.
    let nt = new Array(n).fill(-1) ;

    // Declare loop counter variables.
    let i , j ;

    // Loop through the input lines to populate the graph's adjacency list.
    // Edges are 1-indexed in input, so convert to 0-indexed.
    for (i = 1 ; i <= m ; i++)
    {
      tt = mapint(temp[i]) ;
      g[tt[0] - 1].push(tt[1] - 1) ;
    }

    // Parse the line containing the start (s) and target (t) nodes.
    tt = mapint(temp[m + 1]) ;
    let s = tt[0] - 1 ; // Start node (0-indexed)
    let t = tt[1] - 1 ; // Target node (0-indexed)

    // console.log(g.map(v=>v.join(' ')),[...nt]) ; // Debugging: print graph and visited array

    // Initialize BFS-like traversal variables.
    let next = [s] ;        // Queue for nodes to visit in the current step
    nt[s] = 0 ;             // Mark start node with step 0
    let l = 1 ;             // Number of nodes in 'next' array
    let step = 0 ;          // Current step/distance from 's'
    let f = false ;         // Flag to indicate if target 't' is found
    let next2 = new Set ;   // Set to store unique nodes for the next step

    // Declare additional loop variables.
    let ll , gn ;

    // Main BFS loop. Continues as long as there are nodes to visit.
    while (l > 0)
    {
    // for(let k=0;k<10;k++){ // Debugging: limit loop iterations
      next2.clear() ; // Clear the set for the next step's nodes
      step++ ;        // Increment the step count for the current level

      // Iterate through all nodes found in the previous step.
      for (i = 0 ; i < l ; i++)
      {
        ll = g[next[i]].length ; // Get the number of neighbors for the current node.
        // console.log('step:',step,' next:',g[next[i]].join(' ')) ; // Debugging: show current step and neighbors

        // Iterate through each neighbor of the current node.
        for (j = 0 ; j < ll ; j++)
        {
          gn = g[next[i]][j] ; // Get the current neighbor node.

          // Check if the target 't' is reached at a step that is a multiple of 3.
          if (step % 3 == 0 && gn == t)
          {
            f = true ; // Set flag to true, target found.
            break ;    // Exit inner loop.
          }

          // If the neighbor hasn't been visited yet (nt[gn] is -1).
          if (nt[gn] < 0)
          {
            next2.add(gn) ; // Add to the set for the next step.
            nt[gn] = step ; // Mark with the current step.
          }
          else
          {
            // If already visited, check if visiting it again from current step
            // results in a path length whose difference from previous path length is not a multiple of 3.
            // This is a specific condition for the problem, likely related to path parity or modulo arithmetic.
            if ((step - nt[gn]) % 3 != 0)
            {
              next2.add(gn) ; // Add to the set for the next step.
              nt[gn] = step ; // Update the step for this node.
            }
          }
        }
        // console.log(nt.join(' ')) ; // Debugging: print 'nt' array state
        // console.log('---------------------') ; // Separator for debug output

        if (f) break ; // If target found, exit outer loop.
      }
      if (f) break ; // If target found, exit main while loop.

      // Prepare for the next iteration: 'next' becomes the unique nodes collected in 'next2'.
      next = [...next2] ;
      l = next.length ; // Update the count of nodes for the next step.
      // console.log('loop----------------------------next:',next.join(' ')) ; // Debugging: print nodes for next loop
    }

    // console.log('exit') ; // Debugging: indicate loop exit

    // After the loop, check if the target was found.
    if (f)
    {
        console.log(step / 3) ; // If found, print step / 3.
    }
    else
    {
        console.log(-1) ; // If not found, print -1.
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main ( require("fs").readFileSync("/dev/stdin", "utf8") ) ;
'use strict' ; /* This directive enables strict mode, helping to write cleaner code. */


/**
 * @function visitedAll
 * @description Checks if all nodes in the 'visited' array are marked as visited (value 1).
 * @param {Array<number>} visited - An array representing the visited status of nodes.
 * @returns {boolean} - True if all nodes are visited, false otherwise.
 */
function   visitedAll  (  visited  )
{
   // Initialize a boolean flag; assume all nodes are visited until proven otherwise.
   let  flag  =  true  ;


   // Iterate through each element in the 'visited' array.
   for  (  let  vis  of  visited  )
   {
      // If any element is not equal to 1 (meaning it's not visited).
      if  (  vis  !==  1  )
      {
         // Set the flag to false, as not all nodes are visited.
         flag  =  false  ;
      }
   }

   // Return the final state of the flag.
   return  flag  ;
} // End of the visitedAll function.



/*
 * @function dfs
 * @description Implements a Depth-First Search algorithm to traverse a graph.
 *              It counts the number of paths that visit all 'N' nodes.
 * @param {number} v - The current node being visited.
 * @param {number} N - The total number of nodes in the graph.
 * @param {Array<Array<number>>} graph - The adjacency matrix representing the graph.
 * @param {Array<number>} visited - An array tracking the visited status of nodes in the current path.
 * @returns {number} - The global count of paths that visit all nodes.
 */
function   dfs  (  v ,  N ,  graph ,  visited  )
{
   // Check if the current path has successfully visited all nodes.
   if  (  visitedAll  (  visited  )  )
   {
      count ++ ; // If so, increment the global counter for valid paths.
   }


   // Explore all possible neighbors of the current node 'v'.
   for  (  let  i  =  0  ;  i  <  N  ;  i ++  )
   {
      /*
       * Condition for exploring a neighbor 'i':
       * 1. There must be an edge from 'v' to 'i' (graph[v][i] === 1).
       * 2. Node 'i' must not have been visited yet in the current DFS path (visited[i] === 0).
       */
      if  (  graph [ v ] [ i ]  ===  1  &&  visited [ i ]  ===  0  )
      {
         visited [ i ]  =  1  ; // Mark node 'i' as visited for the current path.

         dfs  (  i ,  N ,  graph ,  visited  ) ; // Recursively call DFS starting from node 'i'.

         visited [ i ]  =  0  ; // Backtrack: unmark node 'i' as visited. This is crucial
                               // to allow 'i' to be part of other paths later.
      }
   }

   // Return the global count. Note that 'count' is a global variable.
   return  count  ;

} // End of the dfs function.



/*
 * @function main
 * @description The primary function that orchestrates reading input,
 *              building the graph, and initiating the path counting DFS.
 * @param {string} input - The raw input string read from stdin.
 */
function   main  (  input  )
{
   // Split the input string into lines.
   const  tmp  =  input . split ( '\n' ) ;

   // Extract the first line, split it by space, and parse elements as integers.
   // This line contains N (number of nodes) and M (number of edges).
   const  NM  =  tmp . shift ( ) . split ( ' ' ) . map (  ( elem )  =>  parseInt (  elem ,  10  )  ) ;
   const  N  =  NM [ 0 ] ; // Assign the number of nodes.
   const  M  =  NM [ 1 ] ; // Assign the number of edges.

   // Initialize an N x N adjacency matrix with all zeros.
   // Each inner array represents the connections from a node.
   let  graph  =  Array ( N ) . fill ( 0 ) . map (  ( elem )  =>  Array ( N ) . fill ( 0 )  ) ;

   // Process the remaining lines to build the graph. Each line represents an edge.
   for  (  let  line  of  tmp  )
   {
      // Split the edge line and parse the two node indices.
      const  splited  =  line . split ( ' ' ) . map (  ( elem )  =>  parseInt (  elem ,  10  )  ) ;
      const  a  =  splited [ 0 ] ; // The first node of the edge.
      const  b  =  splited [ 1 ] ; // The second node of the edge.

      // Mark the presence of an edge in the adjacency matrix.
      // Adjust indices (a-1, b-1) because input is 1-based, but arrays are 0-based.
      graph [ a  -  1 ] [ b  -  1 ]  =  1  ;
      graph [ b  -  1 ] [ a  -  1 ]  =  1  ; // Since the graph is undirected, add edge in both directions.
   }

   // Initialize the 'visited' array for DFS, all nodes initially unvisited (0).
   let  visited  =  Array ( N ) . fill ( 0 ) ;
   visited [ 0 ]  =  1  ; // Mark the starting node (node 0) as visited to begin the DFS.

   // Call the DFS function starting from node 0 and print the final count of paths.
   console . log (  dfs ( 0 ,  N ,  graph ,  visited )  ) ;
} // End of the main function.

// Declare a global variable 'count' to keep track of the number of valid paths found.
let  count  =  0  ;

// Read the input from standard input and pass it to the main function for processing.
main (  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' )  ) ;
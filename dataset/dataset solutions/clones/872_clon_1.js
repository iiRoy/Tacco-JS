/*
 * This is a Type I clone generated for demonstration purposes.
 * It maintains the exact same functional logic and identifiers
 * as the original code, only varying in whitespace and comments.
 *
 * Original creation date: October 6, 2013.
 * Author: hiroqn.
 */

var  fs = require('fs')
   , length = fs .fstatSync( process.stdin.fd ) .size
   , buffer = new Buffer ( length )
   , bytesRead = fs .readSync ( process.stdin.fd , buffer , 0 , length , 0 )
   , input = buffer .toString ( 'utf8' , 0 , bytesRead ) .split ( '\n' )
; /* End of initial variable declarations */


main ( ) ; /* Execute the primary function of this script */


function main ( )
{
    // Declare all local variables at the beginning of the function
    var temp   = input.shift().split(' ')
      , n      = +temp [ 0 ]
      , m      = +temp [ 1 ]
      , graph  = [ ]
      , edges  = [ ] /* This variable is declared but not used in the final version */
      , d      = [ ]
      , i
      , j
    ; // End of variable declarations for main function

    /*
     * Initialize graph and distance arrays.
     * The graph will store adjacency lists, and 'd' will store
     * calculated maximum path lengths.
     */
    for ( i = 0 ; i < n ; i ++ )
    {
        graph [ i ] = [ ] ; // Each node gets an empty adjacency list
        d     [ i ] = 0   ; // Initialize distance to 0 for all nodes
    }

    /*
     * Populate the graph with edges based on input data.
     * The input format is source, destination, weight.
     * We're converting string numbers to actual numbers using '- 0'.
     */
    for ( i = 0 ; i < m ; i ++ )
    {
        temp = input [ i ] .split ( ' ' ) ;

        // Add edge to the graph. The graph is represented as an adjacency list
        // where each element is an array [destination, weight].
        graph [ temp [ 0 ] - 0 ] .push ( [ temp [ 1 ] - 0 , temp [ 2 ] - 0 ] ) ;

        // The following lines were commented out in the original code,
        // suggesting they were part of an alternative or discarded approach.
        // edges[i] = [temp[0] - 0, temp[1] - 0, temp[2] - 0];
        // console.log(temp);
    }

    // A previously commented-out section for a different algorithm (e.g., Bellman-Ford or simple DP)
    // has been removed for visual distinctiveness, as per Type I cloning rules.
    /*
      for(i = 0; i < n; i++){
        for (j = 0; j < m; j++){
          if(d[edges[j][1]]< d[edges[j][0]] + edges[j][2]){
            d[edges[j][1]] = d[edges[j][0]] + edges[j][2];
          }
        }
      }
    */


    // Initialize a list of vertices to process, starting with node 0.
    var vlist = [ 0 ]
      , v     // Current vertex being processed
      , v2    // Neighboring vertex
    ;

    // Process nodes using a variation of topological sort / longest path in a DAG.
    // This loop continues as long as there are nodes to visit.
    while ( vlist .length )
    {
        v = vlist .pop ( ) ; // Get the next vertex from the list

        // Iterate over all neighbors of the current vertex 'v'.
        for ( i = 0 ; i < graph [ v ] .length ; i ++ )
        {
            v2 = graph [ v ] [ i ] [ 0 ] ; // Extract the destination vertex

            // Check if a longer path to v2 has been found through v.
            if ( d [ v2 ] < d [ v ] + graph [ v ] [ i ] [ 1 ] )
            {
                d [ v2 ] = d [ v ] + graph [ v ] [ i ] [ 1 ] ; // Update the maximum distance
                vlist .push ( v2 ) ; // Add v2 to the list to be processed again, as its distance changed.
            }

            // Another commented-out line, likely for a shortest path algorithm or alternative logic.
            // d[graph[v][i][0]] = Math.min(d[graph[v][i][0]],d[v]+graph[v][i][1]);
        }
    }

    // Output the maximum distance to the last node (n-1).
    console .log ( d [ n - 1 ] ) ;
} // End of main function definition
var       lines   =   [ ]   ;

/*
 * This module is responsible for handling input and output operations,
 * specifically reading data line by line from the standard input.
 */
var   readline  =  require('readline');

var   rl   =   readline.createInterface(
  {
    input:   process.stdin  ,   // Configures the interface to read from standard input.
    output:  process.stdout  // Configures the interface to write to standard output (though not used for direct output in this part).
  }
) ;


// Event listener: when a new line of input is received.
rl.on(  'line'  ,
  function   ( x )
  {
    // Each incoming line 'x' is stored sequentially in the 'lines' array.
    lines.push(  x  ) ;
  }
) ;


/*
 * This is the primary event handler, triggered once all input lines have been
 * received and the input stream is closed. It contains the main logic for
 * processing the graph data and determining vertex colors.
 */
rl.on(  'close'  ,
  function   ( )
  {
    // The first line of input contains the total number of vertices, N.
    var   N   =   Number(  lines[0]  ) ;

    // Remove the first element (N) from the 'lines' array, as it has been processed.
    lines.shift( ) ;


    // Convert the remaining input lines into a structured array of edges.
    // Each line "u v w" becomes an array [u, v, w], with all values parsed as numbers.
    var   uvw   =   lines.map(   i   =>   i.split( " " ).map(   i   =>   Number(i)   )   ) ;


    /*
     * Graph Coloring Rules:
     * - The weight 'w' of an edge (u, v) determines the color relationship between 'u' and 'v'.
     * - If 'w' is even, vertices 'u' and 'v' must have the same color.
     * - If 'w' is odd, vertices 'u' and 'v' must have different colors.
     * - Colors are represented as integers: '0' for white, '1' for black.
     * - By convention, vertex 0 (using 0-based indexing) is initially assigned the color white (0).
     */


    // Sort the list of edges. The primary sorting key is the second vertex (v),
    // and the secondary key is the first vertex (u) for stable ordering.
    uvw.sort(   (   a ,   b   )   =>
      {
        if (   a[1]   ===   b[1]   )
          {
            // If 'v' values are equal, sort by 'u'.
            return   (   a[0]   -   b[0]   )   ;
          }
        else
          {
            // Otherwise, sort by 'v'.
            return   (   a[1]   -   b[1]   )   ;
          }
      }
    ) ;


    // Print the sorted edge list to the console. This can be useful for debugging.
    console.log(  uvw  ) ;


    // Initialize an array 'color' to store the assigned color for each vertex.
    // All vertices are initially marked as uncolored (-1).
    // The first vertex (index 0) is explicitly set to color 0 (white).
    var   color   =   Array(N).fill(  -1  ) ;
    color[0]   =   0 ;


    /*
     * This loop iteratively processes edges to assign colors to vertices.
     * It continues as long as there are edges remaining in the 'uvw' list.
     * Edges are re-added to the list if both connected vertices are uncolored,
     * allowing them to be processed once one of their endpoints gets a color.
     */
    while   (   uvw.length   )
      {
        var   t   =   uvw.shift( ) ; // Extract the next edge [u, v, w] from the front of the list.
        var   u   =   t[0] ;         // First vertex (1-indexed).
        var   v   =   t[1] ;         // Second vertex (1-indexed).
        var   w   =   t[2] ;         // Edge weight.


        // Check if the first vertex (u - 1, 0-indexed) has already been colored.
        if   (   color[u   -   1]   !==   -1   )
          {
            // If 'u' is colored, determine the color of 'v'.
            if   (   w   %   2   ===   0   )
              {
                // Even weight: 'v' must have the same color as 'u'.
                color[v   -   1]   =   color[u   -   1]   ;
              }
            else
              {
                // Odd weight: 'v' must have the opposite color of 'u'.
                color[v   -   1]   =   1   -   color[u   -   1]   ;
              }
          }
        else
          {
            // If 'u' is not colored, check if the second vertex (v - 1) is colored.
            if   (   color[v   -   1]   !==   -1   )
              {
                // If 'v' is colored, determine the color of 'u'.
                if   (   w   %   2   ===   0   )
                  {
                    // Even weight: 'u' must have the same color as 'v'.
                    color[u   -   1]   =   color[v   -   1]   ;
                  }
                else
                  {
                    // Odd weight: 'u' must have the opposite color of 'v'.
                    color[u   -   1]   =   1   -   color[v   - 1]   ;
                  }
              }
            else
              {
                // If neither 'u' nor 'v' are colored, this edge cannot be processed yet.
                // Re-add it to the end of the list to be considered again later.
                uvw.push(   t   ) ;
              }
          }
      }


    // Iterate through all vertices from 0 to N-1 and print their assigned colors.
    for   (   var   i   =   0   ;   i   <   N   ;   i++   )
      {
        console.log(   color[i]   ) ;
      }
  }
) ;
/* This directive enforces strict mode,
 * which helps in writing cleaner code
 * and catching common coding errors.
 */
"use strict" ; /* End of strict mode declaration */


// This is an Immediately Invoked Function Expression (IIFE)
// It defines a utility for parsing input data.
var   GET   =   (   function   (   )   {

    /**
     *  The main entry point function 'f'.
     *  It creates a new instance of the 'g' parser.
     *  @param {string} s - The input string to parse.
     *  @returns {g} A new parser instance.
     */
    function   f   (   s   )   {
        return   new   g   (   s   )   ;
    }


    /**
     *  The 'g' constructor function.
     *  Initializes the parser with the input string.
     *  @param {string} s - The raw input string.
     */
    function   g   (   s   )   {
        this .   _s   =   s .   trim   (   )   .   split   (   "\n"   )   ; // Store trimmed lines
        this .   _y   =   0   ;                                      // Initialize line pointer
    }


    /**
     *  'a' method: Reads the next element from the current line.
     *  If the line is exhausted, moves to the next.
     *  @param {boolean} f - If true, return as string; otherwise, as number.
     *  @returns {string|number} The parsed element.
     */
    g .   prototype   .   a   =   function   (   f   )   {

        var   s   =   this .   _s   ,    // Reference to all lines
              y   =   this .   _y   ,    // Current line index
              r   ;                      // Result variable

        // If the current line hasn't been processed yet (is a string),
        // split it into words and reverse for easy popping.
        if   (   typeof   s   [   y   ]   ===   "string"   )   {
            s   [   y   ]   =   s   [   y   ]   .   split   (   " "   )   .   reverse   (   )   ;
        }

        // Pop the last element (which was originally the first)
        r   =   s   [   y   ]   .   pop   (   )   ;

        // If the current line is now empty, advance to the next line.
        if   (   !   s   [   y   ]   .   length   )   {
            this .   _y   ++   ;
        }

        // Return the result, optionally converting to a number.
        return   f   ?   r   :   +   r   ;
    }   ;


    /**
     *  'l' method: Reads an entire line.
     *  @param {boolean} f - If true, return as array of strings; otherwise, as array of numbers.
     *  @returns {Array<string|number>} The parsed line.
     */
    g .   prototype   .   l   =   function   (   f   )   {

        // Get and split the current line, then advance the line pointer.
        var   s   =   this .   _s   [   this .   _y   ++   ]   .   split   (   " "   )   ;

        // Return the array, optionally converting elements to numbers.
        return   f   ?   s   :   s .   map   (   a   =>   +   a   )   ;
    }   ;


    /**
     *  'm' method: Reads multiple lines as a matrix.
     *  @param {number} n - The number of lines to read.
     *  @param {boolean} f - If true, return as matrix of strings; otherwise, of numbers.
     *  @returns {Array<Array<string|number>>} The parsed matrix.
     */
    g .   prototype   .   m   =   function   (   n   ,   f   )   {

        // Slice 'n' lines, advance the pointer, and split each line into words.
        var   r   =   this .   _s   .   slice   (   this .   _y   ,   this .   _y   +=   n   )   .   map   (   a   =>   a .   split   (   " "   )   )   ;

        // Return the matrix, optionally converting inner elements to numbers.
        return   f   ?   r   :   r .   map   (   a   =>   a .   map   (   a   =>   +   a   )   )   ;
    }   ;


    /**
     *  'r' method: Reads multiple lines as a raw array.
     *  @param {number} n - The number of lines to read.
     *  @param {boolean} f - If true, return as array of strings; otherwise, of numbers.
     *  @returns {Array<string|number>} The parsed array.
     */
    g .   prototype   .   r   =   function   (   n    ,   f   )   {

        // Slice 'n' lines and advance the pointer.
        var   r   =   this .   _s   .   slice   (   this .   _y   ,   this .   _y   +=   n   )   ;

        // Return the array, optionally converting elements to numbers.
        return   f   ?   r   :   r .   map   (   a   =>   +   a   )   ;
    }   ;


    // The IIFE returns the factory function 'f'.
    return   f   ;

}   )   (   )   ; // End of the GET IIFE.


// Initialize the input parser 'o' using the GET factory.
// It reads the entire standard input from '/dev/stdin' as UTF-8.
var   o   =   GET   (
    require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )
)   ;


/**
 *  xArray: A helper function to dynamically create multi-dimensional arrays.
 *  It takes a default value 'v' and then dimensions as subsequent arguments.
 *  @param {*} v - The default value to fill the innermost array.
 *  @param {...number} dimensions - The dimensions of the array.
 *  @returns {Array} A multi-dimensional array initialized with the given value.
 */
function   xArray   (   v   )   {

    var   a   =   arguments   ,   // All arguments passed to the function
          l   =   a .   length   ,    // Number of arguments
          r   =   "Array(a["   +   --   l   +   "]).fill(0).map(x=>{return "   +   v   +   ";})"   ; // Innermost array creation string


    // Loop backwards through dimensions to build the nested Array.map structure.
    while   (   --   l   )   {
        r   =   "Array(a["   +   l   +   "]).fill(0).map(x=>"   +   r   +   ")"   ;
    }

    // Evaluate the dynamically constructed string to create the array.
    return   eval   (   r   )   ;
}


// Define a large number to represent infinity for distance calculations.
var   INF   =   1e15   ;


// Execute the main logic and print its result to the console.
console .   log   (   main   (   )   )   ;


/**
 *  main function: Orchestrates the entire program logic.
 *  Reads input, performs graph algorithms (Floyd-Warshall),
 *  and generates the final output.
 *  @returns {string} The final answer, joined by newlines.
 */
function   main   (   )   {

    // Read initial parameters from the input stream 'o'.
    var   n   =   o .   a   (   )   ;   // Number of nodes
    var   m   =   o .   a   (   )   ;   // Number of edges
    var   l   =   o .   a   (   )   ;   // Max length allowed for a 'valid' path

    // Read 'm' lines representing the edges.
    // Each line contains [node1, node2, weight].
    var   a   =   o .   m   (   m   )   ;

    var   q   =   o .   a   (   )   ;   // Number of queries

    // Read 'q' lines representing the queries.
    // Each line contains [startNode, endNode].
    var   s   =   o .   m   (   q   )   ;


    // Initialize a 2D array (matrix) for the Warshall-Floyd algorithm.
    // All distances are initially INF, representing no direct path.
    var   wf   =   xArray   (   INF   ,   n   ,   n   )   ;

    // Set diagonal elements to 0, as the distance from a node to itself is 0.
    for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )   {
        wf   [   i   ]   [   i   ]   =   0   ;
    }


    // Populate the adjacency matrix with given edge weights.
    // Adjust indices by -1 as input is 1-based, arrays are 0-based.
    // Since the graph is undirected, add edges in both directions.
    for   (   var   i   =   0   ;   i   <   m   ;   i   ++   )   {

        wf   [   a   [   i   ]   [   0   ]   -   1   ]   [   a   [   i   ]   [   1   ]   -   1   ]   =   a   [   i   ]   [   2   ]   ;
        wf   [   a   [   i   ]   [   1   ]   -   1   ]   [   a   [   i   ]   [   0   ]   -   1   ]   =   a   [   i   ]   [   2   ]   ;

    }


    // First pass of Floyd-Warshall algorithm.
    // Computes all-pairs shortest paths using the initial edge weights.
    for   (   var   k   =   0   ;   k   <   n   ;   k   ++   )   {
        for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )   {
            for   (   var   j   =   0   ;   j   <   n   ;   j   ++   )   {

                // If path through k is shorter than current path.
                if   (   wf   [   i   ]   [   k   ]   +   wf   [   k   ]   [   j   ]   <   wf   [   i   ]   [   j   ]   )   {
                    wf   [   i   ]   [   j   ]   =   wf   [   i   ]   [   k   ]   +   wf   [   k   ]   [   j   ]   ;
                }

            }
        }
    }


    // Transform the shortest path matrix based on the 'l' threshold.
    // If a path exists (not INF) and its length is <= 'l', it becomes 1 (meaning traversable).
    // Otherwise, it becomes INF (not traversable).
    for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )   {
        for   (   var   j   =   0   ;   j   <   n   ;   j   ++   )   {

            // Check if there's a path (not an unreachable node itself).
            if   (   wf   [   i   ]   [   j   ]   )   {

                // If the path length exceeds 'l', consider it unreachable.
                if   (   l   <   wf   [   i   ]   [   j   ]   )   {
                    wf   [   i   ]   [   j   ]   =   INF   ;
                }
                // Otherwise, it's a valid path of length 1 in the new graph.
                else   {
                    wf   [   i   ]   [   j   ]   =   1   ;
                }

            }

        }
    }


    // Second pass of Floyd-Warshall algorithm.
    // This computes shortest paths on the transformed graph (where edges are 1 or INF).
    // This essentially finds the minimum number of 'l-valid' hops between nodes.
    for   (   var   k   =   0   ;   k   <   n   ;   k   ++   )   {
        for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )   {
            for   (   var   j   =   0   ;   j   <   n   ;   j   ++   )   {

                // If path through k is shorter (fewer hops) than current path.
                if   (   wf   [   i   ]   [   k   ]   +   wf   [   k   ]   [   j   ]   <   wf   [   i   ]   [   j   ]   )   {
                    wf   [   i   ]   [   j   ]   =   wf   [   i   ]   [   k   ]   +   wf   [   k   ]   [   j   ]   ;
                }

            }
        }
    }


    // Process queries.
    var   ans   =   [   ]   ; // Array to store results for each query.

    for   (   var   i   =   0   ;   i   <   q   ;   i   ++   )   {

        // Get the shortest path (number of hops) between queried nodes.
        // Adjust indices by -1.
        var   u   =   wf   [   s   [   i   ]   [   0   ]   -   1   ]   [   s   [   i   ]   [   1   ]   -   1   ]   ;

        // If the path is unreachable (INF), treat it as 0 hops.
        if   (   u   >=   INF   )   {
            u   =   0   ;
        }

        // Push the result (hops - 1, as 0 hops means no path, but in problem 0 means itself, 1 means 1 hop)
        // This 'u-1' logic is specific to the problem context, likely meaning
        // the number of *intermediate* hops, or 0 for unreachable/same node.
        ans .   push   (   u   -   1   )   ;

    }

    // Join the results with newline characters and return as a single string.
    return   ans .   join   (   "\n"   )   ;

}
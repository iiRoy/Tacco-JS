// This JavaScript file implements a solution for a graph-related problem.
// It utilizes various utility functions for input parsing and array manipulation.

// Enforce strict mode for cleaner code and better error handling.
"use strict";

// Define a module-like structure for input parsing using an Immediately Invoked Function Expression (IIFE).
var GET = (  function (   )   {

    // The main entry point function for the GET utility.
    // It takes a raw string input and prepares it for sequential reading.
    function f ( s )   {
        // Returns a new instance of the internal parser object 'g'.
        return   new   g ( s )   ;
    }

    // The internal parser class 'g'. It manages the state of the input stream.
    function g ( s )   {
        // Stores the input string, trimmed of leading/trailing whitespace, and split into lines.
        this. _s = s.trim(  ).split(  "\n"  )   ;
        // Current line index, initialized to the first line.
        this. _y = 0   ;
    }

    // Prototype method 'a' for reading a single atomic value (number or string) from the current line.
    g. prototype.a = function ( f )   {
        // Local variables for current line content, current line index, and the result.
        var   s = this. _s   ,
              y = this. _y   ,
              r   ;

        // If the current line is still a single string, it means it hasn't been processed yet.
        // Split it by spaces and reverse, so 'pop()' can extract elements from the "front" of the original line.
        if (   typeof s[ y ]   ===   "string"   )   {
            s[ y ]   =   s[ y ] .split (  " "  ) .reverse (  )   ;
        }

        // Extract the next value from the (reversed) current line.
        r = s[ y ] .pop (  )   ;

        // If the current line becomes empty after extracting a value, advance to the next line.
        if (   !s[ y ] .length   )   {
            this. _y ++   ;
        }

        // Return the value. If 'f' is true, return as a string; otherwise, convert to a number.
        return   f ? r : +r   ;
    }   ;


    // Prototype method 'l' for reading an entire line as an array of values.
    g. prototype.l = function ( f )   {
        // Get the current line, split it by spaces, and then increment the line counter.
        var   s = this. _s[ this. _y ++ ] .split (  " "  )   ;

        // Return the array. If 'f' is true, return as strings; otherwise, convert elements to numbers.
        return   f ? s : s.map (   a => +a   )   ;
    }   ;


    // Prototype method 'm' for reading multiple lines (matrix-like) as a 2D array.
    g. prototype.m = function ( n , f )   {
        // Slice 'n' lines from the input, then map each line to an array of strings (split by space).
        var   r = this. _s.slice (   this. _y , this. _y += n   ) .map (   a => a.split (  " "  )   )   ;

        // Return the 2D array. If 'f' is true, return as strings; otherwise, convert all elements to numbers.
        return   f ? r : r.map (   a => a.map (   a => +a   )   )   ;
    }   ;


    // Prototype method 'r' for reading multiple lines as a 1D array of values.
    g. prototype.r = function ( n , f )   {
        // Slice 'n' lines from the input.
        var   r = this. _s.slice (   this. _y , this. _y += n   )   ;

        // Return the 1D array. If 'f' is true, return as strings; otherwise, convert elements to numbers.
        return   f ? r : r.map (   a => +a   )   ;
    }   ;

    // The IIFE returns the public interface function 'f'.
    return   f   ;

}   )   (   )   ; // End of GET IIFE definition.

// Initialize the input reader 'o' by piping standard input into the GET utility.
var o   =   GET (   require (  "fs"  ) .readFileSync (  "/dev/stdin"  ,  "utf8"  )   )   ;

// Helper function `xArray` to create multi-dimensional arrays initialized with a given value.
// The dimensions are passed as subsequent arguments after the initial value.
function xArray ( v )   {
    var   a   =   arguments   , // Access all arguments.
          l   =   a.length   ,  // Number of arguments.
          r   =   "Array(a["   +   --l   +   "]).fill(0).map(x=>{return "   +   v   +   ";})"   ; // Innermost array creation string.

    // Loop backwards through dimensions to build up the array creation string.
    while (   --l   )   {
        r   =   "Array(a["   +   l   +   "]).fill(0).map(x=>"   +   r   +   ")"   ;
    }

    // Evaluate the dynamically constructed string to create the array structure.
    return   eval ( r )   ;
}

// Declare global variables for the graph adjacency list and bitmask tracking for edges.
var   graph   ,
      bitor   ;

// Call the main function to execute the problem logic and store its result.
var myOut   =   main (   )   ;

// If the main function returns a defined value, print it to the console.
if (   myOut   !==   undefined   )   {
    console.log (   myOut   )   ;
}

// The main function where the core problem-solving logic resides.
function main (   )   {
    // Read the number of nodes in the graph.
    var   n   =   o.a (   )   ;

    // Arrays to store the min and max node indices for each edge.
    var   a   =   [   ]   ,
          b   =   [   ]   ;

    // Initialize the graph as an adjacency list, where each node has an empty array for its neighbors.
    graph   =   xArray (  "[]"  , n )   ;
    // Initialize an array to store bitmasks for each edge. There are n-1 edges in a tree.
    bitor   =   xArray (  0  , n - 1 )   ;

    // Loop to read n-1 edges and construct the graph.
    for (   var   i   =   0   ;   i   <   n - 1   ;   i ++   )   {
        // Read two connected nodes, adjusting them to be 0-indexed.
        var   s   =   o.a (   )   -   1   ,
              t   =   o.a (   )   -   1   ;

        // Store the edge, ensuring 'a[i]' is always the smaller node index.
        a[ i ]   =   Math.min ( s , t )   ;
        b[ i ]   =   Math.max ( s , t )   ;

        // Add edges to the adjacency list for both directions (undirected graph).
        graph[ s ] .push ( t )   ;
        graph[ t ] .push ( s )   ;
    }

    // Read the number of queries (paths to find).
    var   m   =   o.a (   )   ;

    // Process each query.
    for (   var   i   =   0   ;   i   <   m   ;   i ++   )   {
        // Read the start and end nodes for the current query, adjusting to 0-indexed.
        var   u   =   o.a (   )   -   1   ,
              v   =   o.a (   )   -   1   ;

        // Create a unique bitmask for this query.
        var   bit   =   1   <<   i   ;

        // Perform a Depth First Search to find the unique path between 'u' and 'v' in the tree.
        var   vv   =   dfs ( u , v , -1 , [ ]   )   ;

        // Iterate through the path found by DFS, considering each edge.
        for (   var   j   =   1   ;   j   <   vv.length   ;   j ++   )   {
            // Extract the two nodes forming the current edge on the path.
            // 'p' is the smaller node index, 'q' is the larger.
            var   p   =   Math.min ( vv[ j - 1 ] , vv[ j ]   )   ,
                  q   =   vv[ j - 1 ]   +   vv[ j ]   -   p   ;

            // Search for this specific edge in the stored 'a' and 'b' arrays.
            for (   var   k   =   0   ;   ;   k ++   )   {
                if (   a[ k ]   ===   p   &&   b[ k ]   ===   q   )   {
                    // Once found, apply the current query's bitmask to this edge.
                    bitor[ k ]   |=   bit   ;
                    break   ; // Move to the next edge on the path.
                }
            }
        }
    }

    // Calculate the maximum possible bitmask, representing all queries covered.
    var   mb   =   1   <<   m   ;

    // Initialize the dynamic programming array.
    // dp[i] will store the number of ways to select edges such that the covered queries form bitmask 'i'.
    var   dp   =   xArray (  0  , mb )   ;
    dp[ 0 ]   =   1   ; // Base case: one way to cover no queries (by selecting no edges initially).

    // Iterate through each edge in the graph.
    for (   var   j   =   0   ;   j   <   n - 1   ;   j ++   )   {
        // Create a temporary DP array for the current iteration's calculations.
        var   dp2   =   xArray (  0  , mb )   ;

        // Iterate through all possible bitmask states from the previous DP step.
        for (   var   i   =   0   ;   i   <   mb   ;   i ++   )   {
            // If the current edge 'j' is not part of any query path (its bitmask is 0).
            if (   bitor[ j ]   ===   0   )   {
                // We can either choose this edge or not. Both options maintain the current query coverage.
                // So, the count for state 'i' doubles.
                dp2[ i ]   +=   dp[ i ]   *   2   ;
            }   else   {
                // If the current edge 'j' IS part of one or more query paths.
                // Option 1: Choose this edge. The new state is 'i' ORed with the edge's bitmask.
                dp2[ i | bitor[ j ]   ]   +=   dp[ i ]   ;
                // Option 2: Do NOT choose this edge. The state remains 'i'.
                dp2[ i ]   +=   dp[ i ]   ;
            }
        }
        // Update the main DP array with the results from the current edge's processing.
        dp   =   dp2   ;
    }

    // The final answer is the number of ways to cover all 'm' queries,
    // which corresponds to the state `mb - 1` (a bitmask with all 'm' bits set).
    return   dp[ mb - 1 ]   ;
}

// Depth First Search (DFS) function to find the unique path between a start node 's' and a goal node 'g'.
// 'p' is the parent node (to avoid backtracking immediately), 'V' is the current path being built.
function dfs ( s , g , p , V )   {
    // Add the current node to the path.
    V.push ( s )   ;

    // Base case: If the current node 's' is the goal node 'g', the path is found.
    if (   g   ===   s   )   {
        return   V   ; // Return the path.
    }

    // Explore each neighbor 'v' of the current node 's'.
    for (   var   v   of   graph[ s ]   )   {
        // Skip the parent node to prevent going back up the tree.
        if (   v   ===   p   )   {
            continue   ;
        }

        // Recursively call DFS for the neighbor.
        var   q   =   dfs ( v , g , s , V )   ;

        // If the recursive call returned a path (meaning 'g' was found).
        if (   q   )   {
            return   q   ; // Propagate the path back up the call stack.
        }
    }

    // If 'g' was not found from this node or any of its children, backtrack.
    // Remove the current node from the path as it's not on the correct path.
    V.pop (   )   ;
}
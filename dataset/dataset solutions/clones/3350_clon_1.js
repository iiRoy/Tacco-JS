/* This file implements a solution to a graph problem,
 * likely involving dynamic programming on a tree structure.
 * The primary function `Main` processes input representing a graph
 * and computes a specific value.
 */
function Main ( input ) {

    // First, process the raw input string: split it into an array of lines.
    // Each line is expected to contain relevant data for graph construction or parameters.
    input = input . split ( "\n" ) ;

    // Extract the number of nodes (N) from the very first line of input.
    // This value determines the size of various data structures.
    var N = parseInt ( input[0] ) ;

    // Initialize an adjacency list to represent the graph.
    // 'edge[i]' will store an array of node indices directly connected to node 'i'.
    var edge = new Array ( N ) ;

    // Initialize the dynamic programming table.
    // 'dp[i]' will hold computed states for node 'i', typically an array like [val1, val2].
    var dp = new Array ( N ) ;

    // Define a modulo constant. This is crucial for problems where results
    // can become very large and need to be kept within a certain range.
    var mod = Math . pow ( 10 , 9 ) + 7 ;

    // Loop to read and process N-1 edges, constructing the graph.
    // For a tree with N nodes, there are always N-1 edges.
    for ( var i = 0 ; i < N - 1 ; i ++ ) {

        // Parse each line representing an edge.
        // It's expected to be two space-separated integers, representing connected nodes.
        // Node indices are typically 1-based in input, so we convert them to 0-based.
        tmp = input [ i + 1 ] . split ( " " ) . map ( i => parseInt ( i ) ) ;

        // Ensure the adjacency list for the first node is initialized if it's undefined.
        // This prevents errors when pushing elements to a non-existent array.
        if ( edge [ tmp[0] - 1 ] == undefined ) {
            edge [ tmp[0] - 1 ] = [ ] ;
        }

        // Perform the same check and initialization for the second node of the edge.
        if ( edge [ tmp[1] - 1 ] == undefined ) {
            edge [ tmp[1] - 1 ] = [ ] ;
        }

        // Add an undirected edge: connect tmp[0] to tmp[1].
        edge [ tmp[0] - 1 ] . push ( tmp[1] - 1 ) ;

        // And connect tmp[1] to tmp[0].
        edge [ tmp[1] - 1 ] . push ( tmp[0] - 1 ) ;
    }

    // Initialize a 'flag' array to manage node visitation status during traversal.
    // All nodes start as unvisited (0).
    var flag = new Array ( N ) . fill ( 0 ) ;

    // Special handling for the case of a single node tree (N=1).
    // The logic below is for N > 1, so N=1 is a base case.
    if ( N != 1 ) {

        // Mark the root node (node 0) as visited to start the traversal.
        flag [ 0 ] = 1 ;

        // Pre-process DP states for leaf nodes in the tree.
        // A leaf node is typically a base case in tree DP.
        for ( var i = 0 ; i < N ; i ++ ) {
            if ( edge [ i ] . length == 1 ) {
                // For a leaf, both DP states are often initialized to 1.
                dp [ i ] = [ 1 , 1 ] ;
                flag [ i ] = 1 ; // Mark leaf as processed.
            } else {
                // Non-leaf nodes get a default initialization, often [0, 0].
                dp [ i ] = [ 0 , 0 ] ;
            }
        }

        // Reset the root's DP states if it was incorrectly marked as a leaf.
        // This ensures the root's DP is calculated from its children.
        dp [ 0 ] = [ 0 , 0 ] ;

        // Initialize a stack for iterative Depth-First Search (DFS) traversal.
        // The traversal starts from node 0.
        var stack = [ 0 ] ;

        // Main DFS loop: continues as long as there are nodes in the stack to process.
        while ( stack . length != 0 ) {

            // 'term' indicates if a new, unvisited child was found and pushed.
            // If 'term' remains 0, it means all children have been visited/processed.
            var term = 0 ;

            // Initialize accumulators for DP states from children.
            // Start with 1 for multiplication.
            var white = 1 ;
            var black = 1 ;

            // Iterate through all neighbors of the current node (top of the stack).
            for ( var i = 0 ; i < edge [ stack [ stack . length - 1 ] ] . length ; i ++ ) {

                // Check if the neighbor node has not been visited yet.
                if ( flag [ edge [ stack [ stack . length - 1 ] ] [ i ] ] == 0 ) {
                    // Mark the neighbor as visited.
                    flag [ edge [ stack [ stack . length - 1 ] ] [ i ] ] = 1 ;
                    // Push the neighbor onto the stack to explore it.
                    stack . push ( edge [ stack [ stack . length - 1 ] ] [ i ] ) ;
                    // Set 'term' to indicate a new child was explored, preventing popping.
                    term = 1 ;
                } else {
                    // If the neighbor is already visited, it means its DP values are ready.
                    // This is part of the post-order processing in iterative DFS.

                    // Calculate 'sub1': sum of child's DP states, modulo 'mod'.
                    // Math.max(1, ...) handles cases where a DP state might be 0, ensuring
                    // products aren't incorrectly zeroed out.
                    var sub1 = Math . max ( 1 , ( dp [ edge [ stack [ stack . length - 1 ] ] [ i ] ] [ 0 ] + dp [ edge [ stack [ stack . length - 1 ] ] [ i ] ] [ 1 ] ) % mod ) ;

                    // Calculate 'sub2': first DP state of child, modulo 'mod'.
                    var sub2 = Math . max ( 1 , dp [ edge [ stack [ stack . length - 1 ] ] [ i ] ] [ 0 ] ) ;

                    // Accumulate 'white' and 'black' states by multiplying with child's states.
                    // Apply modulo after each multiplication to keep numbers manageable.
                    white = ( white * sub1 ) % mod ;
                    black = ( black * sub2 ) % mod ;
                }
            }

            // If 'term' is 0, it means all children of the current node have been processed.
            // It's time to finalize the current node's DP states.
            if ( term == 0 ) {
                // Assign the accumulated 'white' and 'black' values to the current node's DP.
                dp [ stack [ stack . length - 1 ] ] = [ white , black ] ;
                // Pop the current node from the stack as its processing is complete.
                stack . pop ( ) ;
            }
        }

        // After the DFS completes, the final answer is the sum of the root's DP states.
        // This sum is then taken modulo 'mod'.
        var ans = ( dp [ 0 ] [ 0 ] + dp [ 0 ] [ 1 ] ) % mod ;

    } else {
        // For the N=1 case, the answer is a fixed value, typically 2.
        var ans = 2 ;
    }

    // Output the computed answer to the standard output.
    console . log ( '%s' , ans ) ;

    // Return the calculated answer.
    return ans ;
}

/*
 * This debug function is intended for specific execution environments,
 * like online judges with HTML-based input/output fields.
 * It facilitates testing the `Main` function with predefined test cases.
 */
function debug ( n ) {

    // Retrieve the test input string from a designated HTML input element.
    var input = document . getElementById ( "input" + n ) . value ;

    // Execute the main logic with the retrieved input.
    var ans = Main ( input ) ;

    // Initialize the result status for the test case.
    var result = "WA" ; // Stands for "Wrong Answer"

    // Compare the computed answer with the expected output from an HTML element.
    // The expected output is assumed to be on the first line.
    if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] ) {
        result = "AC" ; // Stands for "Accepted"
    }

    // Update the HTML element to display the test case result.
    document . getElementById ( "result" + n ) . innerHTML = result ;
}

// This is the entry point for running the script in a Node.js-like environment.
// It reads input from standard input (/dev/stdin) and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
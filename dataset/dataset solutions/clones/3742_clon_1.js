// This is a Type I clone of the original JavaScript code.
// No functional changes are made whatsoever.
// Only whitespace and comments are altered to create a visually distinct version.


function  Main ( s ) { // Entry point function for processing input 's'

    // The input 's' is initially a single string.
    // We split it by newline characters to get an array of lines.
    s = s.split("\n");


    /*
     * Process the first line of input.
     * It contains two numbers separated by a space.
     * These numbers represent 'n' and 'm'.
     */
    var   n  =  s[0] . split(" ") . map( a => +a ) ;
    var   m  =  n[1] ; // 'm' is the second number from the first line.
    n  =  n[0] ;       // 'n' is the first number from the first line.


    // Initialize a 2D array 'b' of size n x n.
    // All elements are initially set to 1.
    // This 'b' array likely represents an adjacency matrix where 1 means connected, 0 means not connected.
    var   b  =  Array(n) . fill(0) . map( a => Array(n) . fill(1) ) ;


    // Loop 'm' times to read edges and update the adjacency matrix 'b'.
    // Each edge connects two nodes, making the connection bidirectional.
    for ( var  i  =  0 ;  i  <  m ;  i++ ) {

        // Read an edge from the input.
        // The edge connects two nodes, 'a[0]' and 'a[1]'.
        // Nodes are 0-indexed, so we subtract 1 from the input values.
        var   a  =  s[i+1] . split(" ") . map( a => a - 1 ) ;

        // Mark the connection between a[0] and a[1] as 0 (not connected/removed).
        // This is done for both directions (a[0], a[1]) and (a[1], a[0]).
        b[a[0]][a[1]]  =  b[a[1]][a[0]]  =  0 ;
    }


    // Initialize array 'c' to keep track of visited nodes during graph traversal.
    // All elements are initially 0 (unvisited).
    var   c  =  Array(n) . fill(0) ;

    // 'z' acts as an index for 'x' and 'y' arrays, likely counting connected components or similar structures.
    var   z  =  0 ;

    // 'x' and 'y' arrays are used to store some properties of the components.
    var   x  =  [] ,  y  =  [] ;


    // Main loop for graph traversal and component identification.
    // Iterates through all nodes from 0 to n-1.
    for ( i  =  0 ;  i  <  n ;  i++ ) {


        // If the current node 'i' has already been visited, skip it.
        if ( c[i] )
            continue ;


        // Initialize counts for the current component.
        x[z]  =  0 ;
        y[z]  =  0 ;

        // Mark the current node 'i' as visited.
        c[i]  =  1 ;

        // 'a' will store nodes connected to 'i' that are part of this component.
        var   a  =  [] ;

        // Inner loop to find neighbors of 'i' that are not yet processed.
        for ( var   j  =  i + 1 ;  j  <  n ;  j++ ) {

            // If there is an edge between 'i' and 'j' (b[i][j] is 1).
            if ( b[i][j] ) {
                x[z]  =  1 ;   // Mark 'x[z]' as 1, indicating some connection.
                a . push(j) ; // Add 'j' to the list of connected nodes.
            }

        }


        // If there are connected nodes in 'a'.
        if ( a.length ) {

            // Call function 'f' recursively to process the connected component.
            // If 'f' returns 1, it indicates an issue (e.g., impossible configuration).
            if ( f(a, 1) ) {

                console . log(-1) ; // Output -1 indicating failure.
                return ;            // Terminate the Main function.
            }

        }
        else {
            // If no connected nodes were found for 'i', set x[z] to 1.
            x[z]  =  1 ;
        }


        z++ ; // Increment 'z' to move to the next component.
    }


    // Initialize array 'd' of size 'n' with zeros.
    // This array likely helps in calculating the final result based on 'x' and 'y'.
    var   d  =  Array(n) . fill(0) ;

    // Mark specific indices in 'd' based on the first component's 'x' and 'y' values.
    d[x[0]]  =  d[y[0]]  =  1 ;


    // Nested loops to update 'd' based on subsequent components.
    // This part appears to be a dynamic programming or combinatorial calculation.
    for ( i  =  1 ;  i  <  x.length ;  i++ ) {
        for ( j  =  n - 1 ;  j  >=  0 ;  j-- ) {

            // If d[j] is set, update d for new indices (n + x[i]) and (n + y[i]).
            if ( d[j] ) {
                d[n + x[i]]  =  1 ;
                d[n + y[i]]  =  1 ;
            }

        }
    }


    // 'k' will store the maximum value found.
    var   k  =  0 ;

    // Loop through 'd' to find the maximum of a specific expression.
    for ( i  =  0 ;  i  <  n ;  i++ ) {

        if ( d[i] ) { // If d[i] is 1, consider it.
            // Update 'k' with the maximum of its current value and the result of Math.min(i, n - i).
            k  =  Math . max(k,  Math . min(i,  n - i)) ;
        }

    }


    // Calculate and print the final result.
    // This formula suggests a combination or partitioning problem solution.
    console . log( k * (k - 1) / 2 + (n - k) * (n - k - 1) / 2 ) ;


    /*
     * Helper recursive function 'f'.
     * 'p' is an array of nodes to process.
     * 'q' is a flag (0 or 1), likely indicating which counter (x[z] or y[z]) to increment.
     */
    function   f ( p , q ) {

        // Base case: if 'p' is empty, nothing to do.
        if ( !p.length )
            return ;


        var   a  =  [] ; // 'a' will collect new nodes for the next recursive call.

        // Iterate through nodes in 'p'.
        for ( var   i  =  0 ;  i  <  p.length ;  i++ ) {

            // If the current node p[i] has already been visited, skip it.
            if ( c[p[i]] )
                continue ;

            c[p[i]]  =  1 ; // Mark p[i] as visited.

            // Increment either y[z] or x[z] based on the 'q' flag.
            if ( q )
                y[z]++ ;
            else
                x[z]++ ;


            // Inner loop to check for connections within the 'p' array.
            // This checks for "internal" edges within the component being processed.
            for ( var   j  =  i + 1 ;  j  <  p.length ;  j++ ) {

                // If p[j] is already visited, skip.
                if ( c[p[j]] )
                    continue ;

                // If there's an edge between p[i] and p[j], it's an issue.
                if ( b[p[i]][p[j]] )
                    return  1 ; // Return 1 to signal an error/impossible state.
            }

            // Loop through all possible nodes 'j' to find neighbors of p[i].
            // These neighbors are added to 'a' for further recursive processing.
            for ( j  =  0 ;  j  <  n ;  j++ ) {
                if ( b[p[i]][j] )
                    a . push(j) ;
            }

        }

        // Recursive call to 'f' with the collected nodes 'a' and toggled 'q' flag.
        // If the recursive call returns 1, propagate the error.
        if ( f(a,  q ^ 1) )
            return  1 ;; // Double semicolon is preserved here as it's part of the original structure.

    }

}


// Execute the Main function with input read from standard input.
Main( require("fs") . readFileSync("/dev/stdin", "utf8") ) ;
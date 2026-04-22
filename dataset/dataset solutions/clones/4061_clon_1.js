// This program solves a system of difference constraints.
// It determines if a set of relationships of the form x[R] - x[L] = D can be satisfied.
// If all constraints are consistent, it outputs "Yes"; otherwise, "No".

function   Main ( input )
{
    // The raw input string is first split into individual lines.
    input = input . split ( "\n" ) ;

    // The first line of input typically contains global parameters.
    // Here, it contains the number of nodes (N) and the number of constraints (M).
    var M = input [ 0 ] . split ( " " ) . map ( a => parseInt ( a ) ) ;

    // Extract N (number of elements) from the parsed array.
    var N = M [ 0 ] ;

    // Reassign M (number of constraints) from the parsed array.
    M = M [ 1 ] ;

    // Initialize arrays to store the details of each constraint:
    // L: Left index of the constraint (0-indexed).
    // R: Right index of the constraint (0-indexed).
    // D: The required difference (x[R] - x[L]).
    var L = [] , R = [] , D = [] ;

    // 'x' array will store the calculated value for each node.
    // It's initialized to zeros, effectively setting an arbitrary base for the first connected component.
    var x = new Array ( N ) . fill ( 0 ) ;

    // 'x2' serves as an adjacency list for the graph, storing connections and their differences.
    // Each element x2[i] will be an array of [neighbor_index, difference_value].
    var x2 = new Array ( N ) ;

    // 'ans' stores the final result, defaulting to "Yes" until a contradiction is found.
    var ans = "Yes" ;

    // Initialize each entry in the 'x2' adjacency list to an empty array.
    for ( let i = 0 ; i < N ; i++ )
        x2 [ i ] = [] ;


    // Loop through each of the M constraints provided in the input.
    // Constraints start from the second line (input[1]) onwards.
    for ( let i = 0 ; i < M ; i++ )
    {
        // Parse the current constraint line, converting string parts to integers.
        // The format is typically "L_val R_val D_val".
        L [ i ] = input [ i + 1 ] . split ( " " ) . map ( a => parseInt ( a ) ) ;

        // Adjust the R index to be 0-based (input is usually 1-based).
        R [ i ] = L [ i ] [ 1 ] - 1 ;

        // Store the difference value for this constraint.
        D [ i ] = L [ i ] [ 2 ] ;

        // Adjust the L index to be 0-based.
        L [ i ] = L [ i ] [ 0 ] - 1 ;

        // Add the constraint to the adjacency list 'x2'.
        // If x[R] - x[L] = D, then x[R] = x[L] + D.
        // So, from L, we can reach R with a difference of D.
        x2 [ L [ i ] ] . push ( R [ i ] , D [ i ] ) ;

        // Conversely, x[L] = x[R] - D.
        // So, from R, we can reach L with a difference of -D.
        x2 [ R [ i ] ] . push ( L [ i ] , -D [ i ] ) ;
    }


    // Iterate through all possible nodes to initiate the value propagation.
    // This loop ensures that all connected components are processed,
    // starting from a node if its 'x' value hasn't been set yet (or is 0, implying it's a root).
    for ( let i = 0 ; i < N ; i++ )
    {
        // 'j' points to the last (most recently added) pair in the adjacency list for node 'i'.
        // Each pair consists of a neighbor index and a difference, so we access by 'j' and 'j+1'.
        let j = x2 [ i ] . length - 2 ;

        // If node 'i' has connections and potentially an unvisited component starting here.
        if ( j >= 0 )
        {
            // Call the recursive helper function to propagate 'x' values.
            // This effectively performs a Depth-First Search (DFS) like traversal.
            set_x ( x2 [ i ] , i , j ) ;
        }
    }


    // After all 'x' values are potentially set, verify every original constraint.
    // This final check confirms consistency across the entire graph.
    for ( let i = 0 ; i < M ; i++ )
    {
        // If the calculated difference x[R[i]] - x[L[i]] does not match the given D[i],
        // then a contradiction exists.
        if ( x [ R [ i ] ] - x [ L [ i ] ] !== D [ i ] )
        {
            ans = "No" ; // Set the answer to "No".
            break ;      // Exit the loop early as consistency is already broken.
        }
    }

    // Output the final determination.
    console . log ( ans ) ;


    // Recursive helper function to set 'x' values for connected nodes.
    // 'a': The adjacency list for the current node (e.g., x2[i]).
    // 'i': The index of the current node whose 'x' value is considered known.
    // 'j': An index within 'a', pointing to the neighbor's index (a[j]) and its difference (a[j+1]).
    function set_x ( a , i , j )
    {
        // 'k' is the index of the neighbor node.
        var k = a [ j ] ;

        // Calculate the 'x' value for the neighbor 'k'.
        // The value of x[k] is derived from x[i] plus the difference to k.
        x [ k ] = x [ i ] + a [ j + 1 ] ;

        // "Process" this connection by effectively removing it from the adjacency list 'a'.
        // This prevents re-processing and helps terminate recursion in cycles.
        a . length = j ;

        // Move to the previous pair in the current adjacency list 'a'.
        j -= 2 ;

        // If there are more unprocessed neighbors in 'a', recursively call set_x.
        if ( j >= 0 )
            set_x ( a , i , j ) ;

        // Now, having set x[k], explore its neighbors.
        // Get the starting index for 'k''s adjacency list (its most recent neighbor).
        j = x2 [ k ] . length - 2 ;

        // If 'k' has unprocessed neighbors, recursively call set_x to propagate values from 'k'.
        if ( j >= 0 )
            set_x ( x2 [ k ] , k , j ) ;
    }
}

// Read the entire standard input asynchronously as a UTF-8 string,
// then pass it to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
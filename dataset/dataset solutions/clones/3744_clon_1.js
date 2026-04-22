/*
 * This JavaScript file implements a graph-related algorithm.
 * It processes graph data from standard input, identifies a specific node
 * based on its degree, and then partitions the remaining nodes into two sets.
 * Finally, it performs clique checks on these partitions and outputs a calculated value
 * or -1 if conditions are not met.
 *
 * This code is a Type I clone, designed to be functionally identical
 * but visually distinct through extensive use of whitespace and comments.
 *
 * Original Author: Unknown
 * Clone Generator: Expert Code Cloner
 * Date of Generation: 2023-10-27
 */


// Define the primary function that orchestrates the graph processing logic.
// It accepts a single string argument, 's', which represents the raw input data.
function Main ( s )
{

    // Step 1: Parse the input string into an array of lines.
    // The input 's' is expected to contain multiple lines, separated by newline characters.
    s = s .split ( "\n" ) ;


    // Step 2: Extract graph dimensions (number of nodes 'n' and number of edges 'm').
    // The first line of the input 's[0]' contains two space-separated integers.
    // 'n' is the total number of nodes in the graph.
    // 'm' is the total number of edges.
    var n = s [ 0 ] .split ( " " ) .map ( a => +a ) ;

    // Assign the second parsed number to 'm'.
    var m = n [ 1 ] ;

    // Reassign 'n' to the first parsed number, which is the actual node count.
    n = n [ 0 ] ;


    // Step 3: Initialize an adjacency matrix 'b' for the graph.
    // 'b' will be an 'n x n' matrix, initially filled with zeros.
    // A value of 1 at b[i][j] will indicate an edge between node 'i' and node 'j'.
    var b = Array ( n ) .fill ( 0 ) .map ( a => Array ( n ) .fill ( 0 ) ) ;


    // Step 4: Populate the adjacency matrix with edges from the input.
    // Loop 'm' times, processing each edge definition from the input lines.
    for ( var i = 0 ; i < m ; i ++ )
    {
        // Each subsequent line (s[i+1]) defines an edge.
        // Parse the two node indices (u, v) for the current edge.
        // Convert them to 0-indexed values by subtracting 1.
        var a = s [ i + 1 ] .split ( " " ) .map ( a => a - 1 ) ;

        // Mark the presence of an edge between 'a[0]' and 'a[1]' in the adjacency matrix.
        // Since the graph is undirected, set both b[a[0]][a[1]] and b[a[1]][a[0]] to 1.
        b [ a [ 0 ] ] [ a [ 1 ] ] = b [ a [ 1 ] ] [ a [ 0 ] ] = 1 ;
    }


    // Step 5: Find the node with the minimum degree.
    // Initialize 'k' with a very large number to track the minimum degree found so far.
    var k = 9e9 ;

    // Declare 'x' to store the index of the node that has the minimum degree.
    var x ;

    // Iterate through all nodes from 0 to 'n-1'.
    for ( i = 0 ; i < n ; i ++ )
    {
        // Calculate the degree of the current node 'i'.
        // The degree is the sum of all elements in its corresponding row (or column) in the adjacency matrix.
        var t = b [ i ] .reduce ( ( a , b ) => a + b ) ;

        // If the current node's degree 't' is less than the current minimum degree 'k',
        // update 'k' to 't' and 'x' to the current node's index 'i'.
        if ( k > t )
        {
            k = t ; // Update the minimum degree.
            x = i ; // Store the index of the node with this minimum degree.
        }
    }


    // Step 6: Partition the remaining nodes into two sets, 'y' and 'z'.
    // 'y' will contain nodes connected to 'x'.
    // 'z' will contain nodes not connected to 'x' (excluding 'x' itself).
    var y = [ ] , z = [ ] ;

    // Iterate through all nodes from 0 to 'n-1'.
    for ( i = 0 ; i < n ; i ++ )
    {
        // Skip the node 'x' itself; it's the reference point for partitioning.
        if ( i === x )
        {
            continue ; // Move to the next iteration of the loop.
        }

        // Check if node 'i' is connected to node 'x'.
        if ( b [ x ] [ i ] )
        {
            y .push ( i ) ; // If connected, add node 'i' to partition 'y'.
        }
        else
        {
            z .push ( i ) ; // If not connected, add node 'i' to partition 'z'.
        }
    }


    // Step 7: Verify that all nodes within partition 'y' form a clique.
    // A clique means every pair of distinct nodes in the set must be connected by an edge.
    for ( i = 0 ; i < y .length ; i ++ )
    {
        // Inner loop to check all pairs (y[i], y[j]) where j > i.
        for ( var j = i + 1 ; j < y .length ; j ++ )
        {
            // If there is no edge between y[i] and y[j] (i.e., b[y[i]][y[j]] is 0),
            // then 'y' is not a clique. In this case, output -1 and terminate.
            if ( ! b [ y [ i ] ] [ y [ j ] ] )
            {
                console .log ( -1 ) ; // Output the error code.
                return ;              // Exit the function.
            }
        }
    }


    // Step 8: Verify that all nodes within partition 'z' also form a clique.
    // Similar to the check for 'y', every pair of distinct nodes in 'z' must be connected.
    for ( i = 0 ; i < z .length ; i ++ )
    {
        // Inner loop to check all pairs (z[i], z[j]) where j > i.
        for ( j = i + 1 ; j < z .length ; j ++ )
        {
            // If there is no edge between z[i] and z[j], then 'z' is not a clique.
            // Output -1 and terminate.
            if ( ! b [ z [ i ] ] [ z [ j ] ] )
            {
                console .log ( -1 ) ; // Output the error code.
                return ;              // Exit the function.
            }
        }
    }


    // Step 9: If all clique conditions are satisfied, calculate and output the final result.
    // The formula represents a specific calculation based on the graph's properties,
    // likely related to the number of nodes 'n' and the minimum degree 'k'.
    console .log ( k * ( k + 1 ) / 2 + ( n - k - 1 ) * ( n - k - 2 ) / 2 ) ;
}


// Entry point of the script.
// Reads the entire content of standard input (typically from a file) as a UTF-8 string,
// and then passes this string to the Main function for processing.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;
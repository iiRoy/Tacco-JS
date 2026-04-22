/*
 * This file contains a JavaScript program designed to process input data.
 * It includes functions for basic output and a main logic function.
 */

// Function to handle standard console output.
function myOut ( text ) {
    console . log ( text ) ; // Displays the provided text to the console.
}

/**
 * The primary function that processes the input string.
 * @param {string} input - The raw input string read from stdin.
 */
function Main ( input ) {

    // Remove leading and trailing whitespace from the input string.
    input = input . trim ( ) ;

    // These lines are commented out, showing alternative input parsing strategies.
    // input = input.split(" ");
    // input = input.split(" ").map((a)=>Number(a));
    // input = input.split("\n").map((a)=>Number(a));

    // Split the input string into an array of lines based on the newline character.
    input = input . split ( "\n" ) ;


    // Parse the first line of input to extract N and M.
    // N represents the number of nodes, M represents the number of edges.
    var N = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;
    var M = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;


    // Check if the number of edges (M) is odd.
    // If M is odd, a valid graph structure cannot be formed under certain conditions (e.g., Eulerian path/circuit).
    if ( M % 2 == 1 ) {
        console . log ( "-1" ) ; // Output -1 to indicate an invalid state or error.
        return ;                  // Exit the function early.
    }


    // Remove the first line of input, as N and M have already been processed.
    input . shift ( ) ;


    // Initialize an empty object to represent the adjacency list of the graph.
    var list = { } ;


    // Populate the adjacency list with empty arrays for each node from 1 to N.
    // This ensures every node has an entry even if it has no connections initially.
    for ( var i = 1 ; i <= N ; i ++ ) {
        list [ i ] = [ ] ;
    }


    // Process the remaining input lines to build the graph's adjacency list.
    // Each line represents an edge between two nodes.
    for ( var i = 0 ; i < M ; i ++ ) {
        // Split the current line to get the two connected nodes.
        var tmp1 = input [ i ] . split ( " " ) [ 0 ] ;
        var tmp2 = input [ i ] . split ( " " ) [ 1 ] ;

        // Add connections to the adjacency list for both directions (undirected graph).
        list [ tmp1 ] . push ( tmp2 ) ;
        list [ tmp2 ] . push ( tmp1 ) ;
    }


    // Iterate through each node to check the degree of each node.
    // For a valid Eulerian path/circuit, all node degrees must be even.
    for ( var i = 1 ; i <= N ; i ++ ) {
        // If any node has an odd degree, it's an invalid graph for the problem's constraints.
        if ( list [ i ] . length % 2 == 1 ) {
            console . log ( "-1" ) ; // Output -1 to indicate an error.
            return ;                  // Exit the function.
        }
    }


    // This loop appears to be a placeholder or intended for future logic.
    // It currently performs no operations.
    for ( var i = 1 ; i <= M ; i ++ ) {
        // No operations defined within this loop's body.
    }

} // End of the Main function.


// Invoke the Main function with input read from standard input.
// This is a common pattern for competitive programming in Node.js.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Reads entire file as UTF-8 string.
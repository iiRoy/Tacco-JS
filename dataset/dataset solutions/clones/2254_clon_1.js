/*
 * This is the main function that processes the input and calculates the result.
 * It reads grid dimensions, initializes a graph representation,
 * computes all-pairs shortest paths using Floyd-Warshall,
 * and finds the maximum shortest path distance.
 */
function Main( input ) {

    // Split the entire input string by newline characters to get an array of lines.
    input = input . split ( "\n" ) ;

    // Parse the height (H) and width (W) from the first line of input.
    // The first line contains "H W", so we split it by space and parse integers.
    var H = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ; // Height of the grid
    var W = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ; // Width of the grid

    // Define a large prime number for modulo operations or as an "infinity" value
    // for path lengths in the Floyd-Warshall algorithm.
    var mod = Math . pow ( 10 , 9 ) + 7 ; // A common modulo value or a large number for infinity.

    // Remove the first line (containing H and W) from the input array
    // as it has already been processed.
    input . shift ( ) ;

    // Remove any extra lines beyond the grid's height H.
    // This ensures 'input' only contains the grid rows.
    input . splice ( H , input . length ) ;

    // Map each row string into an array of characters,
    // effectively creating a 2D array (grid) of characters.
    var S = input . map ( i => i . split ( "" ) ) ; // S represents the grid itself.

    // Initialize an array to store edges of the graph.
    // Each edge will be a pair of node IDs representing a connection.
    var edge = new Array ( ) ;

    // Initialize a unique identifier for each cell in the grid.
    // This 'id' will be used as a node index in the graph.
    var id = 0 ;

    // Iterate through each cell of the grid to identify '.' (empty) cells
    // and establish connections (edges) between adjacent empty cells.
    for ( var i = 0 ; i < H ; i ++ ) { // Loop through rows

        for ( var j = 0 ; j < W ; j ++ ) { // Loop through columns

            // If the current cell (S[i][j]) is an empty cell ('.')
            if ( S [ i ] [ j ] == "." ) {

                // Check for a connection to the cell below (downward).
                // Ensure we are not on the last row.
                if ( i != H - 1 ) {

                    // If the cell below is also empty, add an edge.
                    if ( S [ i + 1 ] [ j ] == "." ) {
                        // Edge connects current cell (id) to cell below (id + W, for next row).
                        edge . push ( [ id , id + W ] ) ;
                    }
                }

                // Check for a connection to the cell to the right (rightward).
                // Ensure we are not on the last column.
                if ( j != W - 1 ) {

                    // If the cell to the right is also empty, add an edge.
                    if ( S [ i ] [ j + 1 ] == "." ) {
                        // Edge connects current cell (id) to cell to the right (id + 1).
                        edge . push ( [ id , id + 1 ] ) ;
                    }
                }
            }

            // Increment the cell identifier for the next cell.
            id ++ ;
        }
    }

    // Initialize the adjacency matrix (map) for the graph.
    // The size of the matrix is (H*W) x (H*W), representing all possible nodes.
    var map = new Array ( H * W ) ;

    // Populate the initial adjacency matrix.
    // All distances are initialized to 'mod' (infinity),
    // and distance from a node to itself is 0.
    for ( var i = 0 ; i < H * W ; i ++ ) { // For each node 'i'

        // Create a sub-array (row) for node 'i', filled with 'mod'.
        var mapsub = new Array ( H * W ) . fill ( mod ) ;

        // The distance from node 'i' to itself is 0.
        mapsub [ i ] = 0 ;

        // Assign the initialized row to the 'map' matrix.
        map [ i ] = mapsub ;
    }

    // Add direct edges to the adjacency matrix.
    // For each edge identified earlier, set the distance between connected nodes to 1.
    for ( var i = 0 ; i < edge . length ; i ++ ) { // Iterate through all identified edges

        // Get the two nodes connected by the current edge.
        var node1 = edge [ i ] [ 0 ] ;
        var node2 = edge [ i ] [ 1 ] ;

        // Since it's an undirected graph, set distance in both directions to 1.
        map [ node1 ] [ node2 ] = 1 ;
        map [ node2 ] [ node1 ] = 1 ;
    }

    // Initialize 'ans' (answer) to 0. This variable will store the maximum shortest path found.
    var ans = 0 ;

    // Apply the Floyd-Warshall algorithm to find all-pairs shortest paths.
    // This algorithm iterates through all possible intermediate nodes 'k'.
    for ( var k = 0 ; k < H * W ; k ++ ) { // 'k' is the intermediate node

        for ( var i = 0 ; i < H * W ; i ++ ) { // 'i' is the source node

            for ( var j = 0 ; j < H * W ; j ++ ) { // 'j' is the destination node

                // Update the shortest path from 'i' to 'j' if going through 'k' is shorter.
                map [ i ] [ j ] = Math . min ( map [ i ] [ k ] + map [ k ] [ j ] , map [ i ] [ j ] ) ;
            }
        }
    }

    // After computing all shortest paths, find the maximum shortest path distance.
    // This represents the longest "diameter" of the connected components of the grid.
    for ( var i = 0 ; i < H * W ; i ++ ) { // Iterate through all possible source nodes

        for ( var j = 0 ; j < H * W ; j ++ ) { // Iterate through all possible destination nodes

            // If a path exists (distance is not 'mod' / infinity)
            if ( map [ i ] [ j ] < mod ) {

                // Update 'ans' with the maximum distance found so far.
                ans = Math . max ( ans , map [ i ] [ j ] ) ;
            }
        }
    }

    // Output the final answer to the console.
    console . log ( '%s' , ans ) ;

    // Return the calculated answer.
    return ans ;
}


/*
 * This debug function is typically used in a browser environment
 * to test the Main function with predefined inputs.
 * It retrieves input from an HTML element, calls Main,
 * and displays the result (AC for Accepted, WA for Wrong Answer).
 */
function debug ( n ) {

    // Retrieve the input string from a specific HTML element.
    var input = document . getElementById ( "input" + n ) . value ;

    // Call the Main function with the retrieved input.
    var ans = Main ( input ) ;

    // Initialize the result string to "WA" (Wrong Answer).
    var result = "WA" ;

    // Compare the calculated answer with the expected output from another HTML element.
    if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] ) {
        // If they match, set the result to "AC" (Accepted).
        result = "AC" ;
    }

    // Display the result (AC or WA) in a designated HTML element.
    document . getElementById ( "result" + n ) . innerHTML = result ;
}


// This line is typically used in a Node.js environment
// to read input from standard input (stdin) and pass it to the Main function.
// It ensures the program can be run as a command-line utility.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
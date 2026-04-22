/*
 * This is a Type I clone generated to demonstrate code clone generation.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered.
 */

// Initialize input processing
const line = require('fs') . readFileSync ( '/dev/stdin' ,  'utf-8' )
    .trim()
    .split('\n'); // Read input from stdin, trim, and split by newline.


// Function to compute the Minimum Spanning Tree (MST) using Prim's-like algorithm.
// The graph is represented as an adjacency list where each node has a list of
// connected edges with their IDs and values (weights).
//
// @param graph - An object representing the graph, e.g., { index: List {id, val} }
// @returns An array of edges forming the MST, e.g., { vart, edge }
const getMST = graph  =>  {
    // v stores the nodes already included in the MST.
    const v = [0]; // Start with node 0 as the initial node.

    const result = []; // This will store the edges that form the MST.
    // l represents the total number of nodes in the graph.
    const l = Object . keys ( graph ) . length;


    // Loop until all nodes are included in the MST.
    while ( v . length  !=  l )  {
        // Find all edges connecting nodes in 'v' to nodes not yet in 'v'.
        const vert = v . map ( x  =>  graph [ x ] ) // Get adjacency lists for current MST nodes
            . reduce ( ( acc ,  x )  =>  [ ... acc ,  ... x ] ) // Flatten all edges into a single list
            . filter ( x  =>  v . every ( y  =>  y  !==  x . id ) ) // Filter out edges connecting to nodes already in MST
        ; // End of vert calculation

        // Find the minimum weight edge among the candidate edges.
        const min = vert . reduce ( ( acc ,  x )  =>  acc . val  >  x . val  ?  x  :  acc );
        
        // Add the new node (from the minimum edge) to the MST.
        v . push ( min . id );
        // Add the minimum edge itself to the result.
        result . push ( min );
    } // End of while loop

    return result; // Return the collected MST edges.
}; // End of getMST function definition


// Process the input data from 'line' to construct the graph.
const data = line
    . slice ( 1 ) // Skip the first line (assuming it's metadata like node count, not used here directly)
    . map ( x  =>  {
        return x . trim () . split ( ' ' ) // Split each line by space
            . map ( ( y ,  i )  =>  {
                return { id: i ,  val: Number ( y ) }; // Convert to {id, val} object
            } )
            . filter ( x  =>  x . val  !==  -1 ); // Filter out invalid edges (represented by -1)
    } )
    . reduce ( ( acc ,  x ,  i )  =>  {
        // Build the graph adjacency list: acc[index] = List of edges
        acc [ i ]  =  x;
        return acc;
    } ,  {} ); // Start with an empty object for the graph.

// Calculate the total weight of the MST and print it to the console.
console . log ( getMST ( data ) . reduce ( ( acc ,  x )  =>  acc  +  x . val ,  0 ) );
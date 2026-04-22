/*
 * This JavaScript program processes graph adjacency list data
 * from standard input and converts it into an adjacency matrix.
 * It's structured as an Immediately Invoked Function Expression (IIFE).
 *
 * The input format is assumed to be:
 * N
 * node_id degree adj_node1 adj_node2 ...
 * ...
 * where N is the number of nodes, and subsequent lines describe each node's
 * connections. The node_id and degree are ignored in this specific implementation,
 * only the adjacent nodes are used to build the matrix.
 */

( function   main()   {
    // The main execution logic of the program is encapsulated within this function.

    // Step 1: Read all input from the standard input ('/dev/stdin').
    // The input is read as a UTF-8 string, leading/trailing whitespace is removed,
    // and then it's split into an array of lines based on the newline character.
    const   lines   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim () . split ( '\n' ) ;


    // Step 2: Extract the total number of nodes (N) from the very first line of input.
    // The 'shift()' method removes this line from the 'lines' array after reading it,
    // so subsequent processing can focus on the adjacency list data.
    const   n   =   Number ( lines . shift () ) ;


    // Step 3: Initialize an N x N adjacency matrix.
    // This matrix, 'res', will be used to store the graph structure.
    // It is pre-filled with zeros, indicating no connections initially.
    const   res   =   Array . from ( Array ( n ) ,   ( )   =>   Array . from ( Array ( n ) ,   ( )   =>   0 ) ) ;


    // Step 4: Iterate through the remaining lines (which represent adjacency lists).
    // For each line 'l' at index 'i':
    //   a. Split the line by spaces.
    //   b. Use 'splice(2)' to get only the adjacent node IDs (ignoring the first two elements: node ID and degree).
    //   c. For each adjacent node 'e', set the corresponding cell in the 'res' matrix to 1.
    //      Note: 'e - 1' is used because node IDs are 1-based in input, but array indices are 0-based.
    lines . forEach ( ( l ,   i )   =>   l . split ( ' ' ) . splice ( 2 ) . forEach ( e   =>   res [ i ] [ e - 1 ]   =   1 ) ) ;


    // Step 5: Format and print the resulting adjacency matrix.
    // Each row 'r' of the matrix is joined by spaces.
    // All formatted rows are then joined by newline characters, creating the final output string.
    console . log ( res . map ( r   =>   r . join ( ' ' ) ) . join ( '\n' ) ) ;

} ) ( ) ; // The IIFE is immediately invoked upon script execution.
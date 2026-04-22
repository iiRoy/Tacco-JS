/*
 * This script processes input data to simulate a binary heap visualization.
 * It reads the number of elements and their values, then iterates through
 * each element, displaying its key, parent's key, left child's key,
 * and right child's key if they exist within the heap structure.
 *
 * This is a demonstration of Type I code cloning,
 * where only whitespace and comments are altered.
 */

function       Main ( input   ) {

    // First, split the entire input string into an array of lines.
    // The first line contains 'n', the second contains space-separated keys.
    input       = input . split ( "\n" ) ;


    // Parse the first element of the input array (which is the first line)
    // to get the total number of nodes, 'n'.
    var   n   =   parseInt ( input [ 0 ] , 10 ) ;


    // Now, take the second line of input and split it by spaces
    // to get an array of string representations of the keys.
    input [ 1 ]       = input [ 1 ] . split ( " " ) ;


    // Initialize an array 'h' to store the heap elements.
    // We allocate 'n + 1' size because heaps are typically 1-indexed.
    var   h   =   new   Array ( n   +   1 ) ;


    // Loop through the input keys to populate our 1-indexed heap array 'h'.
    // The input keys are 0-indexed, so we map input[1][i] to h[i + 1].
    for ( var   i   =   0 ;   i   <   n ;   i ++ ) {
        h [ i   +   1 ]       =   parseInt ( input [ 1 ] [ i ] , 10 ) ; // Convert string key to integer.
    }


    // --- Main processing loop: Iterate through each node in the heap ---
    for ( var   i   =   1 ;   i   <=   n ;   i ++ ) {

        // Start building the output string for the current node.
        var   ans   =   "node "   +   i   +   ": key = "   +   h [ i ]   +   ", " ;


        // Check if the current node has a parent.
        // The root node (index 1) does not have a parent.
        if ( i   >   1 ) {
            // Calculate parent's index (i / 2) and append its key.
            ans   +=   "parent key = "   +   h [ Math . floor ( i   /   2 ) ]   +   ", " ;
        }


        // Check if the current node has a left child.
        // A left child exists if its index (i * 2) is within the heap bounds.
        if ( i   *   2   <=   n ) {
            // Append left child's key.
            ans   +=   "left key = "   +   h [ i   *   2 ]   +   ", " ;
        }


        // Check if the current node has a right child.
        // A right child exists if its index (i * 2 + 1) is within the heap bounds.
        if ( i   *   2   +   1   <=   n ) {
            // Append right child's key.
            ans   +=   "right key = "   +   h [ i   *   2   +   1 ]   +   ", " ;
        }

        // Print the complete information for the current node.
        console . log ( ans ) ;
    }
}


// --- Program entry point ---
// This line reads the entire content of standard input synchronously
// using Node.js's file system module and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
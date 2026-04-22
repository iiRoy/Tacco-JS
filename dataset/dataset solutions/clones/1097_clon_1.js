/*
 * This JavaScript file implements a basic binary search tree (BST)
 * data structure, processing commands from standard input.
 *
 * It supports two primary operations:
 * 1. 'i <key>': Insert a new node with the specified key into the BST.
 * 2. 'p': Print the current state of the BST using both in-order
 *    and pre-order traversals to the console.
 *
 * The program reads the number of operations from the first line of input,
 * followed by the operations themselves.
 */


//  Initialize standard input processing.
process . stdin . resume ( ) ; // Ensures the standard input stream stays open.

process . stdin . setEncoding ( "utf8" ) ; // Sets the character encoding for input data to UTF-8.


let input = "" ; // A string variable to accumulate all received input data.


//  Attach an event listener for 'data' events on the standard input stream.
process . stdin . on ( "data" , function ( chunk ) {
    input += chunk ; // Appends each received data chunk to the 'input' buffer.
} ) ;


//  Attach an event listener for the 'end' event on the standard input stream.
process . stdin . on ( "end" , function ( ) {
    /*
     * When the input stream ends, this callback is executed.
     * It splits the accumulated input string by newline characters
     * and passes the resulting array of lines to the main processing function.
     */
    main ( input . split ( "\n" ) ) ;
} ) ;


/*
 * Function: allocNode
 * Description: Creates and returns a new node object for the binary search tree.
 * Parameters:
 *   key - The value to be stored as the node's key.
 * Returns:
 *   An object representing the new tree node, initialized with the given key
 *   and null references for its left and right children.
 */
function allocNode ( key ) {
    p = { } ;         //  Initialize an empty object for the new node.
    p . key   = key ; //  Assign the provided key value to the node.
    p . left  = null ; // Initialize the left child pointer to null.
    p . right = null ; // Initialize the right child pointer to null.
    return p ;        //  Return the newly created node.
}


/*
 * Function: insert
 * Description: Inserts a new node (c) into the binary search tree rooted at node (p).
 * Parameters:
 *   p - The current node in the tree (or null if inserting into an empty subtree).
 *   c - The new node to be inserted.
 * Returns:
 *   The root of the (potentially updated) subtree after insertion.
 */
function insert ( p , c ) {
    //  Base case: If the current node is null, the new node 'c' becomes the root of this subtree.
    if ( p === null )
        return c ;

    /*
     * Determine whether to insert into the left or right subtree
     * based on a comparison of the new node's key with the current node's key.
     */
    if ( c . key < p . key )
        p . left = insert ( p . left , c ) ; // Recursively insert into the left subtree.
    else
        p . right = insert ( p . right , c ) ; // Recursively insert into the right subtree.

    return p ; // Return the current node, which is now part of the updated subtree.
}


/*
 * Function: inset
 * Description: Performs an in-order traversal of the binary search tree
 *              and collects the keys of the visited nodes into an array.
 * Parameters:
 *   p   - The current node being visited.
 *   ary - The array into which node keys are collected.
 * Returns:
 *   void (modifies 'ary' by reference).
 */
function inset ( p , ary ) {
    //  Base case for recursion: If the current node is null, there's nothing to traverse.
    if ( p === null )
        return ;

    inset ( p . left , ary ) ; // Recursively traverse the left subtree.
    ary . push ( p . key ) ; // Add the current node's key to the array (in-order position).
    inset ( p . right , ary ) ; // Recursively traverse the right subtree.
}


/*
 * Function: preset
 * Description: Performs a pre-order traversal of the binary search tree
 *              and collects the keys of the visited nodes into an array.
 * Parameters:
 *   p   - The current node being visited.
 *   ary - The array into which node keys are collected.
 * Returns:
 *   void (modifies 'ary' by reference).
 */
function preset ( p , ary ) {
    //  Base case for recursion: If the current node is null, stop.
    if ( p === null )
        return ;

    ary . push ( p . key ) ; // Add the current node's key to the array (pre-order position).
    preset ( p . left , ary ) ; // Recursively traverse the left subtree.
    preset ( p . right , ary ) ; // Recursively traverse the right subtree.
}


/*
 * Function: dump
 * Description: Prints the keys of the binary search tree to the console,
 *              using a specified traversal function.
 * Parameters:
 *   p       - The root node of the tree to be dumped.
 *   setfunc - The traversal function (e.g., inset for in-order, preset for pre-order)
 *             that will populate an array with node keys.
 * Returns:
 *   void (prints directly to console).
 */
function dump ( p , setfunc ) {
    let ary = [ ] ; // Create an empty array to hold the keys during traversal.
    setfunc ( p , ary ) ; // Call the provided traversal function to populate 'ary'.
    console . log ( ary . join ( " " ) ) ; // Output the collected keys, separated by spaces.
}


/*
 * Function: main
 * Description: The primary entry point for processing input commands.
 *              It initializes the BST and executes operations (insert, print)
 *              based on the provided lines of input.
 * Parameters:
 *   lines - An array of strings, where each string represents a command.
 * Returns:
 *   void.
 */
function main ( lines ) {
    let n = Number ( lines [ 0 ] ) ; // Parse the first line to get the number of operations.
    let root = null ; // Initialize the root of the binary search tree to null (empty tree).

    // Loop through each operation specified in the input lines.
    for ( let i = 0 ; i < n ; i ++ ) {
        // Split the current command line by spaces to separate the command type and its arguments.
        let line = lines [ i + 1 ] . split ( " " ) ;

        // Use a switch statement to handle different command types.
        switch ( line [ 0 ] [ 0 ] ) {
            case "i" : // Command 'i' indicates an insertion operation.
                let key = Number ( line [ 1 ] ) ; // Extract and convert the key value to a number.
                let p = allocNode ( key ) ; // Create a new node with the extracted key.
                root = insert ( root , p ) ; // Insert the new node into the binary search tree.
                break ; // Exit the switch statement after processing 'i'.

            case "p" : // Command 'p' indicates a print operation.
                dump ( root , inset ) ; // Perform and print an in-order traversal of the tree.
                dump ( root , preset ) ; // Perform and print a pre-order traversal of the tree.
                break ; // Exit the switch statement after processing 'p'.
        }
    }
}
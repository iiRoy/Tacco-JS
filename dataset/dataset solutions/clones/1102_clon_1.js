process . stdin . resume ( ) ;
process . stdin . setEncoding ( "utf8" ) ;
let input = ""; // This variable will store all the input data.

// Attach a 'data' event listener to standard input.
// Each time data is received, it's appended to the 'input' string.
process . stdin . on ( "data" , function ( chunk )
{
    input += chunk ;
}
) ;

// Attach an 'end' event listener to standard input.
// When the input stream ends, the accumulated 'input' string is split into lines,
// and these lines are passed to the 'main' function for processing.
process . stdin . on ( "end" , function ( )
{
    main ( input . split ( "\n" ) ) ;
}
) ;


/*
 * Function: allocNode
 * -------------------
 * Creates and initializes a new node object intended for use in a binary search tree.
 * Each node contains a key, and pointers for its left and right children, initially null.
 *
 * @param {any} key - The value to be stored as the node's key.
 * @returns {object} A new node object with the specified key and null children.
 */
function allocNode ( key )
{
    let p = { } ; // Declare a new plain JavaScript object.
    p . key = key ; // Assign the provided 'key' to the 'key' property of the object.
    p . left = null ; // Initialize the 'left' child pointer to null.
    p . right = null ; // Initialize the 'right' child pointer to null.
    return p ; // Return the newly constructed node.
}


/**
 * Function: insert
 * ----------------
 * Inserts a new node 'c' into the binary search tree rooted at 'p'.
 * This function is recursive and maintains the binary search tree property.
 *
 * @param {object|null} p - The current root of the subtree being considered for insertion.
 * @param {object} c - The node to be inserted.
 * @returns {object} The root of the modified subtree after insertion.
 */
function insert ( p , c )
{
    // Base case: If 'p' is null, we've found the correct position to insert 'c'.
    if ( p === null )
    {
        return c ;
    }

    // If the key of the node to be inserted is less than the current node's key,
    // recursively insert into the left subtree.
    if ( c . key < p . key )
    {
        p . left = insert ( p . left , c ) ;
    }
    // Otherwise (if c.key >= p.key), recursively insert into the right subtree.
    else
    {
        p . right = insert ( p . right , c ) ;
    }

    return p ; // Return the current node, which might have had its children updated.
}


/*
 * Function: find
 * --------------
 * Searches for a node with a specific 'key' within the binary search tree rooted at 'p'.
 *
 * @param {object|null} p - The current node (or root of the subtree) to start the search from.
 * @param {any} key - The key value to search for.
 * @returns {object|null} The node object if a match is found, otherwise null.
 */
function find ( p , key )
{
    // Continue searching as long as 'p' is not null AND its key does not match the target 'key'.
    if ( p !== null && p . key !== key )
    {
        // If the target 'key' is less than the current node's key, search in the left subtree.
        if ( key < p . key )
        {
            p = find ( p . left , key ) ;
        }
        // Otherwise, search in the right subtree.
        else
        {
            p = find ( p . right , key ) ;
        }
    }
    return p ; // Return 'p' (which will be the found node or null if not found).
}


/*
 * Function: inset
 * ---------------
 * Performs an in-order traversal of the binary search tree rooted at 'p'
 * and collects the keys of the visited nodes into the provided array 'ary'.
 * In-order traversal visits nodes in ascending order of their keys.
 *
 * @param {object|null} p - The current node (or root of the subtree) to traverse.
 * @param {Array} ary - The array to which the collected keys will be pushed.
 * @returns {void}
 */
function inset ( p , ary )
{
    // Base case: If the current node is null, there's nothing to do.
    if ( p === null )
    {
        return ;
    }
    inset ( p . left , ary ) ; // Recursively traverse the left subtree.
    ary . push ( p . key ) ; // Visit the current node: add its key to the array.
    inset ( p . right , ary ) ; // Recursively traverse the right subtree.
}


/*
 * Function: preset
 * ----------------
 * Performs a pre-order traversal of the binary search tree rooted at 'p'
 * and collects the keys of the visited nodes into the provided array 'ary'.
 * Pre-order traversal visits the current node before its children.
 *
 * @param {object|null} p - The current node (or root of the subtree) to traverse.
 * @param {Array} ary - The array to which the collected keys will be pushed.
 * @returns {void}
 */
function preset ( p , ary )
{
    // Base case: If the current node is null, there's nothing to do.
    if ( p === null )
    {
        return ;
    }
    ary . push ( p . key ) ; // Visit the current node: add its key to the array.
    preset ( p . left , ary ) ; // Recursively traverse the left subtree.
    preset ( p . right , ary ) ; // Recursively traverse the right subtree.
}


/*
 * Function: dump
 * --------------
 * Traverses the binary search tree rooted at 'p' using a specified traversal function
 * ('setfunc') and then prints the collected keys to the console.
 *
 * @param {object|null} p - The root of the binary search tree.
 * @param {function} setfunc - A function that performs a tree traversal and populates an array (e.g., inset, preset).
 * @returns {void}
 */
function dump ( p , setfunc )
{
    let ary = [ ] ; // Initialize an empty array to store the keys during traversal.
    setfunc ( p , ary ) ; // Call the provided traversal function to populate 'ary'.

    // Format the collected keys: each key is prefixed with a space, then all are joined into a single string.
    console . log ( ary . map ( x => ` ${ x }` ) . join ( "" ) ) ;
}


/*
 * Function: main
 * --------------
 * The primary entry point for the program. It processes a series of commands
 * provided as an array of strings, manipulating a binary search tree accordingly.
 * Commands include inserting nodes, finding nodes, and dumping tree contents.
 *
 * @param {Array<string>} lines - An array where each string represents a command line.
 * @returns {void}
 */
function main ( lines )
{
    const n = Number ( lines [ 0 ] ) ; // The first line contains the total number of operations.
    let root = null ; // Initialize the root of the binary search tree to null (empty tree).
    let p , key , line ; // Declare variables to be used within the loop.

    // Loop through each command line, starting from the second line (index 1).
    for ( let i = 0 ; i < n ; i ++ )
    {
        line = lines [ i + 1 ] . split ( " " ) ; // Split the current command line by spaces.

        // Determine the type of operation based on the first character of the first word.
        switch ( line [ 0 ] [ 0 ] )
        {
            case "i" : // 'i' indicates an insert operation.
                key = Number ( line [ 1 ] ) ; // The key to insert is the second part of the line.
                p = allocNode ( key ) ; // Create a new node with the specified key.
                root = insert ( root , p ) ; // Insert the new node into the tree.
                break ; // Exit the switch statement.

            case "p" : // 'p' indicates a print/dump operation.
                dump ( root , inset ) ; // Perform in-order traversal and print.
                dump ( root , preset ) ; // Perform pre-order traversal and print.
                break ; // Exit the switch statement.

            case "f" : // 'f' indicates a find operation.
                key = Number ( line [ 1 ] ) ; // The key to find is the second part of the line.
                // Check if the key exists in the tree and print "yes" or "no".
                if ( find ( root , key ) !== null )
                {
                    console . log ( "yes" ) ;
                }
                else
                {
                    console . log ( "no" ) ;
                }
                break ; // Exit the switch statement.

            // No default case is needed as per typical problem constraints.
        } // End of switch.
    } // End of for loop.
} // End of main function.
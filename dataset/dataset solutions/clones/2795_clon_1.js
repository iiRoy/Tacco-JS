/*
 * This JavaScript code implements a graph-related algorithm,
 * likely for a competitive programming context.
 * It includes boilerplate for input/output handling and utility functions,
 * followed by the main logic.
 */

// --- Input/Output and Utility Boilerplate Start ---------------------------------------

var read = require ( 'readline' ) . createInterface ( {
    input   : process . stdin , // Standard input stream.
    output  : process . stdout // Standard output stream.
} ) ;

var obj ;           // Will hold the initialized input object.
var inLine = [ ] ;  // Stores all lines read from input.

// Event listener for each line of input.
read . on ( 'line' , function ( input ) {
    inLine . push ( input ) ;
} ) ;

// Event listener for when input stream closes.
read . on ( 'close' , function ( ) {
    obj = init ( inLine ) ; // Initialize the input object with all lines.
    console . error ( "\n" ) ; // Print a newline to stderr for cleaner debug output.

    var start = Date . now ( ) ; // Record start time for performance measurement.
    Main ( ) ;                   // Execute the main program logic.
    var end = Date . now ( ) - start ; // Calculate elapsed time.

    myerr ( "time : " + end + "ms" ) ; // Output execution time to stderr.
    myerr ( "memory : " + Math . round ( process . memoryUsage ( ) . heapTotal / 1024 ) + "KB" ) ; // Output memory usage.
} ) ;

/**
 * Creates a deep clone of an object using JSON serialization.
 * Note: This method has limitations (e.g., cannot clone functions, Date objects lose type).
 * @param {object} obj - The object to clone.
 * @returns {object} A deep clone of the input object.
 */
function makeClone ( obj ) {
    return JSON . parse ( JSON . stringify ( obj ) ) ;
}

// Helper functions for reading specific types of input.
function nextInt ( ) { return myconv ( next ( ) , 1 ) ; }
function nextStrArray ( ) { return myconv ( next ( ) , 2 ) ; }
function nextIntArray ( ) { return myconv ( next ( ) , 4 ) ; }
function nextCharArray ( ) { return myconv ( next ( ) , 6 ) ; }

// Retrieves the next raw input line.
function next ( ) { return obj . next ( ) ; }
// Checks if there are more input lines available.
function hasNext ( ) { return obj . hasNext ( ) ; }

/**
 * Initializes an object to manage input lines.
 * Provides methods to check for next input and retrieve it.
 * @param {Array<string>} input - An array of input strings.
 * @returns {object} An object with input management methods.
 */
function init ( input ) {
    var returnObj = {
        list  : input ,             // The array of all input lines.
        index : 0 ,                 // Current position in the input array.
        max   : input . length ,    // Total number of input lines.
        hasNext : function ( ) {
            return ( this . index < this . max ) ; // Check if current index is within bounds.
        } ,
        next : function ( ) {
            if ( ! this . hasNext ( ) ) {
                throw "ArrayIndexOutOfBoundsException ‚There is no more input" ; // Error if no more input.
            } else {
                var returnInput = this . list [ this . index ++ ] ; // Get current line and advance index.
                return returnInput ;
            }
        }
    } ;
    return returnObj ;
}

/**
 * Prints a string to standard output.
 * @param {*} s - The value to print.
 */
function myout ( s ) {
    console . log ( s ) ;
}

/**
 * Prints debug information to standard error.
 * Uses Node.js 'util.inspect' for detailed object representation.
 * @param {*} s - The value to inspect and print.
 */
function myerr ( s ) {
    console . error ( "debug:" + require ( "util" ) . inspect ( s , false , null ) ) ;
}

/**
 * Converts input based on a specified type code.
 * This is a versatile conversion utility.
 *
 * @param {*} i - The input to convert.
 * @param {number} no - The conversion type code:
 *   - 1: Parse integer.
 *   - 2: Split string by space into an array of strings.
 *   - 4: Split string by space and map to numbers.
 *   - 6: Split string into an array of single characters.
 *   - 7: Split string into characters and map to numbers.
 *   - 8: Join array elements with spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements with no separator.
 *   - Default/Other: Return input 'i' as is.
 * @returns {*} The converted value.
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1 : return parseInt ( i ) ;
            case 2 : return i . split ( " " ) ;
            case 4 : return i . split ( " " ) . map ( Number ) ;
            case 6 : return i . split ( "" ) ;
            case 7 : return i . split ( "" ) . map ( Number ) ;
            case 8 : return i . join ( " " ) ;
            case 9 : return i . join ( "\n" ) ;
            case 0 : return i . join ( "" ) ;
            default : return i ;
        }
    } catch ( e ) {
        /*
         * If any conversion error occurs (e.g., trying to split a non-string),
         * simply return the original input 'i'. This provides robustness.
         */
        return i ;
    }
}

// --- Input/Output and Utility Boilerplate End -----------------------------------------

/**
 * The main function containing the core logic of the program.
 * It processes graph data and finds a specific path.
 */
function Main ( ) {
    var one = nextIntArray ( ) ; // Read the first line, containing N and M.
    var N   = one [ 0 ] ;        // N: Number of nodes in the graph.
    var M   = one [ 1 ] ;        // M: Number of edges in the graph.

    // Initialize two graph structures.
    // 'list' will store the original graph's adjacency list.
    var list    = new Array ( N ) ;
    // 'newList' will store a derived graph structure for BFS.
    var newList = new Array ( N ) ;

    // 'used' set to keep track of visited states in DFS to prevent redundant computations.
    var used = new Set ( ) ;

    // Initialize nodes in both graph representations.
    for ( var i = 0 ; i < N ; i ++ ) {
        list [ i ] = {
            child : [ ] , // Adjacency list for outgoing edges.
        } ;
        newList [ i ] = {
            parent : new Set ( ) , // Stores nodes that can reach 'i' via a specific path condition.
            access : false ,       // Flag for BFS traversal.
            depth  : 0             // Distance from the BFS start node.
        } ;
    }

    // Populate the 'list' (original graph) with M edges.
    for ( var i = 0 ; i < M ; i ++ ) {
        var tmp = nextIntArray ( ) ; // Read an edge (u, v).
        // Adjust to 0-based indexing and add 'v' to 'u's children.
        list [ tmp [ 0 ] - 1 ] . child . push ( tmp [ 1 ] - 1 ) ;
    }

    // Perform a Depth-First Search (DFS) from each node.
    // This DFS populates the 'parent' sets in 'newList' based on paths of length 3.
    for ( var i = 0 ; i < N ; i ++ ) {
        dfs ( i , i , 0 ) ; // (root, current_node, current_depth)
    }

    // The original 'list' (adjacency list) is no longer needed after DFS.
    // Setting it to null allows garbage collection to free memory.
    list = null ;

    var tmp = nextIntArray ( ) ; // Read the start and target nodes for the final pathfinding.
    var s   = tmp [ 0 ] - 1 ;    // 's': The starting node (0-indexed).
    var t   = tmp [ 1 ] - 1 ;    // 't': The target node (0-indexed).

    var maeIndex = 0 ; // Front pointer for the BFS queue.
    var atoIndex = 1 ; // Back pointer for the BFS queue.
    // Allocate a large array for the queue to prevent reallocations during BFS.
    var queue    = new Array ( 100007 ) ;

    queue [ 0 ] = t ; // Start the BFS from the target node 't'.
    newList [ t ] . access = true ; // Mark 't' as visited to begin the BFS.

    var output = -1 ; // Initialize the result; -1 indicates no path found.

    // Breadth-First Search (BFS) to find the shortest path from 't' to 's'
    // using the 'parent' relationships established by the DFS.
    while ( maeIndex != atoIndex ) {
        var now = queue [ maeIndex ] ; // Dequeue the current node.
        maeIndex ++ ;                  // Advance the front pointer.

        if ( now == s ) {
            output = newList [ now ] . depth ; // If 's' is reached, record its depth (distance).
            break ; // Path found, exit the BFS loop.
        }

        // Convert the Set of parents into an array for iteration.
        var child = Array . from ( newList [ now ] . parent ) ;

        // Iterate through all parents of the current node.
        for ( var i = 0 ; i < child . length ; i ++ ) {
            // If this parent has not been visited yet.
            if ( ! newList [ child [ i ] ] . access ) {
                newList [ child [ i ] ] . access = true ; // Mark the parent as visited.
                // Update the parent's depth, which is one more than the current node's depth.
                newList [ child [ i ] ] . depth = newList [ now ] . depth + 1 ;
                queue [ atoIndex ] = child [ i ] ; // Enqueue the parent for further exploration.
                atoIndex ++ ;                      // Advance the back pointer.
            }
        }
    }

    // Debugging lines (commented out in the original, kept as such or with altered comments).
    // myerr(list); // Original debug line for the 'list' structure.
    // myerr(newList); // Original debug line for the 'newList' structure.
    /*
     * The above commented-out lines were likely used during development
     * to inspect the state of the graph structures.
     */

    myout ( output ) ; // Output the final result (shortest path length or -1).


    /**
     * Recursive Depth-First Search (DFS) function.
     * This DFS explores paths of up to 3 edges from a 'root' node.
     * If a path of exactly 3 edges is found from 'root' to 'now',
     * it establishes a 'parent' link in 'newList' from 'now' to 'root'.
     *
     * @param {number} root - The starting node of the current DFS traversal.
     * @param {number} now - The current node being visited.
     * @param {number} depth - The current depth of the traversal from 'root'.
     */
    function dfs ( root , now , depth ) {
        // Create a unique key for the current (node, depth) state.
        var stateKey = now + ":" + depth ;

        // If this state has already been visited in the current DFS call,
        // or a path of depth 3 from 'root' to 'now' has already been recorded,
        // then return to avoid redundant work and infinite loops.
        if ( used . has ( stateKey ) ) {
            return ;
        }
        used . add ( stateKey ) ; // Mark the current state as visited.

        // If a path of exactly 3 edges has been traversed.
        if ( depth == 3 ) {
            newList [ now ] . parent . add ( root ) ; // Add 'root' as a parent of 'now' in 'newList'.
            // Also mark this specific (root, now) pair as processed to avoid duplicates
            // if multiple depth-3 paths exist from 'root' to 'now'.
            used . add ( root . toString ( ) + ":" + now . toString ( ) ) ;
            return ; // End this branch of DFS as the condition is met.
        }

        // Recursively visit children of the current node.
        var childNodes = list [ now ] . child ; // Get direct children from the original graph.
        for ( var j = 0 ; j < childNodes . length ; j ++ ) {
            // Call DFS for each child, incrementing the depth.
            dfs ( root , childNodes [ j ] , depth + 1 ) ;
        }

        return ; // End of the DFS function for this call.
    }
}
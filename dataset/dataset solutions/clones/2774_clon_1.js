/*
 * This file contains the main program logic,
 * including input/output handling utilities
 * and a depth-first search algorithm implementation.
 *
 * Generated as a Type I code clone.
 */
var read = require('readline') . createInterface ( {
        input   : process.stdin,
        output  : process.stdout
    }
);

var obj ;
var inLine = [ ] ;

// Event listener for each line of input received
read . on ( 'line' , function ( input )
{
    inLine . push ( input ) ;
}
) ;

// Event listener for when the input stream closes
read . on ( 'close' , function ( )
{
    obj = init ( inLine ) ;

    // Console error message to indicate input/output direction
    console . error ( '\n↑入力 ↓出力' ) ;

    Main ( ) ; // Invoke the primary function
}
) ;

/*
 * Creates a deep clone of an object.
 * Handles Set objects specifically, otherwise uses JSON serialization.
 * @param {object} obj - The object to clone.
 * @returns {object} A deep clone of the input object.
 */
function makeClone ( obj )
{
    return ( obj instanceof Set )
        ? new Set ( Array . from ( obj ) )
        : JSON . parse ( JSON . stringify ( obj ) ) ;
}

// Utility function to get the next integer from input.
function nextInt ( )
{
    return myconv ( next ( ) , 1 ) ;
}

// Utility function to get the next string array (split by space) from input.
function nextStrArray ( )
{
    return myconv ( next ( ) , 2 ) ;
}

// Utility function to get the next integer array (split by space and parsed) from input.
function nextIntArray ( )
{
    return myconv ( next ( ) , 4 ) ;
}

// Utility function to get the next character array (split by character) from input.
function nextCharArray ( )
{
    return myconv ( next ( ) , 6 ) ;
}

// Retrieves the next item from the input object.
function next ( )
{
    return obj . next ( ) ;
}

// Checks if there are more items in the input.
function hasNext ( )
{
    return obj . hasNext ( ) ;
}

/*
 * Initializes the input object with helper methods for traversal.
 * @param {Array<string>} input - An array of input lines.
 * @returns {object} An object with list, index, max, hasNext, and next properties.
 */
function init ( input )
{
    return {
        list    : input ,
        index   : 0 ,
        max     : input . length ,

        hasNext : function ( )
        {
            return ( this . index < this . max ) ;
        } ,

        next : function ( )
        {
            if ( this . hasNext ( ) )
            {
                return this . list [ this . index ++ ] ;
            }
            else
            {
                throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ;
            }
        }
    } ;
}

// Prints a message to the console.
function myout ( s )
{
    console . log ( s ) ;
}

// Prints a debug message to the console error stream.
function myerr ( s )
{
    console . error ( 'debug:' + require ( 'util' ) . inspect ( s , false , null ) ) ;
}

/*
 * Converts input 'i' based on the specified 'no' parameter.
 * @param {*} i - The input to convert.
 * @param {number} no - Conversion type:
 *   1: Parse as integer.
 *   2: Split string by space.
 *   4: Split string by space and map to numbers.
 *   6: Split string by character.
 *   7: Split string by character and map to numbers.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without a separator.
 *   Default: Return input as is.
 * @returns {*} The converted value.
 */
function myconv ( i , no )
{
    try
    {
        switch ( no )
        {
            case 1:
                return parseInt ( i ) ;
            case 2:
                return i . split ( ' ' ) ;
            case 4:
                return i . split ( ' ' ) . map ( Number ) ;
            case 6:
                return i . split ( '' ) ;
            case 7:
                return i . split ( '' ) . map ( Number ) ;
            case 8:
                return i . join ( ' ' ) ;
            case 9:
                return i . join ( '\n' ) ;
            case 0:
                return i . join ( '' ) ;
            default:
                return i ;
        }
    }
    catch ( e )
    {
        return i ; // Return original input in case of error
    }
}

// This is the main function where the program execution starts.
function Main ( )
{
    var one = nextIntArray ( ) ; // Read the first line as an array of integers.
    var N = one [ 0 ] ; // N represents the number of nodes.
    var K = one [ 1 ] ; // K represents the initial number of colors available.

    // Initialize an array of N nodes.
    var list = new Array ( N ) ;
    for ( var i = 0 ; i < N ; i ++ )
    {
        list [ i ] = {
            child   : [ ] , // List of child nodes (adjacency list).
            no      : i ,   // Node identifier.
            count   : 0 ,   // Number of colors assigned to this node.
            access  : false // Flag to track if the node has been visited.
        } ;
    }

    // Read N-1 edges to build the tree structure.
    for ( var i = 0 ; i < N - 1 ; i ++ )
    {
        var tmp = nextIntArray ( ) ; // Read an edge (two connected nodes).
        // Adjust to 0-indexed and add to adjacency list.
        list [ tmp [ 0 ] - 1 ] . child . push ( tmp [ 1 ] - 1 ) ;
        list [ tmp [ 1 ] - 1 ] . child . push ( tmp [ 0 ] - 1 ) ;
    }

    var output = 1 ; // Initialize the result accumulator.
    var mod = 1000000007 ; // Modulo for calculations.

    // Mark the root node (node 0) as accessed.
    list [ 0 ] . access = true ;
    // Start the Depth First Search from the root.
    dfs ( 0 , K , 0 , K ) ;

    // Calculate the final output by multiplying counts of all nodes modulo 'mod'.
    for ( var i = 0 ; i < N ; i ++ )
    {
        output *= list [ i ] . count ;
        output %= mod ;
    }

    myout ( output ) ; // Output the final result.


    /*
     * Performs a Depth First Search (DFS) to assign colors to nodes.
     * @param {number} parentNodeCount - The number of parent nodes already colored (0 or 1).
     * @param {number} color - The number of colors available for the current node.
     * @param {number} now - The current node index.
     * @param {number} constK - The constant initial K value.
     */
    function dfs ( parentNodeCount , color , now , constK )
    {
        list [ now ] . count = color ; // Assign the current available colors to the node's count.

        // Increment parentNodeCount if it's less than 2 (for root and its direct children).
        if ( parentNodeCount < 2 )
        {
            parentNodeCount ++ ;
        }

        var child = list [ now ] . child ; // Get children of the current node.
        var successCount = 0 ; // Counter for successfully colored children.

        // Iterate through all children of the current node.
        for ( var i = 0 ; i < child . length ; i ++ )
        {
            // If a child has not been accessed yet (not visited).
            if ( ! list [ child [ i ] ] . access )
            {
                list [ child [ i ] ] . access = true ; // Mark child as accessed.

                // Recursively call DFS for the child node.
                // The number of colors available for the child is K minus
                // the already assigned parent colors and successfully colored siblings.
                dfs ( parentNodeCount , constK - successCount - parentNodeCount , child [ i ] , constK ) ;
                successCount ++ ; // Increment count of successfully processed children.
            }
        }
    }
}
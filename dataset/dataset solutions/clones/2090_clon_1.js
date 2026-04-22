"use strict"; // Enable strict mode for better error handling and cleaner code.


// -----------------------------------------------------------------------------
// Input Reading Utilities
// These functions are designed to efficiently read input from standard input
// in competitive programming contexts.
// -----------------------------------------------------------------------------

/*
 * Reads the entire content of standard input synchronously.
 * It's assumed that the input will be provided via /dev/stdin.
 */
var input = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) ;

/*
 * Parses the input string into an array of strings,
 * splitting by spaces or newlines.
 * 'cid' acts as a pointer to the current token being processed.
 */
var cin = input . split( / |\n/ ) , cid = 0 ;


/**
 * Retrieves the next token from the input array.
 *
 * @param {boolean} a - If true, returns the token as a string.
 *                        If false or undefined, attempts to convert to a number.
 * @returns {string|number} The next token from the input.
 */
function next ( a )
{
    return a
           ? cin [ cid ++ ]
           : + cin [ cid ++ ] ;
} // End of next function


/**
 * Retrieves a specified number of tokens from the input array.
 *
 * @param {number} n - The number of tokens to retrieve.
 * @param {boolean} a - If true, returns tokens as strings.
 *                        If false or undefined, attempts to convert to numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens.
 */
function nexts ( n , a )
{
    // If 'a' is true, return string slices directly
    if ( a )
    {
        return cin . slice( cid , cid += n ) ;
    }
    // Otherwise, convert to numbers using map
    else
    {
        return cin . slice( cid , cid += n ) . map( a => + a ) ;
    }
} // End of nexts function


/**
 * Retrieves a 2D matrix (array of arrays) of tokens from the input.
 *
 * @param {number} h - The number of rows (height) of the matrix.
 * @param {number} w - The number of columns (width) of each row.
 * @param {boolean} a - If true, returns tokens as strings.
 *                        If false or undefined, attempts to convert to numbers.
 * @returns {Array<Array<string|number>>} The 2D matrix.
 */
function nextm ( h , w , a )
{
    var r = [ ] , i = 0 ; // Initialize result array and loop counter

    // If 'a' is true, store string slices
    if ( a )
    {
        for ( ; i < h ; i ++ )
        {
            r . push( cin . slice( cid , cid += w ) ) ;
        }
    }
    // Otherwise, convert to numbers
    else
    {
        for ( ; i < h ; i ++ )
        {
            r . push( cin . slice( cid , cid += w ) . map( a => + a ) ) ;
        }
    }

    return r ;
} // End of nextm function


/**
 * Dynamically creates a multi-dimensional array with a specified fill value.
 *
 * This function uses 'eval' and string concatenation to build the array
 * creation logic, which can be flexible but also carries security implications
 * if the 'v' parameter is user-controlled.
 *
 * @param {*} v - The value to fill the innermost array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., xArray("0", 3, 4) for a 3x4 array).
 * @returns {Array} The created multi-dimensional array.
 */
function xArray ( v )
{
    var a = arguments , // All arguments passed to the function
        l = a . length ,  // Number of arguments
        r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ; // Innermost array creation

    // Build the outer array creation logic
    while ( -- l )
    {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }

    return eval( r ) ; // Execute the constructed string as JavaScript code
} // End of xArray function


// -----------------------------------------------------------------------------
// Global Variables for the Main Logic
// These variables store the state and data structures used throughout the program.
// -----------------------------------------------------------------------------

var n        , // Number of nodes in the graph
    graph    , // Adjacency list representation of the graph
    depth    , // Array to store the depth (distance from root) of each node
    parent   , // Array to store the parent of each node in the DFS tree
    ans      , // Array to store the final assigned values for each node
    depth2   ; // Array of arrays, where depth2[d] stores nodes at depth 'd'


// -----------------------------------------------------------------------------
// Main Execution Block (Commented Out for Conditional Execution)
// This block is typically used for direct execution in a non-forked scenario.
// -----------------------------------------------------------------------------

// var myOut = main();
// if ( myOut !== undefined )
// {
//     console.log( myOut ) ;
// }


// -----------------------------------------------------------------------------
// Main Function
// Contains the primary logic for solving the problem.
// -----------------------------------------------------------------------------

function main ( )
{
    n      = next( ) ; // Read the number of nodes

    // Initialize graph as an array of empty arrays
    graph  = xArray( "[]" , n ) ;
    // Initialize depth array
    depth  = Array( n ) ;
    // Initialize depth2 as an array of empty arrays for grouping nodes by depth
    depth2 = xArray( "[]" , n ) ;
    // Initialize parent array
    parent = Array( n ) ;
    // Initialize answer array
    ans    = Array( n ) ;

    // Read graph edges
    for ( var i = 1 ; i < n ; i ++ )
    {
        var a = next( ) - 1 , // Read first node (0-indexed)
            b = next( ) - 1 ; // Read second node (0-indexed)

        // Add edges to the adjacency list
        graph[ a ] . push( b ) ;
        graph[ b ] . push( a ) ;
    }

    // Perform Depth First Search starting from node 0, with no parent, at depth 0
    dfs( 0 , -1 , 0 ) ;

    var odd  = 0 , // Counter for nodes at odd depths
        even = 0 ; // Counter for nodes at even depths

    // Calculate odd/even depth counts and initialize 'ans' based on parity
    for ( var i = 0 ; i < n ; i ++ )
    {
        ans[ i ] = depth[ i ] % 2 ; // 0 for even depth, 1 for odd depth
        if ( ans[ i ] )
        {
            odd ++ ; // Increment odd count if depth is odd
        }
        else
        {
            even ++ ; // Increment even count if depth is even
        }
    }

    // Calculate target group sizes for partitioning numbers 1 to N
    var n1 = Math . ceil( n / 3 ) , // Upper bound for the first group
        n3 = n / 3 | 0           , // Lower bound for the third group (integer division)
        n2 = n - n1 - n3         ; // Upper bound for the second group

    // Initialize values for three groups (1, 2, 3, 4, 5, 6, ...)
    var a1 = 1 , // Starts with 1, increment by 3
        a2 = 2 , // Starts with 2, increment by 3
        a3 = 3 ; // Starts with 3, increment by 3

    // Case 1: If the count of odd-depth nodes is small enough to fit into one group (n3)
    if ( odd <= n3 )
    {
        for ( var i = 0 ; i < n ; i ++ )
        {
            if ( ans[ i ] ) // If current node is at an odd depth
            {
                ans[ i ] = a3 ; // Assign from the 'a3' sequence
                a3 += 3 ;
            }
            else // If current node is at an even depth
            {
                if ( a1 <= n ) // Try assigning from 'a1' sequence
                {
                    ans[ i ] = a1 ;
                    a1 += 3 ;
                }
                else if ( a2 <= n ) // Else, try assigning from 'a2' sequence
                {
                    ans[ i ] = a2 ;
                    a2 += 3 ;
                }
                else // Else, assign from 'a3' sequence (fallback)
                {
                    ans[ i ] = a3 ;
                    a3 += 3 ;
                }
            }
        }
    }
    // Case 2: If the count of even-depth nodes is small enough to fit into one group (n3)
    else if ( even <= n3 )
    {
        for ( var i = 0 ; i < n ; i ++ )
        {
            if ( ans[ i ] === 0 ) // If current node is at an even depth
            {
                ans[ i ] = a3 ; // Assign from the 'a3' sequence
                a3 += 3 ;
            }
            else // If current node is at an odd depth
            {
                if ( a1 <= n ) // Try assigning from 'a1' sequence
                {
                    ans[ i ] = a1 ;
                    a1 += 3 ;
                }
                else if ( a2 <= n ) // Else, try assigning from 'a2' sequence
                {
                    ans[ i ] = a2 ;
                    a2 += 3 ;
                }
                else // Else, assign from 'a3' sequence (fallback)
                {
                    ans[ i ] = a3 ;
                    a3 += 3 ;
                }
            }
        }
    }
    // Case 3: Neither odd nor even counts are small enough for a single group,
    //         so we distribute more evenly.
    else
    {
        for ( var i = 0 ; i < n ; i ++ )
        {
            if ( ans[ i ] ) // If current node is at an odd depth
            {
                if ( a1 <= n ) // Try assigning from 'a1' sequence
                {
                    ans[ i ] = a1 ;
                    a1 += 3 ;
                }
                else // Else, assign from 'a3' sequence
                {
                    ans[ i ] = a3 ;
                    a3 += 3 ;
                }
            }
            else // If current node is at an even depth
            {
                if ( a2 <= n ) // Try assigning from 'a2' sequence
                {
                    ans[ i ] = a2 ;
                    a2 += 3 ;
                }
                else // Else, assign from 'a3' sequence
                {
                    ans[ i ] = a3 ;
                    a3 += 3 ;
                }
            }
        }
    }

    // Return the final assigned values as a space-separated string
    return ans . join( " " ) ;
} // End of main function


// -----------------------------------------------------------------------------
// Depth First Search (DFS) Function
// Traverses the graph to calculate depths and parents.
// -----------------------------------------------------------------------------

/**
 * Performs a Depth First Search traversal of the graph.
 *
 * @param {number} v - The current node being visited.
 * @param {number} p - The parent of the current node.
 * @param {number} d - The current depth of the node from the root.
 */
function dfs ( v , p , d )
{
    depth[ v ] = d ;         // Store the depth of the current node
    depth2[ d ] . push( v ) ; // Add the current node to the list of nodes at this depth
    parent[ v ] = p ;        // Store the parent of the current node

    // Iterate over all neighbors of the current node
    for ( var V of graph[ v ] )
    {
        V = + V ; // Ensure neighbor is treated as a number (important for comparison)

        if ( V === p ) // If the neighbor is the parent, skip it to avoid going back up
        {
            continue ;
        }

        dfs( V , v , d + 1 ) ; // Recursively call DFS for the neighbor, incrementing depth
    }
} // End of dfs function


// -----------------------------------------------------------------------------
// Conditional Execution Block
// This block handles how the main logic is executed, either directly or via forking.
// This setup is common in competitive programming to manage stack size limits.
// -----------------------------------------------------------------------------

// If the number of command-line arguments is small (e.g., no explicit '1' argument),
// it means the script is likely being run directly without a forked process.
// In this case, fork itself with a larger stack size.
if ( process . argv . length <= 2 )
{
    require( "child_process" ) . fork( "Main.js" , [ "1" ] ,
    {
        execArgv: [ "--stack-size=240000" ] // Set a larger stack size for the forked process
    } ) ;
}
// Otherwise, if the script was forked (indicated by an argument like '1'),
// then proceed with the main logic execution.
else
{
    var myOut = main( ) ; // Call the main function to get the result

    // If the main function returned a value (i.e., not undefined), print it to console.
    if ( myOut !== undefined )
    {
        console . log( myOut ) ;
    }
} // End of conditional execution block
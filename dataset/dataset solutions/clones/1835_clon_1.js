"use strict" ; /* This directive enforces strict mode for the entire script,
                           leading to cleaner code and fewer silent errors. */


var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; // Standard input reading using Node.js 'fs' module.


var cin = input . trim ( ) . split ( / |\n/ ) , cid = 0 ; // Parses input into an array 'cin', splitting by spaces or newlines.
                                                       // 'cid' is an unused variable, potentially for future input indexing.


/**
 * The core function that orchestrates the calculation of nodes in a specific
 * tree-like structure, based on given leaf requirements at each depth.
 * It aims to find the minimum total number of nodes or indicate impossibility.
 */
function main ( )
{
    // N represents the maximum depth or number of levels in the tree.
    let N = + cin . shift ( ) ;

    // A is an array where A[d] denotes the number of leaves required at depth 'd'.
    let A = cin . map ( x => +x ) ;


    // 'node' array will store the actual number of nodes present at each depth 'd'.
    let node = Array ( N + 1 ) ;

    // 'ans' is the accumulator for the total number of nodes in the tree.
    let ans = 1 ; // Starts with 1 because the root node always exists.


    // Initialize the root node at depth 0. There's always exactly one root.
    node [ 0 ] = 1 ;


    /*
     * This loop propagates downwards from the root (depth 0) to depth N-1.
     * It calculates the number of nodes required at the next depth based on
     * the current depth's nodes and the required leaves at the current depth.
     */
    for ( let d = 0 ; d < N ; d ++ )
    {
        // The formula for nodes at depth d+1: (nodes at d - leaves required at d) * 2.
        // Each non-leaf node at depth 'd' creates two children at depth 'd+1'.
        node [ d + 1 ] = ( node [ d ] - A [ d ] ) * 2 ;

        // Check if the calculated number of nodes for the next level is positive.
        // A non-positive number implies an impossible tree structure.
        if ( node [ d + 1 ] > 0 )
        {
            ans += node [ d + 1 ] ; // Add the newly calculated nodes to the total.
        }
        else
        {
            console . log ( -1 ) ; // Output -1 for an impossible scenario.
            return ;              // Terminate the function immediately.
        }
    } // End of the forward propagation loop.


    // console.log ( "Current total nodes (ans):" , ans ) ; // A commented-out line for debugging purposes.


    /*
     * This conditional block evaluates the state of the tree at the deepest level (N)
     * and determines the final outcome or initiates a backward adjustment process.
     */
    if ( node [ N ] < A [ N ] )
    {
        // If the actual nodes at depth N are fewer than the required leaves A[N],
        // the tree cannot satisfy the requirements, thus it's impossible.
        console . log ( -1 ) ;
    }
    else if ( node [ N ] == A [ N ] )
    {
        // If the actual nodes at depth N exactly match the required leaves A[N],
        // the 'ans' calculated so far is the correct final answer.
        console . log ( ans ) ;
    }
    else
    {
        /*
         * This block is executed when node[N] > A[N], meaning there are
         * too many nodes at the deepest level. We must "prune" excess branches
         * by working backward from the leaves to the root.
         *
         * Original comment: "node[d] が多すぎた場合。枝を逆に減らしていく必要がある。"
         * Translation: "If node[d] is too many. It is necessary to reduce branches in reverse."
         */

        // 'over' array will store the count of excess nodes identified at each depth 'd'.
        let over = Array ( N + 1 ) ;

        // 'nodemax' array tracks the maximum permissible number of nodes at each depth,
        // ensuring we don't exceed A[N] at the deepest level and propagating this constraint upwards.
        let nodemax = Array ( N + 1 ) ;

        // Initialize the maximum allowed nodes at the deepest level N to be exactly A[N].
        nodemax [ N ] = A [ N ] ;


        /*
         * This loop iterates backward from the deepest level (N) up to level 1.
         * It determines how many nodes could have existed at the parent level (d-1)
         * while satisfying the constraints at the current level (d).
         */
        for ( let d = N ; d > 0 ; d -- )
        {
            // console.log ( { d , A , node , nodemax , ans } ) ; // Another commented debugging line.

            // If the maximum allowed nodes at depth 'd' are sufficient or more than the actual nodes 'node[d]',
            // no pruning is needed from this level. The parent's nodemax is based on 'node[d]'.
            if ( nodemax [ d ] >= node [ d ] )
            {
                nodemax [ d - 1 ] = node [ d ] + A [ d - 1 ] ;
            }
            else
            {
                // If 'nodemax[d]' is less than 'node[d]', it means there were excess nodes
                // at this depth 'd' based on the A[N] constraint.
                over [ d ] = node [ d ] - nodemax [ d ] ; // Calculate the amount of excess nodes.
                ans = ans - over [ d ] ;                   // Subtract these excess nodes from the total.

                // The parent's nodemax is now based on the constrained 'nodemax[d]'.
                nodemax [ d - 1 ] = nodemax [ d ] + A [ d - 1 ] ;
            }
        } // End of the backward propagation loop.

        // After the backward pass, a final check is needed for the root level (depth 0).
        if ( nodemax [ 0 ] < node [ 0 ] )
        {
            // If the maximum allowed nodes at the root (nodemax[0]) is less than the
            // actual root nodes (node[0], which is always 1), it means even the root
            // needs to be "pruned" (conceptually, though node[0] is fixed at 1).
            // This adjusts 'ans' if the root's contribution was effectively too high.
            ans = ans - node [ 0 ] + nodemax [ 0 ] ;
        }

        // Output the final adjusted total number of nodes.
        console . log ( ans ) ;
    }
} // End of the 'main' function.


// Invoke the main function to start the program execution.
main ( ) ;
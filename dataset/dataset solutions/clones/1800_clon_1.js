"use strict"
/*
 * This JavaScript file processes input from /dev/stdin.
 * It includes several utility functions for reading different data types.
 * The core logic is encapsulated within the 'main' function.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */


var    input = require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   ;


// 'cin' stores the parsed input tokens, 'cid' is the current index for consumption.
var cin = input.split    (    / |\n/    )    ,    cid = 0    ;

/**
 * Reads the next token from input and converts it to a number.
 * @returns {number} The next numerical token.
 */
function next ( ) {

    return +cin [ cid++ ] ;
}

/**
 * Reads the next token as a string.
 * @returns {string} The next string token.
 */
function nextstr ( ) {

    return cin [ cid++ ] ;
}

/**
 * Reads the next token and converts it to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function nextbig ( ) {

    return BigInt (   cin [ cid++ ]   )   ;
}

/**
 * Reads 'n' tokens, optionally mapping them to numbers.
 * @param {number} n The number of tokens to read.
 * @param {boolean} a If true, return as strings; otherwise, map to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function nexts (   n   ,   a   ) {

    // Conditional logic for mapping or direct slicing
    return a ? cin . slice (   cid   ,   cid += n   ) : cin . slice (   cid   ,   cid += n   ) . map (   a   =>   +a   )   ;

}

/**
 * Reads a 2D matrix of dimensions h x w.
 * @param {number} h Height of the matrix.
 * @param {number} w Width of the matrix.
 * @param {boolean} a If true, store as strings; otherwise, map to numbers.
 * @returns {Array<Array<string|number>>} The matrix.
 */
function nextm (   h   ,   w   ,   a   ) {

    var r = [ ] , i = 0 ;

    // Loop through rows
    if (   a   )

        for (   ;   i < h   ;   i++   )

            r . push (   cin . slice (   cid   ,   cid += w   )   )   ;

    else

        for (   ;   i < h   ;   i++   )

            r . push (   cin . slice (   cid   ,   cid += w   ) . map (   a   =>   +a   )   )   ;

    return r ;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * Uses eval for dynamic array creation.
 * @param {*} v The value to initialize array elements with.
 * @returns {Array} The initialized multi-dimensional array.
 */
function xArray (   v   ) {

    var a = arguments , l = a . length , r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ;

    // Build the string representation of array creation
    while (   --l   )

        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")"   ;

    return eval (   r   )   ; // Execute the constructed string as code
}


// --- Main execution block ---

// Call the main function and capture its output
var myOut = main ( ) ;


// If main returns a value, print it to console
if (   myOut !== undefined   ) {

    console . log (   String (   myOut   )   )   ;

}


/**
 * The primary logic function for the program.
 * It processes input, performs calculations, and returns the final result.
 */
function main ( ) {

    // Constant for array dimension or bit shift
    const aa = 10 ;

    // Read the main input variable 'n'
    var n = next ( ) ;


    // Calculate 'mn' using Math.min and a bit shift operation
    var mn = Math . min (   n   ,   1 << aa   )   ;


    // Read a matrix 'V' of size n x 2
    var V = nextm (   n   ,   2   )   ;


    // Read the number of queries 'q'
    var q = next ( ) ;


    // Initialize a 2D array 'need' with 'n' elements, each starting with [0]
    var need = xArray (   "[0]"   ,   n   )   ;


    // Process each query
    for (   var i = 0   ;   i < q   ;   i++   ) {

        // Read query parameters 'u' and 'l', adjusting 'u' to be 0-indexed
        var u = next ( ) - 1   ,   l = next ( )   ;

        // Store query index and 'l' value
        need [ u ] . push (   i   ,   l   )   ;


        // Update the maximum 'l' value encountered for 'u'
        if (   need [ u ] [ 0 ] < l   ) {
            need [ u ] [ 0 ] = l ;
        }


        // Propagate 'l' upwards in a tree-like structure (parent nodes)
        while (   u   ) {

            u = u - 1 >> 1 ; // Move to parent node (integer division by 2, then subtract 1)

            // If parent already has a greater or equal 'l', no further propagation needed
            if (   need [ u ] [ 0 ] >= l   ) {
                break ;
            }

            // Update parent's 'l' value
            need [ u ] [ 0 ] = l ;
        }
    }


    // Initialize variables for dynamic programming
    var v = V [ 0 ] [ 0 ]   ,   w = V [ 0 ] [ 1 ]   ,   mx = need [ 0 ] [ 0 ] + 1   ;


    // Create DP array
    var dp = Array (   aa   )   ;

    // Initialize the first level of the DP array
    dp [ 0 ] = Array (   mx   ) . fill (   0   ,   0   ,   w   ) . fill (   v   ,   w   )   ;


    // Array to store final answers for queries
    var ans = xArray (   0   ,   q   )   ;


    // Initial call to solve function
    solve (   0   ,   0   )   ;

    // Queue for processing tree nodes
    var qq = [ ]   ;

    // Populate initial queue based on 'n'
    if (   n > 2   ) {

        qq = [ 1   ,   -1   ,   2   ,   1   ]   ;

    } else if (   n === 2   ) {

        qq = [ 1   ,   -1   ]   ;

    }


    // Main loop for processing the queue
    while (   qq . length   ) {

        // Dequeue node and depth information
        var d = qq . pop ( )   ,   u = qq . pop ( )   ,   mx = need [ u ] [ 0 ] + 1   ;


        // Skip if max length is 1 (no items to process)
        if (   mx === 1   ) {

            continue ;
        }


        // Get item value and weight for current node
        v = V [ u ] [ 0 ]   ,   w = V [ u ] [ 1 ]   ;


        // Adjust 'd' and update DP array based on its sign
        if (   d < 0   ) {

            d = -d   ;
            dp [ d ] = dp [ d - 1 ]   ;

        } else {

            dp [ d ] = dp [ d - 1 ] . slice (   0   ,   mx   )   ;
        }


        // DP calculation: Knapsack-like update
        for (   var i = mx - 1   ;   w <= i   ;   i--   ) {

            if (   dp [ d ] [ i ] < dp [ d ] [ i - w ] + v   ) {

                dp [ d ] [ i ] = dp [ d ] [ i - w ] + v   ;
            }
        }


        // Call solve for current node and depth
        solve (   u   ,   d   )   ;


        // Move to the left child
        u = u + u + 1   ;


        // If child index is out of bounds, continue
        if (   n <= u   ) {

            continue ;
        }


        // Special handling for the deepest level (aa-1)
        if (   d === aa - 1   ) {

            var p = u >> 1 ; // Parent node index (not used directly in this block)
            var qz = [ ]   ,   t = [ ]   ; // Temporary queue and array for this branch


            // Populate 'qz' based on child presence
            if (   u + 1 === n   ) {
                qz = [ u   ,   -1 ]   ; // Only left child
            } else {
                qz = [ u   ,   0   ,   u + 1   ,   -1 ]   ; // Both children
            }


            // Inner loop for processing this subtree
            while (   qz . length   ) {

                var z = qz . pop ( )   ,   u = qz . pop ( )   ,   mx = need [ u ] [ 0 ] + 1   ;

                if (   mx === 1   ) {
                    continue ;
                }

                // Reset 't' array length if 'z' is valid
                if (   z >= 0   ) {
                    t . length = z   ;
                }

                var ln = t . length   ; // Current length of 't'


                // Get value and weight for current node 'u'
                v = V [ u ] [ 0 ]   ,   w = V [ u ] [ 1 ]   ;

                // Add current item to 't' if its weight is within 'mx'
                if (   w <= mx   ) {

                    t . push (   v   ,   w   )   ;
                }

                // Combine items already in 't' with the current item
                for (   var i = 0   ;   i < ln   ;   i += 2   ) {

                    if (   t [ i + 1 ] + w <= mx   ) {

                        t . push (   t [ i ] + v   ,   t [ i + 1 ] + w   )   ;
                    }
                }

                // Process queries associated with node 'u'
                for (   var i = 1   ;   i < need [ u ] . length   ;   i += 2   ) {

                    var id = need [ u ] [ i ]   ,   ll = need [ u ] [ i + 1 ]   ;

                    for (   var k = 0   ;   k < t . length   ;   k += 2   ) {

                        var vv = t [ k ]   ,   ww = t [ k + 1 ]   ;

                        if (   ll < ww   ) {
                            continue ;
                        }

                        // Update answer if a better value is found
                        if (   ans [ id ] < dp [ d ] [ ll - ww ] + vv   ) {

                            ans [ id ] = dp [ d ] [ ll - ww ] + vv   ;
                        }
                    }
                }

                // Move to the left child for the next iteration in this subtree
                u = u + u + 1   ;

                if (   n <= u   ) {
                    continue ;
                }

                // Enqueue children for processing
                if (   u + 1 === n   ) {
                    qz . push (   u   ,   -1   )   ;
                } else {
                    qz . push (   u   ,   t . length   ,   u + 1   ,   -1   )   ;
                }
            }

        } else { // For levels above the deepest

            d++ ; // Increment depth

            // Enqueue children with appropriate depth and sign
            if (   u + 1 === n   ) {

                qq . push (   u   ,   -d   )   ;

            } else {

                qq . push (   u   ,   -d   ,   u + 1   ,   d   )   ;

            }
        }
    }

    // Join all answers with newline characters and return
    return ans . join (   "\n"   )   ;


    /**
     * Helper function to solve queries for a given node and depth.
     * @param {number} k Node index.
     * @param {number} d Current depth.
     */
    function solve (   k   ,   d   ) {

        var a = need [ k ]   ;

        // Iterate through queries associated with node 'k'
        for (   var i = 1   ;   i < a . length   ;   i += 2   ) {

            // Assign the DP value as the answer for the query
            ans [ a [ i ] ] = dp [ d ] [ a [ i + 1 ] ]   ;

        }

    }

}
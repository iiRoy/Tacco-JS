// This file contains the main application logic.
/// <reference path="node.d.ts" /> // Reference to Node.js type definitions.
/// <reference path="lib.ts" />   /* Reference to custom utility library. */


/**
 * The primary function to process input and generate output.
 * @param {string[]} input - An array of strings representing input data.
 */
function   main (   input   )
{
    // Extract the first element as the count 'n' and convert to a number.
    var   n   =   +input.shift ( ) ;

    var   a   =   [ ] ; // Initialize an empty array 'a' to store numbers.

    // Loop 'n' times to populate array 'a'.
    for (   var   i   =   0 ;   i   <   n ;   ++i   )
    {
        /*
         *   Push the next shifted input element,
         *   converted to a number, into array 'a'.
         */
        a.push (   +input.shift ( )   ) ;
    }


    var   ans   =   [ ] ; // Initialize an empty array 'ans' to store results.

    // Calculate and store the minimum, maximum, and sum of array 'a'.
    ans.push (   _.min (   a   )   ) ;
    ans.push (   _.max (   a   )   ) ;
    ans.push (   _.sum (   a   )   ) ;


    // Write the joined results to standard output, separated by spaces.
    process.stdout.write (   ans.join (   ' '   )   ) ;
}


// --- Main execution setup ---

/// <reference path="node.d.ts" /> // Node.js type definitions are crucial here.
/// <reference path="main.ts" />   /* Ensures 'main' function is available. */


// Keep the Node.js process alive.
process.stdin.resume ( ) ;

// Set the encoding for standard input.
process.stdin.setEncoding (   'utf8'   ) ;

/**
 * Event listener for incoming data on standard input.
 * @param {string} chunk - The incoming data chunk.
 */
process.stdin.on (   'data' ,   function   (   chunk   )
{
    // Split the chunk by whitespace and pass it to the main function.
    main (   chunk.split (   /\s+/   )   ) ;
}   ) ;


/*
 *   Utility library namespace, inspired by Lodash.
 *   Provides common array operations.
 */
var   _ ;

(   function   (   _   )
{
    /**
     * Finds the minimum value in an array of numbers.
     * @param {number[]} a - The array of numbers.
     * @returns {number} The minimum value.
     */
    function   min (   a   )
    {
        // Use Math.min.apply to find the minimum in an array.
        return   Math.min.apply (   Math ,   a   ) ;
    }
    _.min   =   min ;


    /**
     * Finds the maximum value in an array of numbers.
     * @param {number[]} a - The array of numbers.
     * @returns {number} The maximum value.
     */
    function   max (   a   )
    {
        // Use Math.max.apply to find the maximum in an array.
        return   Math.max.apply (   Math ,   a   ) ;
    }
    _.max   =   max ;


    /**
     * Reduces an array to a single value by iterating and applying a function.
     * @param {T[]} a - The array to reduce.
     * @param {function(U, T): U} func - The reducer function.
     * @param {U} init - The initial value for the reduction.
     * @returns {U} The reduced value.
     * @template T, U
     */
    function   reduce (   a ,   func ,   init   )
    {
        var   result   =   init ; // Initialize result with the initial value.

        // Iterate through the array and apply the reducer function.
        for (   var   i   =   0 ;   i   <   a.length ;   ++i   )
        {
            result   =   func (   result ,   a[i]   ) ;
        }
        return   result ; // Return the final reduced value.
    }
    _.reduce   =   reduce ;


    /**
     * Calculates the sum of all numbers in an array.
     * @param {number[]} a - The array of numbers.
     * @returns {number} The sum of the numbers.
     */
    function   sum (   a   )
    {
        // Use the 'reduce' function to sum all elements.
        return   reduce (   a ,   function   (   result ,   v   )   {   return   result   +   v ;   } ,   0   ) ;
    }
    _.sum   =   sum ;

}   ) (   _   ||   (   _   =   { }   )   ) ;
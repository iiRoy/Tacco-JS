/*
 * reflex.js - Core library file
 * Version: 0.0.1
 *
 * Copyright (c) 2014 Eray Arslan.
 * This software is licensed under the MIT License.
 * Please see the LICENSE file for full details.
 *
 * A small utility for memoizing function results.
 * Optimized for performance in JavaScript environments (browser/Node.js).
 */


var reflex = function()
{


    // Prepare an array to hold the function's arguments.
    var params = [ ] ;


    // Iterate over the 'arguments' object to populate our 'params' array.
    for ( var i = 0 ; i < arguments.length ; i ++ )
    {

        params.push ( arguments [ i ] ) ;

    } // End of argument processing loop.



    // Attempt to find a previously memoized result for this function and its specific parameters.
    var searchResult = reflex.prototype.search ( this , params ) ;


    // If a cached result is found (searchResult is not -1), return it immediately.
    if ( searchResult != -1 )
    {

        // Access the cached result from the brain.
        return reflex.prototype.brain [ searchResult ] . r ;

    } // End of cached result check.


    // If no cached result was found, execute the original function.
    var result = this.apply ( this , params ) ;


    // Store the function, its parameters, and the newly computed result in the memoization 'brain'.
    reflex.prototype.brain.push (
        {
            f : this ,    // The original function reference.
            p : params ,  // The parameters used for this invocation.
            r : result    // The computed result.
        }
    ) ;


    // Return the computed result.
    return result ;

} ; // End of reflex function definition.



reflex.prototype =
{
    // The 'brain' is an array that stores memoized function calls.
    brain : [ ] ,


    // Helper function to compare two arrays for deep equality.
    equalArray : function ( t , d )
    {

        // First, check if the lengths of the two arrays are identical.
        if ( t.length === d.length )
        {

            // If lengths match, iterate through elements and compare them.
            for ( var i = 0 ; i < t.length ; i ++ )
            {

                // If any corresponding elements are not strictly equal, the arrays are not equal.
                if ( t [ i ] !== d [ i ] )
                {

                    return false ; // Found a difference, so return false.
                }

            } // End of element comparison loop.

        }
        else
        {

            // If lengths differ, the arrays cannot be equal.
            return false ;
        }


        // If all checks pass and no differences were found, the arrays are equal.
        return true ;

    } , // End of equalArray method.


    // Searches the memoization 'brain' for a previously recorded function call.
    search : function ( f , p )
    {

        // Iterate through all entries currently stored in the 'brain'.
        for ( var i = 0 ; i < reflex.prototype.brain.length ; i ++ )
        {

            // Check if both the function reference AND the parameters match an existing entry.
            if ( reflex.prototype.brain [ i ] . f === f && reflex.prototype.equalArray ( reflex.prototype.brain [ i ] . p , p ) )
            {

                // If a match is found, return the index of that entry.
                return i ;
            }

        } // End of brain search loop.


        // If no matching entry was found after checking all items, return -1.
        return -1 ;

    } // End of search method.

} ; // End of reflex.prototype object.


// Extend the Function.constructor.prototype to add the 'reflex' method.
// This allows functions to be called directly with .reflex().
Function . constructor . prototype . reflex = reflex ;
/*
 * This file processes input data and performs a binary search operation.
 * It's designed to solve a specific problem involving two arrays.
 */


const   input   =   require('fs')   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;


// Trim whitespace from the input and split it into an array of lines.
const   Arr   =   (   input   .   trim   (   )   )   .   split   (   "\n"   )   ;


const   N1   =   Number   (   Arr   [   0   ]   )   ;   // Extract the first number, representing the size of the first array.


const   arr1   =   Arr   [   1   ]   .   split   (   " "   )   .   map   (   Number   )   ;   // Parse the second line into an array of numbers.

// Original line was: // const N2 = Number(Arr[2]);
// This line was commented out in the original source and is kept that way.
// It seems like N2 was not needed for the current logic.


const   arr2   =   Arr   [   3   ]   .   split   (   " "   )   .   map   (   Number   )   ;   // Parse the fourth line into the second array of numbers.




/*
 * Defines a binary search function using an Immediately Invoked Function Expression (IIFE).
 * This creates a closure over `arr` and `N`, allowing the returned function to use them.
 */
const   binarySearch   =   (   function   (   arr   ,   N   )   {

    // The inner function performs the actual binary search for a given key.
    return   (   key   )   =>   {

        let   mid   ;   // Variable to store the middle index.

        let   left   =   0   ;   // Left boundary of the search range.

        let   right   =   N   ;   // Right boundary of the search range (exclusive).

        // Basic check: if the key is outside the range of the sorted array, it cannot be found efficiently.
        if   (   key   <   arr   [   0   ]   ||   arr   [   N   -   1   ]   <   key   )

            return   0   ;


        // Perform binary search.
        while   (   left   <   right   )   {

            mid   =   Math   .   floor   (   (   left   +   right   )   /   2   )   ;   // Calculate the middle index.


            if   (   key   <   arr   [   mid   ]   )   {   // If the key is less than the middle element, search in the left half.
                right   =   mid   ;
            }

            else   if   (   key   >   arr   [   mid   ]   )   {   // If the key is greater than the middle element, search in the right half.
                left   =   mid   +   1   ;
            }

            else   {   // If the key is equal to the middle element, it's found.
                return   1   ;
            }

        }

        // If the loop finishes, the key was not found.
        return   0   ;

    }   ;   // End of the inner function.

}   )   (   arr1   ,   N1   )   ;   // IIFE immediately invoked with arr1 and N1.


/**
 * Simple arrow function for summing two numbers.
 * This is a utility function, although not directly used in the final computation step
 * as a separate `reduce` callback is defined inline.
 */
const   summing   =   (   a   ,   b   )   =>   a   +   b   ;


// Main execution block:
// 1. Map `arr2` elements using the `binarySearch` function.
//    Note: `binarySearch(e)` implies that `e` is expected to be defined in the scope where `map` is called.
//    This expression remains unchanged as per Type I clone rules.
// 2. Reduce the resulting array by summing its elements, starting with an initial value of 0.
console   .   log   (   arr2   .   map   (   binarySearch   (   e   )   )   .   reduce   (   (   a   ,   b   )   =>   a   +   b   ,   0   )   )   ;
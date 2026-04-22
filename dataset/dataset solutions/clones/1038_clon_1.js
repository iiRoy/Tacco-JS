/*
 *   Module: Search Algorithms
 *   Description: This file contains a binary search implementation
 *                and a main execution block to process input data.
 */

//  Function: binarySearch
//  Purpose:  To efficiently determine if a 'key' element exists within a sorted array 'a'.
//  Parameters:
//    - key: The value to search for.
//    - n:   The number of elements in the array 'a' to consider for the search.
//    - a:   The sorted array in which to perform the search.
//  Returns:  true if the key is found, false otherwise.
var   binarySearch   =   (   key   ,   n   ,   a   )   =>   {
    let   left   =   0   ;      // Initialize the lower bound of the search range.
    let   right   =   n   ;     // Initialize the upper bound (exclusive) of the search range.

    //  Continue searching as long as the lower bound is less than the upper bound.
    while   (   left   <   right   )   {
        //  Calculate the middle index to split the current search range.
        //  Math.floor ensures we get an integer index.
        let   mid   =   Math   .   floor   (   (   left   +   right   )   /   2   )   ;

        //  Check if the element at the middle index is equal to the key.
        if   (   a   [   mid   ]   ==   key   )   {
            return   true   ;     //  Key found! Return true immediately.
        }   //  If the key is less than the middle element, it must be in the left half.
        else   if   (   key   <   a   [   mid   ]   )   {
            right   =   mid   ;      //  Adjust the upper bound to the middle index.
        }   //  Otherwise, the key must be greater than the middle element, so it's in the right half.
        else   {
            left   =   mid   +   1   ;   //  Adjust the lower bound to one position past the middle.
        }
    }

    //  If the loop completes, it means the key was not found within the array.
    return   false   ;
}   ;



//  This is an Immediately Invoked Function Expression (IIFE).
//  It serves as the main entry point for the program, handling input and output.
(   function   (   stdin   )   {

    //  Step 1: Process raw input from stdin.
    //  -   trim() removes leading/trailing whitespace.
    //  -   split('\n') breaks the input into an array of lines.
    let   arr   =   (   stdin   .   trim   (   )   )   .   split   (   '\n'   )   ;

    //  Step 2: Parse the second line (index 1) into an array of numbers.
    //  -   split(" ") separates space-delimited numbers.
    //  -   map(Number) converts each string segment to a numeric type.
    let   s   =   arr   [   1   ]   .   split   (   " "   )   .   map   (   Number   )   ;

    //  Step 3: Parse the fourth line (index 3) into another array of numbers.
    let   t   =   arr   [   3   ]   .   split   (   " "   )   .   map   (   Number   )   ;


    let   ans   =   0   ;     //  Initialize a counter for elements found.

    //  Step 4: Iterate through each element in array 't'.
    //  For each element, check if it exists in array 's' using binary search.
    for   (   let   i   =   0   ;   i   <   t   .   length   ;   i   ++   )   {
        //  The binarySearch function returns true (which coerces to 1 in addition)
        //  or false (which coerces to 0). This effectively counts the found elements.
        ans   +=   binarySearch   (   t   [   i   ]   ,   s   .   length   ,   s   )   ;
    }

    //  Step 5: Output the final count to the console.
    console   .   log   (   ans   )   ;

}   )   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ; //  Pass stdin content to the IIFE.
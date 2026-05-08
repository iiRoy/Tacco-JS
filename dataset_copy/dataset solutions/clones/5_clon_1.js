/*
 * This script demonstrates sorting an array of numbers
 * and then printing the top N elements.
 */

// Define an array of heights (mountain heights, for instance).
var     heigths     =   [   1819,   2003,   876,    2840,
                            1723,   1673,   3776,   2848,
                            1592,   922
                        ]   ;


// Sort the 'heigths' array in descending order using a custom comparison function.
var sortedMountains =   heigths .   sort  (  sortNumbers  )   ;



// Loop through the first three elements of the sorted array and print them.
// This loop will execute exactly three times (for i = 0, 1, 2).
for  (  i   =   0  ;   i   !=   3  ;   i  ++   )
{
    // Output the current mountain height to the console.
    console .   log   (   sortedMountains   [   i   ]   )   ;
}


// --- Function Definition Section ---

/**
 * Custom comparison function for sorting numbers in descending order.
 * It takes two numbers, 'a' and 'b', and returns a value indicating
 * their relative order.
 *
 * @param {number} a - The first number for comparison.
 * @param {number} b - The second number for comparison.
 * @returns {number} A negative value if b should come before a,
 *                   a positive value if a should come before b,
 *                   or zero if they are equal.
 */
function    sortNumbers   (   a ,   b   )
{
    // Subtract 'a' from 'b' to achieve descending order.
    return  b   -   a   ;
}
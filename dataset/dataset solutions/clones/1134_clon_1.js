/*
 * This JavaScript function implements the 0/1 Knapsack problem
 * using dynamic programming.
 *
 * It calculates the maximum value that can be obtained from a set of items,
 * each with a weight and a value, given a maximum weight capacity W.
 *
 * Global variables N (number of items), W (knapsack capacity), and
 * items (array of item objects {v: value, w: weight}) are assumed to be
 * defined in the global scope before this function is called.
 */
function knapsack ( )
{
    // C[i][j] will store the maximum value that can be obtained
    // using the first 'i' items with a knapsack capacity of 'j'.
    var   C    =   [   ]   ;

    // Initialize the 2D array C.
    // Each row corresponds to an item, each column to a capacity.
    for  ( var   i   =   0   ;   i   <=   N   ;   i   ++   )
    {
        C   [   i   ]   =   [   ]   ; // Create a new row for each item index
    }


    // Base case: If capacity is 0, no items can be taken, so value is 0.
    for  ( var   i   =   0   ;   i   <=   W   ;   i   ++   )
    {
        C   [   0   ]   [   i   ]   =   0   ;
    }

    // Base case: If no items are considered, value is 0 regardless of capacity.
    for  ( var   i   =   0   ;   i   <=   N   ;   i   ++   )
    {
        C   [   i   ]   [   0   ]   =   0   ;
    }


    // Fill the DP table C using bottom-up approach.
    // Iterate through each item.
    for  ( var   i   =   1   ;   i   <=   N   ;   i   ++   )
    {
        // Iterate through each possible weight capacity.
        for  ( var   j   =   1   ;   j   <=   W   ;   j   ++   )
        {
            // Check if the current item's weight is less than or equal to the current capacity.
            if  (   items   [   i   ]   .   w   <=   j   )
            {
                // If the item can be included, decide whether to include it or not.
                // Compare (value of current item + value from remaining capacity with previous items)
                // vs (value without including current item, using previous items).
                if  (   items   [   i   ]   .   v   +   C   [   i   -   1   ]   [   j   -   items   [   i   ]   .   w   ]   >   C   [   i   -   1   ]   [   j   ]   )
                {
                    C   [   i   ]   [   j   ]   =   items   [   i   ]   .   v   +   C   [   i   -   1   ]   [   j   -   items   [   i   ]   .   w   ]   ;
                }
                else
                {
                    C   [   i   ]   [   j   ]   =   C   [   i   -   1   ]   [   j   ]   ;
                }
            }
            else
            {
                // If the item's weight is greater than the current capacity,
                // it cannot be included. So, take the value from the previous item.
                C   [   i   ]   [   j   ]   =   C   [   i   -   1   ]   [   j   ]   ;
            }
        }
    }

    // The maximum value is stored in the bottom-right cell of the DP table.
    return   C   [   N   ]   [   W   ]   ;
}


/* --- Global Scope Execution --- */

// Read input from standard input.
var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;

// Trim whitespace and split the input string into an array of lines.
var   Arr   =   (   input   .   trim   (   )   )   .   split   (   "\n"   )   ;

// The first line contains N (number of items) and W (knapsack capacity).
// Remove the first line, split by space, and convert to numbers.
var   NW   =   (   Arr   .   shift   (   )   )   .   split   (   " "   )   .   map   (   Number   )   ;

// Assign N and W from the parsed array.
var   N   =   NW   [   0   ]   ;
var   W   =   NW   [   1   ]   ;

// Initialize an array to store item objects.
// Using `null` at index 0 to make item indexing 1-based, matching problem statements.
var   items   =   [   null   ]   ;

// Populate the 'items' array.
// Each subsequent line in 'Arr' contains the value and weight of an item.
for  ( var   i   =   1   ;   i   <=   N   ;   i   ++   )
{
    // Remove the next line, split by space, and convert to numbers.
    var   arr   =   (   Arr   .   shift   (   )   )   .   split   (   " "   )   .   map   (   Number   )   ;

    // Create an item object and add it to the 'items' array.
    items   [   i   ]   =   {   v   :   arr   [   0   ]   ,   w   :   arr   [   1   ]   }   ;
}

// Call the knapsack function to compute the maximum value.
var   max   =   knapsack   (   )   ;

// Print the result to standard output.
console   .   log   (   max   )   ;
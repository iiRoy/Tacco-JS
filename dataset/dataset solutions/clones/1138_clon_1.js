/*
 * This JavaScript function, named 'knapsack', implements a dynamic programming
 * approach to solve the 0/1 Knapsack problem.
 *
 * It calculates the maximum value that can be obtained by selecting a subset
 * of items, given their values and weights, such that the total weight
 * does not exceed a specified capacity 'W'.
 *
 * The function relies on global variables 'N' (number of items), 'W' (knapsack capacity),
 * and 'items' (an array of item objects, each with 'v' for value and 'w' for weight).
 *
 * The core logic involves building a 2D array (C) where C[i][j] represents the
 * maximum value that can be obtained with the first 'i' items and a capacity 'j'.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 */
function knapsack ( )
{
    // Declare and initialize the 2D array 'C' which will store
    // the maximum values for subproblems.
    var   C  =  [ ] ;


    /*
     * Initialize the rows of the C table.
     * Each row 'i' corresponds to considering the first 'i' items.
     */
    for ( var  i  =  0 ;  i  <=  N ;  i ++ )
        C [ i ]  =  [ ] ; // Create an empty array for each row.


    // Initialize the first row (C[0]) to zeros.
    // This signifies that with 0 items, the value is 0 regardless of capacity.
    for ( var  i  =  0 ;  i  <=  W ;  i ++ )
        C [ 0 ] [ i ]  =  0 ;


    // Initialize the first column (C[i][0]) to zeros.
    // This signifies that with 0 capacity, the value is 0 regardless of items.
    for ( var  i  =  0 ;  i  <=  N ;  i ++ )
        C [ i ] [ 0 ]  =  0 ;

    /*
     * Fill the C table using dynamic programming.
     * 'i' iterates through items (from 1 to N).
     * 'j' iterates through capacities (from 1 to W).
     */
    for ( var  i  =  1 ;  i  <=  N ;  i ++ )
    {
        for ( var  j  =  1 ;  j  <=  W ;  j ++ )
        {
            // Check if the current item's weight is less than or equal to the current capacity 'j'.
            if (  items [ i ] . w  <=  j  )
            {
                // If the item can be included, we have two options to consider for the maximum value:
                // 1. Exclude the current item: C[i-1][j] (value from previous items with same capacity)
                // 2. Include the current item: items[i].v + C[i-1][j - items[i].w] (item's value + value from previous items with reduced capacity)
                // The third term (items[i].v + C[i][j-items[i].w]) is unusual for a standard 0/1 knapsack,
                // as it might imply either an error in the original problem's formulation or a specific
                // variant allowing multiple uses of an item or a different DP state transition.
                // Regardless, it must be preserved exactly as per Type I cloning rules.
                C [ i ] [ j ]  =  Math . max ( C [ i - 1 ] [ j ] ,  items [ i ] . v  +  C [ i - 1 ] [ j - items [ i ] . w ] ,  items [ i ] . v  +  C [ i ] [ j - items [ i ] . w ] ) ;
            }
            else
            {
                // If the current item's weight is greater than the current capacity,
                // the item cannot be included. So, the value is the same as
                // when considering 'i-1' items with the same capacity 'j'.
                C [ i ] [ j ]  =  C [ i - 1 ] [ j ] ;
            }
        }
    }

    // The maximum value for 'N' items and capacity 'W' is stored at C[N][W].
    return  C [ N ] [ W ] ;
}

// -------------------------------------------------------------------------------- //
// Global Scope Variables and Input Processing                                    //
// -------------------------------------------------------------------------------- //


/*
 * Read input from standard input.
 * The 'fs' module is used for file system operations, specifically reading a file.
 * In this context, it reads from '/dev/stdin', which is a common way to get
 * standard input in competitive programming environments on Linux-like systems.
 */
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// Trim any leading/trailing whitespace from the input and split it into an array
// of strings, where each string is a line from the input.
var   Arr   =   ( input . trim ( ) ) . split ( "\n" ) ;


/*
 * Process the first line of the input.
 * This line is expected to contain two space-separated numbers:
 * N (number of items) and W (knapsack capacity).
 * Arr.shift() removes the first element from 'Arr' and returns it.
 * split(" ") separates the string by spaces.
 * map(Number) converts each resulting string part into a number.
 */
var   NW   =   ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;


// Extract N and W from the processed first line.
var   N   =   NW [ 0 ] ; // Total number of items available.
var   W   =   NW [ 1 ] ; // Maximum weight capacity of the knapsack.


// Initialize an array to store item objects.
// 'null' is placed at index 0 to make item indexing 1-based,
// aligning with the problem's typical 1-based indexing for items.
var   items   =   [ null ] ;


// Loop through the remaining lines of input to populate the 'items' array.
// Each line represents an item with its value and weight.
for ( var  i  =  1 ;  i  <=  N ;  i ++ )
{
    // For each item, read its line, split by space, and convert to numbers.
    var   arr   =   ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;

    // Create an item object with value 'v' and weight 'w', then store it.
    items [ i ]  =  { v : arr [ 0 ] ,  w : arr [ 1 ] } ;
}


/*
 * Call the knapsack function to compute the maximum value.
 * The function uses the globally defined 'N', 'W', and 'items'.
 */
var   max   =   knapsack ( ) ;


// Output the calculated maximum value to the console.
console . log ( max ) ;
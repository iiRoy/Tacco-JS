/*
 * This script processes input from standard input to solve a dynamic programming problem.
 * It reads initial parameters, then a list of items, and calculates the minimum cost
 * to reach a certain target value H, considering the given items.
 * The final result is printed to the console.
 */

inp  =  require('fs') . readFileSync('/dev/stdin' ,  'utf8') . trim() . split('\n') ; // Read entire input, convert to string, remove leading/trailing whitespace, and split by newline.

// Parse the first line of input to get H and N.
l  =  inp . shift() . split(' ') ; // Extract the first line and split it by spaces.

H  =  l . shift()  *  1 ; // Get the first element (H) and convert it to a number.
N  =  l . shift()  *  1 ; // Get the second element (N) and convert it to a number.

k  =  [ ] ; // Initialize an empty array to store item data (cost and damage/effect).

// Loop N times to read the item data.
for ( i = 0 ; i < N ; i ++ )
{
    // For each item, read a line, split by space, and convert elements to numbers.
    k . push( inp . shift() . split(' ') . map( x  =>  x - 0 ) ) ;
}

dp  =  [ 0 ] ; // Initialize the DP array. dp[0] is 0, representing 0 cost for 0 damage.

// Main dynamic programming loop. Iterate through possible health values.
// H+1 is used to ensure all necessary values up to H are considered, and potentially beyond for calculations.
for ( h = 0 ; h <= H + 1 ; h ++ )
{
    // If the current health value 'h' is unreachable (cost is undefined), skip it.
    if ( dp[ h ]  ===  undefined )
    {
        continue ; // Move to the next health value.
    }

    // Iterate through all available items.
    for ( i = 0 ; i < N ; i ++ )
    {
        // Calculate the potential new health value after using item 'i'.
        let  nextH  =  h  +  k[ i ][ 0 ] ;
        // Calculate the potential new cost to reach 'nextH'.
        let  newCost  =  dp[ h ]  +  k[ i ][ 1 ] ;

        // Update dp[nextH] if it's currently undefined or if the new cost is lower.
        dp[ nextH ]  =  ( dp[ nextH ]  ===  undefined  ||  dp[ nextH ]  >  newCost )  ?  newCost  :  dp[ nextH ] ;
    }
}

// Find the minimum cost from H up to the end of the dp array.
// This handles cases where reaching exactly H might not be optimal,
// but exceeding H with a lower cost is acceptable.
min  =  dp[ dp . length - 1 ] ; // Initialize min with the cost of the last calculated state.

// Iterate backwards from the end of the dp array down to H.
for ( j = dp . length - 1 ; j >= H ; j -- )
{
    // If the current dp[j] is greater than or equal to the current minimum, or if dp[j] is undefined,
    // it means reaching j is not better than what we've already found.
    if ( dp[ j ]  >=  min  ||  dp[ j ]  ===  undefined )
    {
        dp[ j ]  =  min ; // Set dp[j] to the current minimum. This might not be strictly necessary for the final result, but maintains consistency within the array.
    }
    else
    {
        min  =  dp[ j ] ; // If dp[j] is lower than the current minimum, update min.
    }
}

// Output the final minimum cost to reach at least H.
console . log( dp[ H ] ) ;
// This script is designed to process a list of items, each with a cost and a time.
// It aims to find the minimum cost among items that can be completed within a given time limit.

// Read the entire standard input, decode it as UTF-8, and split it into an array of lines.
inp = require( 'fs' ) . readFileSync( '/dev/stdin' ,  'utf8' ) . split( '\n' ) ;

// Extract the first line, which contains the number of items (N) and the time limit (T).
// Then, split this line by space to get N and T as strings.
l   =   inp . shift() . split( ' ' ) ;

// Convert the first element of 'l' (N) to a number.
N = l[ 0 ]   *   1 ;

// Convert the second element of 'l' (T) to a number, representing the time limit.
T = l[ 1 ]   *   1 ;

// Initialize 'min' to a large value. This will store the minimum cost found so far.
// It's set to 1000 as per common competitive programming practice when costs are positive.
min = 1000  ;

// Initialize a flag 'b' to 0. This flag will be set to 1 if at least one valid item is found.
b   =   0   ;

// Loop through each of the N items provided in the input.
for  (  i = 0 ;  i < N ;  i++  )
{
    // For each item, split its line by space to get its cost (c) and time (t).
    l = inp[ i ] . split( ' ' ) ;

    // Convert the item's cost 'c' to a number.
    c = l[ 0 ]   *   1 ;

    // Convert the item's time 't' to a number.
    t = l[ 1 ]   *   1 ;

    // Check if the current item's time 't' is within the allowed time limit 'T'.
    if  (  T  >=  t  )
    {
        // If the item is within the time limit, check if its cost 'c' is less than
        // or equal to the current minimum cost found ('min').
        if  (  min  >=  c  )
        {
            // If it is, update 'min' with this new lower cost.
            min = c ;

            // Set the flag 'b' to 1, indicating that we have found at least one valid item.
            b = 1 ;
        }
    }
}

// After checking all items, print the result.
// If 'b' is 1 (meaning a valid item was found), print the minimum cost 'min'.
// Otherwise (if 'b' is 0, meaning no item was within the time limit), print 'TLE'.
console . log( b ? min : 'TLE' ) ;
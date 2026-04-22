var lines = [ ] ;
// This array will store all lines read from standard input.

var readline = require('readline') ;
// Import the 'readline' module to handle input/output.

// Create a readline interface configuration object.
var rl = readline . createInterface ( {
    input   :   process . stdin ,   // Set the input stream to standard input.
    output  :   process . stdout    // Set the output stream to standard output.
} ) ;


// Register an event listener for the 'line' event.
// This function is called whenever a new line of input is received.
rl . on ( 'line' ,   function ( x )
    {
        lines . push ( x ) ;    // Add the received line 'x' to the 'lines' array.
    }
) ;


// Register an event listener for the 'close' event.
// This function is executed when the input stream ends (e.g., EOF).
rl . on ( 'close' , function ( )
    {
        // First line of input contains N, A, and B space-separated.
        var tmp = lines . shift ( ) ;

        // Parse N, A, B from the first line.
        var N   =   tmp . split ( " " ) [ 0 ] ;   // N: Total number of items.
        var A   =   tmp . split ( " " ) [ 1 ] ;   // A: Minimum number of items to pick.
        var B   =   tmp . split ( " " ) [ 2 ] ;   // B: Maximum number of items to pick.

        var v   =   Array ( N ) ; // Initialize an array 'v' of size N.

        // The second line of input contains N space-separated numbers.
        tmp = lines . shift ( ) . split ( " " ) ;

        // Convert string numbers to actual numbers and populate array 'v'.
        for ( var i = 0 ; i < N ; i ++ )
            {
                v [ i ] =   Number ( tmp [ i ] ) ;
            }


        // Sort the array 'v' in descending order.
        v . sort ( function ( a , b )
            {
                return ( b - a ) ;  // Custom comparison for descending sort.
            }
        ) ;


        var average_max =   0 ; // Initialize variable to store the sum for average calculation.
        var C           =   { } ; // Initialize an object 'C' to count occurrences of each number.


        // Loop through the sorted array to calculate sum for average_max and count frequencies.
        for ( var i = 0 ; i < N ; i ++ )
            {
                // If the current index 'i' is less than 'A', add the value to average_max sum.
                if ( i < A )
                    {
                        average_max += v [ i ] ;
                    }

                // If the current number v[i] is not yet a key in 'C', initialize its count to 0.
                if ( C [ v [ i ] ] === undefined )
                    {
                        C [ v [ i ] ] = 0 ;
                    }

                C [ v [ i ] ] ++ ;  // Increment the count for the current number v[i].
            }

        // Calculate the maximum possible average by dividing the sum by 'A'.
        average_max /= A ;

        console . log ( average_max ) ; // Output the calculated maximum average.


        var counter = 0 ;   // Initialize a counter for items processed.
        var tmp     = 1 ;   // Initialize 'tmp' (not used in this specific path, but present in original).


        // Check if the A-th largest number is different from the (A+1)-th largest number.
        // This condition determines which combination logic to apply.
        if ( v [ 0 ] !== v [ A ] )
            {
                var comb = 1 ; // Initialize combination count for this branch.

                // Iterate through the sorted array.
                for ( var i = 0 ; i < N ; i ++ )
                    {
                        // If the count of the current number is 2 or more.
                        if ( C [ v [ i ] ] >= 2 )
                            {
                                // Determine 'j': number of items to pick from current group.
                                // It's either (A - counter) or C[v[i]], whichever is smaller.
                                C [ v [ i ] ] > ( A - counter ) ? j = A - counter : j = C [ v [ i ] ] ;

                                // Multiply 'comb' by the number of combinations.
                                comb *= combination ( C [ v [ i ] ] , j ) ;

                                // Update counter and skip already processed elements of the same value.
                                counter += C [ v [ i ] ] ;
                                i += C [ v [ i ] ] - 1 ;
                            }
                        else // If the count of the current number is less than 2 (i.e., 1).
                            {
                                // Update counter and skip the current element.
                                counter += C [ v [ i ] ] ;
                                i += C [ v [ i ] ] - 1 ;
                            }
                    }
            }
        else // This block is executed if v[0] is equal to v[A].
            {
                var comb = 0 ; // Initialize combination count for this branch.

                // Loop from 1 up to B to calculate combinations.
                for ( var j = 1 ; j <= B ; j ++ )
                    {
                        // Add combinations (50 choose j) to 'comb'.
                        // Note: The '50' here might be a placeholder or specific to a problem context.
                        comb += combination ( 50 , j ) ;
                    }
            }

        console . log ( comb ) ; // Output the final calculated combination count.
    }
) ;


// Function to calculate permutations (nPr).
function permutation ( n , r )
    {
        var res = 1 ; // Initialize result to 1.

        // Loop 'r' times to multiply 'n', 'n-1', ..., 'n-r+1'.
        for ( var i = 0 ; i < r ; i ++ )
            {
                res *= n - i ; // Multiply by (n - current_iteration).
            }

        return res ; // Return the calculated permutation.
    }


// Function to calculate combinations (nCr).
function combination ( n , r )
    {
        // Combination is permutation(n, r) divided by permutation(r, r) (which is r!).
        return permutation ( n , r ) / permutation ( r , r ) ;
    }
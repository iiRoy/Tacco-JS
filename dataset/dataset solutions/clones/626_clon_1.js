/* Read input from standard input */
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Split input into lines
var lines = input . split ( '\n' ) ;
/* Convert the first line to a number, effectively forcing numeric type */
var n = lines [ 0 ] - 0 ;
// Initialize an empty array
var a = [ ] ;
/* Declare loop counters */
var i , j , k ;


// Populate array 'a' with a repeated sequence for circular processing.
for ( i = 0 ; i < n ; i ++ )
{
        /* Store numeric value from input line */
        a [ i ] = lines [ i + 1 ] - 0 ;
        // Duplicate the element for circular array simulation
        a [ i + n ] = a [ i ] ;
        // Duplicate again to ensure enough elements for sliding window
        a [ i + n + n ] = a [ i ] ;
}

/* Defines a simple sum function for array reduction */
var sum = function ( p , n )
{
    return p + n ;
} ;

// Initialize maximum value found
var max = 0 ;
/* Initialize minimum value for comparison */
var min = 0 ;
// temp for current sum, arr for sub-array
var temp = 0 , arr ;

/* Main logic: Iterate through possible sub-array configurations */
for ( i = 1 ; i < n - 2 ; i ++ )
{
        for ( j = 0 ; j < n ; j ++ )
        {
                // Calculate sum of the first segment
                temp = a . slice ( j , j + i ) . reduce ( sum , 0 ) ;
                /* Get the remaining part of the array */
                arr = a . slice ( j + i , j + n ) ;
                // Iterate to find split point in the remaining array
                for ( k = 1 ; k < arr . length ; k ++ )
                {
                        /* Calculate the minimum sum of the two parts of 'arr' */
                        min = Math . min ( arr . slice ( 0 , k ) . reduce ( sum , 0 ) , arr . slice ( k , arr . length ) . reduce ( sum , 0 ) ) ;

                        // If current segment sum is less than or equal to min of other two parts, update max
                        if ( temp <= min )
                        {
                                max = Math . max ( max , temp ) ;
                        }
                }
        }
}

/* Output the final maximum value */
console . log ( max ) ;
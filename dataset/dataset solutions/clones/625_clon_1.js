// This script reads input from stdin, processes it, and prints a result.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Split the input into an array of lines.
var lines = input . split ( '\n' ) ;

// Parse the first line as an integer 'n'.
var n = lines [ 0 ] - 0 ;

// Initialize an array 'a'.
var a = [ ] ;

// Declare loop counters.
var i , j , k ;

// Populate array 'a' with a repeated pattern.
for (  i = 0 ;   i < n ;   i ++  )
{
    a [ i ] = lines [ i + 1 ] - 0 ; // Convert line to number.
    a [ i + n ] = a [ i ] ;         // Duplicate the value.
    a [ i + n + n ] = a [ i ] ;     // Duplicate it again.
}


// Define a simple summation function.
var sum = function ( p , n )
{
    return p + n ;
} ;


// Function to calculate the sum of elements within a specified range of an array.
function arrSum ( arr , start , end )
{
    var n = 0 , i ; // 'n' here is a local variable, not related to the global 'n'.

    for ( i = start ;   i < end ;   i ++  )
    {
        n += arr [ i ] ; // Add current element to sum.
    }

    return n ; // Return the calculated sum.
}


// Initialize variables for tracking max, min, and temporary sums.
var max = 0 ;
var min = 0 ;
var temp = 0 , arr ; // 'arr' will hold sliced portions of 'a'.


// Main nested loop for processing and finding the maximum value.
// The outer loop iterates from 1 up to n-3.
for ( i = 1 ;   i < n - 2 ;   i ++  )
{
    // The middle loop iterates from 0 up to n-1.
    for ( j = 0 ;   j < n ;   j ++  )
    {
        // Calculate a temporary sum for a segment of array 'a'.
        temp = arrSum ( a , j , j + i ) ;

        // Extract a slice of array 'a'.
        arr = a . slice ( j + i , j + n ) ;

        // The inner loop iterates through the sliced array.
        for ( k = 1 ;   k < arr . length ;   k ++  )
        {
            // Calculate 'min' based on two sub-sums from 'a'.
            min = Math . min ( arrSum ( a , i + j , i + j + k ) , arrSum ( a , i + j + k , j + n ) ) ;

            // Check a condition and update 'max' if necessary.
            if ( arr <= min )
            {
                max = Math . max ( max , temp ) ;
            }
        }
    }
}


// Output the final maximum value.
console . log ( max ) ;
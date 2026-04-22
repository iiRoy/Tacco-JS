/* This script calculates two types of DP values based on derived sequences 'a' and 'b'.
 * It then processes input numbers to output the pre-calculated DP values.
 */

// Initialize array 'a' with the first element.
var a = [1];

// Populate array 'a' based on a recurrence relation.
// This loop calculates values for 'a' up to 100,000 elements.
for ( var i = 1 ; i < 100000 ; i ++ )
{
    a[i] = a[i-1] + i + 1 ;
}


// Initialize array 'b' with its first element.
var b = [1];

// Initialize loop counter for 'b'.
var i = 1 ;

// This loop populates array 'b' until a certain condition is met.
// The condition checks if the current element exceeds 100,000.
while ( true )
{
    b[i] = b[i-1] + a[i]; // Calculate the next element of 'b'.

    // Check if the current element of 'b' exceeds the threshold.
    if ( b[i] > 100000 )
    {
        break ; // Exit the loop if the threshold is exceeded.
    }

    i ++ ; // Increment the counter for the next iteration.
}


// Declare and initialize two dynamic programming arrays, dpA and dpB.
var dpA = [];
var dpB = [];

// Initialize all elements of dpA to Infinity.
for ( var i = 0 ; i < 100000 ; i ++ )
{
    dpA[i] = Infinity ;
}

// Initialize all elements of dpB to Infinity.
for ( var i = 0 ; i < 100000 ; i ++ )
{
    dpB[i] = Infinity ;
}

// Set the base cases for the DP arrays.
dpA[0] = 0 ;
dpB[0] = 0 ;

// Main dynamic programming calculation loop.
// It iterates through all possible 'i' values up to 100,000.
for ( var i = 0 ; i < 100000 ; i ++ )
{
    // Inner loop iterates through the elements of array 'b'.
    for ( var j = 0 ; j < b . length ; j ++ )
    {
        // Condition for updating dpA: if 'i - b[j]' is a valid index.
        if ( i - b[j] >= 0 )
        {
            // Update dpA[i] with the minimum of its current value
            // and (dpA[i - b[j]] + 1).
            dpA[i] = Math . min ( dpA[i - b[j]] + 1 , dpA[i] ) ;
        }

        // Condition for updating dpB: if 'b[j]' is odd AND 'i - b[j]' is a valid index.
        if ( b[j] % 2 == 1 && i - b[j] >= 0 )
        {
            // Update dpB[i] with the minimum of its current value
            // and (dpB[i - b[j]] + 1).
            dpB[i] = Math . min ( dpB[i - b[j]] + 1 , dpB[i] ) ;
        }
    }
}


// Read input from standard input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input: trim whitespace, split by newlines, and convert to numbers.
var arr = input . trim ( ) . split ( "\n" ) . map ( Number ) ;


// Process each number from the input array.
while ( true )
{
    // Get the next number from the array.
    var n = arr . shift ( ) ;

    // If the number is 0, it signifies the end of input.
    if ( n == 0 )
    {
        break ; // Exit the processing loop.
    }

    // Print the pre-calculated DP values for 'n'.
    console . log ( dpA[n] + " " + dpB[n] ) ;
}
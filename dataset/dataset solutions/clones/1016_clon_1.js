/*
 * This file contains an implementation of the Shell Sort algorithm,
 * which uses an increment sequence based on powers of 2 minus 1.
 * It also includes a helper function for insertion sort.
 */

// Global counter for the number of swaps/comparisons made during sorting.
var cnt ;

/**
 * Performs an insertion sort on a sub-array defined by a gap 'g'.
 * This is a key component of the Shell Sort algorithm.
 *
 * @param {Array<number>} A - The array to be sorted.
 * @param {number} n     - The total number of elements in array A.
 * @param {number} g     - The gap (increment) for this pass of insertion sort.
 */
function insertionSort ( A ,  n ,  g )
{
    // Iterate through the array starting from the gap 'g'.
    for ( var  i  =  g ;  i  <  n ;  i ++ )
    {
        // Store the current element to be inserted.
        var  v  =  A [ i ] ;

        // Initialize 'j' to the position before the current element,
        // offset by the gap 'g'.
        var  j  =  i  -  g ;

        // Shift elements that are greater than 'v' to the right,
        // creating a space for 'v'.
        while ( ( j  >= 0 )  &&  ( A [ j ]  >  v ) )
        {
            A [ j  +  g ]  =  A [ j ] ;  // Move element A[j] to A[j+g].
            j  =  j  -  g ;              // Move to the next element to the left.
            cnt ++ ;                     // Increment the global counter.
        }

        // Place 'v' in its correct sorted position within the sub-array.
        A [ j  +  g ]  =  v ;
    }
}


/**
 * Implements the Shell Sort algorithm using a specific gap sequence.
 * The gap sequence used here is based on (2^k - 1), reversed.
 *
 * @param {Array<number>} A - The array of numbers to be sorted.
 * @param {number} n     - The number of elements in the array.
 */
function shellSort ( A ,  n )
{
    // Reset the global counter before starting the sort.
    cnt  =  0 ;

    // Generate the gap sequence G.
    // The sequence consists of numbers (2^k - 1) up to n.
    var  G  =  [ ] ;
    for ( var  i  =  1 ;  ( Math . pow ( 2 ,  i )  -  1 )  <=  n ;  i ++ )
    {
        G . push ( Math . pow ( 2 ,  i )  -  1 ) ;
    }

    // Reverse the gap sequence to apply larger gaps first.
    G . reverse ( ) ;

    // Get the number of gaps in the sequence.
    var  m  =  G . length ;

    // Apply insertion sort for each gap in the sequence.
    for ( var  i  =  0 ;  i  <  m ;  i ++ )
    {
        insertionSort ( A ,  n ,  G [ i ] ) ;
    }

    // Output the number of gaps used.
    console . log ( m ) ;
    // Output the gap sequence, space-separated.
    console . log ( G . join ( ' ' ) ) ;
    // Output the total count of operations (swaps/comparisons).
    console . log ( cnt ) ;

    // Output the sorted array elements, each on a new line.
    for ( var  i  =  0 ;  i  <  n ;  i ++ )
    {
        console . log ( A [ i ] ) ;
    }
}


// --- Main execution block ---

// Read input from standard input.
var  input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

// Split the input string into an array of lines.
var  lines  =  input . split ( '\n' ) ;

// The first line contains the number of elements 'n'.
// Use shift() to remove it from 'lines' and get its value.
var  n  =  lines . shift ( ) ;

// Convert all remaining lines (which are numbers) from strings to actual numbers.
// The '- 0' trick is a concise way to perform type conversion to number.
lines  =  lines . map ( function ( i )  { return  i  -  0 ; } ) ;

// Call the shellSort function with the array of numbers and its size.
shellSort ( lines ,  n ) ;
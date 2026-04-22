/* This JavaScript file reads input from /dev/stdin,
   processes it using two different sorting algorithms (Bubble Sort and Selection Sort logic
   based on the second character of elements), and then
   prints the results and stability comparison. */


var    input   = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
// Read the entire input content from standard input file system path.


var   lines   =   input . split ( '\n' ) ; // Split the input string into an array of lines.
var n = lines[0] ; // The first line contains the number of elements 'n'.


// --- First sorting algorithm: Bubble Sort (or similar element swapping logic) ---
var   A1   =   lines [ 1 ] . split ( ' ' ) ; // Array A1 takes elements from the second line of input.

// Outer loop for the bubble sort like algorithm
for ( var i = 0 ; i < n ; i ++ )
{
    // Inner loop for comparisons and swaps
	for ( var j = n - 1 ; j > i ; j -- )
    {
        // Compare elements based on their second character
		if ( A1 [ j ] . split ( '' ) [ 1 ] < A1 [ j - 1 ] . split ( '' ) [ 1 ] )
        {
            // Perform a swap if the condition is met
			var tmp = A1 [ j ] ;
			A1 [ j ] = A1 [ j - 1 ] ;
			A1 [ j - 1 ] = tmp ; // Assign the temporary variable back
		}
	}
}


// Output the sorted array A1
console . log ( A1 . join ( ' ' ) ) ;

// This algorithm (Bubble Sort) is generally stable for identical keys,
// and the problem implies a specific stability check later.
console . log ( 'Stable' ) ;


// --- Second sorting algorithm: Selection Sort (or similar element finding logic) ---
var   A2   =   lines [ 1 ] . split ( ' ' ) ; // Array A2 also takes elements from the second line for comparison.

// Outer loop for selection sort
for ( var i = 0 ; i < n ; i ++ )
{
	var min = i ; // Assume the current element is the minimum
	for ( var j = i ; j < n ; j ++ )
    {
        // Find the index of the minimum element in the unsorted part
		if ( A2 [ j ] . split ( '' ) [ 1 ] < A2 [ min ] . split ( '' ) [ 1 ] )
        {
			min = j ; // Update minimum index if a smaller element is found
        }
	}

    // Check if a swap is necessary
	if ( min == i )
    {
		continue ; // If the minimum is already at the correct position, skip swap
    }

    // Perform the swap
	var tmp = A2 [ i ] ; // Store current element in a temporary variable
	A2 [ i ] = A2 [ min ] ; // Place the minimum element at the current position
	A2 [ min ] = tmp ; // Put the original current element at the minimum's old position
}

// Output the sorted array A2
console . log ( A2 . join ( ' ' ) ) ;

// Compare the results of A1 and A2 to determine stability.
// If the order of equal elements is preserved, it's stable.
console . log ( A1 . join ( ' ' ) == A2 . join ( ' ' ) ? 'Stable' : 'Not stable' ) ;

/* End of program */
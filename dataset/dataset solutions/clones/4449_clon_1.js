// This is a Type I clone example.
// The original code processes input to fill a grid in a snake-like pattern.

inp = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' )

/*
 * Reads the entire standard input,
 * trims it, and splits into an array of lines.
 */

l = inp . shift ( ) . split ( ' ' )
// The first line contains H, W, and N.

H = l . shift ( ) * 1 // Height of the grid
W = l . shift ( ) * 1 // Width of the grid

N = inp . shift ( ) * 1 // Number of elements to process

ans = [ ] // Initialize the answer grid (2D array)

// Loop to create the rows of the 2D array.
for ( i = 0 ; i < H ; i ++ )
{
	ans [ i ] = new Array ( W ) // Each row is an array of width W.
}


h = 0 // Current row index, starting from the top.
w = 0 // Current column index, starting from the left.

/*
 * Reads the next line of input, which contains
 * N numbers (counts) separated by spaces.
 */
a = inp . shift ( ) . split ( ' ' )

m = 'R' // Initial movement direction: 'R' for Right, 'L' for Left.

// Main loop: Iterate N times, processing each count from the 'a' array.
for ( i = 0 ; i < N ; i ++ )
{
	n = a [ i ] * 1 // Convert the current count string to a number.

	// Inner loop: Fill 'n' cells with the current value (i + 1).
	for ( j = 0 ; j < n ; j ++ )
	{
		// Only assign a value if the cell is currently undefined.
		// This ensures cells are filled only once.
		if ( ans [ h ] [ w ] === undefined )
		{
			ans [ h ] [ w ] = i + 1 // Assign the value (current iteration + 1).
		}


		// Movement logic for snake-like pattern.
		if ( w == W - 1 && m == 'R' )
		{
			// If at the rightmost column and moving right,
			// move down to the next row and change direction to Left.
			h ++
			m = 'L'
		}
		else if ( w === 0 && m == 'L' )
		{
			// If at the leftmost column and moving left,
			// move down to the next row and change direction to Right.
			h ++
			m = 'R'
		}
		else if ( m == 'R' )
		{
			// If currently moving Right, increment the column index.
			w ++
		}
		else if ( m == 'L' )
		{
			// If currently moving Left, decrement the column index.
			w --
		}
	}
}

// Output the final grid.
// Each row's elements are joined by a space, and rows are joined by a newline.
console . log ( ans . map ( a => a . join ( ' ' ) ) . join ( '\n' ) )
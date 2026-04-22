/*
 * This JavaScript code implements a magic square-like generation algorithm.
 * It reads numerical input representing square sizes and generates corresponding
 * squares, printing them to the console.
 */
function bomb(y,x) // Recursive function to fill the square based on current position and numbers.
{
    // Check if the current number 'N' has reached the maximum value for this square.
    if ( N == max )
    {
        return ; /* If the square is completely filled, exit the function. */
    }

    // Boundary condition: If 'x' goes out of bounds to the left, wrap it to the rightmost column.
    if ( x < 0 )
    {
        x = n - 1 ;
    }

    // Boundary condition: If 'y' goes out of bounds to the top, wrap it to the bottommost row.
    if ( y < 0 )
    {
        y = n - 1 ;
    }

    // Boundary condition: If 'x' goes out of bounds to the right, wrap it to the leftmost column.
    if ( x >= n )
    {
        x = 0 ;
    }

    // Boundary condition: If 'y' goes out of bounds to the bottom, wrap it to the topmost row.
    if ( y >= n )
    {
        y = 0 ;
    }

    // Check if the current cell (y,x) in the square is already occupied (not -1).
    if ( yx[y][x] != -1 )
    {
        // If the cell is occupied, try the next position: one row down, one column left.
        bomb( y + 1 , x - 1 ) ;
    }
    else
    {
        // If the cell is empty, place the current number 'N' into it.
        yx[y][x] = N ;
        N ++ ; // Increment 'N' for the next placement.
        // Then, try the next position: one row down, one column right.
        bomb( y + 1 , x + 1 ) ;
    }
}


// Read input from standard input, using Node.js 'fs' module.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input string:
// 1. Remove leading/trailing whitespace.
// 2. Split the string into an array of strings, using newline as delimiter.
// 3. Map each string element to its numerical representation.
var Arr = ( input . trim ( ) ) . split ( "\n" ) . map ( Number ) ;


// Iterate through each number in the processed input array 'Arr'.
for ( var i = 0 ; i < Arr . length ; i ++ )
{
    var n = Arr[i] ; // 'n' represents the size of the current square (n x n).

    // Calculate the maximum number that will be placed in the square (n*n + 1 for boundary check).
    var max = n * n + 1 ;

    // If 'n' is 0, it signals the end of the input sequence, so break the loop.
    if ( n == 0 )
    {
        break ;
    }

    // Initialize an empty 2D array (matrix) to represent the magic square.
    var yx = [ ] ;

    // Populate the 'yx' array with initial values of -1, signifying empty cells.
    for ( var j = 0 ; j < n ; j ++ )
    {
        yx[j] = [ ] ; // Initialize each row as an empty array.
        for ( var k = 0 ; k < n ; k ++ )
        {
            yx[j][k] = -1 ; // Set each cell to -1.
        }
    }

    // Determine the starting 'x' coordinate for placing the first number.
    // It's the middle column.
    var x = Math . floor ( n / 2 ) ;

    // Determine the starting 'y' coordinate. It's one row below the middle column's row.
    var y = x + 1 ;

    // Place the first number, 1, into the calculated starting position.
    yx[y][x] = 1 ;

    // Initialize 'N', the next number to be placed in the square, starting from 2.
    var N = 2 ;

    // Call the recursive 'bomb' function to fill the rest of the square.
    // It starts from the cell diagonally down-right from where '1' was placed.
    bomb( y + 1 , x + 1 ) ;

    // Output the completed square to the console.
    // Rows are joined by newlines, and commas (from default array.join behavior) are replaced by spaces.
    console . log ( yx . join ( "\n" ) . replace ( /\,/g , " " ) ) ;
}
var  input  =  require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ; /*
 *  This JavaScript program processes a 2D grid of numbers.
 *  It reads data from standard input, calculates 2D prefix sums,
 *  and then finds the submatrix with the largest sum.
 *  The algorithm used for finding the maximum submatrix sum
 *  is based on Kadane's algorithm extension for 2D arrays,
 *  leveraging prefix sum optimization.
 */

//  The input string is first trimmed and then split into an array of lines.
var arr = input . trim ( ) . split ( "\n" ) ;

//  The first line of input specifies the dimension 'n' of the square matrix.
//  The '-0' ensures explicit conversion to a number.
var n = arr . shift ( ) - 0 ;

//  'yx' will store the actual 2D grid data, potentially with an added
//  row/column of zeros for easier prefix sum calculations (1-based indexing).
var yx = [ ] ;

//  'zero' is a temporary array that will be used to create a row of zeros.
var zero = [ ] ;

//  Populate the 'zero' array with 'n + 1' zero elements.
//  This accounts for the 0-th row/column in 1-based indexing.
for ( var i = 0 ; i < n + 1 ; i ++ ) {
    zero . push ( 0 ) ;
}

//  Add the 'zero' row as the first row of 'yx'.
//  This effectively makes the matrix 1-indexed for convenience.
yx . push ( zero ) ;

//  Loop through the remaining input lines to populate the 'yx' array.
//  Each line represents a row of the matrix.
for ( var i = 0 ; i < n ; i ++ ) {
    //  Prepend a '0 ' to each row string before splitting and mapping to numbers.
    //  This creates a conceptual 0-th column for 1-based indexing.
    yx . push ( ( "0 " + arr . shift ( ) ) . split ( " " ) . map ( Number ) ) ;
}

//  Adjust 'n' to reflect the new dimensions, including the added
//  zero row/column, making it suitable for 1-based indexing throughout.
n = n + 1 ;

//  'sum' will be a 2D array to store the prefix sums.
//  sum[i][j] will represent the sum of all elements in the rectangle
//  from (1,1) to (i,j) in the original 'yx' matrix (after padding).
var sum = [ ] ;

//  Initialize the first column of the 'sum' array.
//  For 1-based indexing, sum[i][0] should be 0, and sum[0][j] should be 0.
//  However, the current initialization strategy effectively uses yx[i][0] as sum[i][0].
//  The 'yx' array already has a row of zeros at index 0.
//  And each subsequent row has a '0' prepended.
//  So yx[i][0] for i > 0 is actually the added '0'.
//  Thus, sum[i][0] will correctly be 0 for all i.
for ( var i = 0 ; i < n ; i ++ )
{
    sum [ i ] = [ ] ;
    sum [ i ] [ 0 ] = yx [ i ] [ 0 ] ;
}

//  Calculate the row-wise prefix sums.
//  sum[i][j] = sum of elements from yx[i][0] to yx[i][j].
//  Since yx[i][0] is always 0 (due to padding), this correctly computes
//  the sum of elements from the 'actual' start of the row up to j.
for ( var i = 0 ; i < n ; i ++ ) {
    for ( var j = 1 ; j < n ; j ++ ) {
        sum [ i ] [ j ] = sum [ i ] [ j - 1 ] + yx [ i ] [ j ] ;
    }
}

//  Calculate the column-wise prefix sums to complete the 2D prefix sum array.
//  After this step, sum[i][j] will contain the sum of all elements in the
//  rectangle from (0,0) to (i,j) of the modified 'yx' array.
for ( var i = 1 ; i < n ; i ++ ) {
    for ( var j = 0 ; j < n ; j ++ ) {
        sum [ i ] [ j ] = sum [ i - 1 ] [ j ] + sum [ i ] [ j ] ;
    }
}

//  Initialize 'max' to negative infinity to ensure any valid sum is greater.
var max = - Infinity ;

//  These four nested loops iterate through all possible submatrices.
//  (i, j) represents the top-left corner of the submatrix.
//  (y, x) represents the bottom-right corner of the submatrix.
for ( var i = 0 ; i < n ; i ++ ) { //  Row index for the top edge of the submatrix.
    for ( var j = 0 ; j < n ; j ++ ) { //  Column index for the left edge of the submatrix.
        for ( var y = i ; y < n ; y ++ ) { //  Row index for the bottom edge of the submatrix.
            for ( var x = j ; x < n ; x ++ ) { //  Column index for the right edge of the submatrix.
                //  Calculate the sum of the current submatrix using the 2D prefix sum array.
                //  The formula is: Sum(i,j,y,x) = sum[y][x] - sum[i][x] - sum[y][j] + sum[i][j].
                //  This effectively subtracts the areas above and to the left of the submatrix,
                //  and adds back the top-left corner which was subtracted twice.
                max = Math . max ( max , sum [ y ] [ x ] - sum [ i ] [ x ] - sum [ y ] [ j ] + sum [ i ] [ j ] ) ;
            }
        }
    }
}

//  Print the maximum submatrix sum found to standard output.
console . log ( max ) ;

//  End of the program.
//  Thank you for reviewing!
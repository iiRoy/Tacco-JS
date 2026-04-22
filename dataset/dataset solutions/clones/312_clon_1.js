/*
 * This JavaScript code calculates the maximum sum of a sub-rectangle
 * within a given 2D matrix. It uses a 2D prefix sum (or integral image)
 * technique to efficiently compute sums of sub-rectangles.
 *
 * Author: Expert Code Cloner
 * Date: 2023-10-27
 */

//  The 'fs' module is used to interact with the file system.
//  'readFileSync' reads the entire content of a file synchronously.
//  '/dev/stdin' is a common path for standard input in Unix-like systems.
//  'utf8' specifies the encoding for the input.
var      input    =require (   'fs'   ) .   readFileSync  (   '/dev/stdin' ,  'utf8'   ) ;

//  Process the raw input string.
//  'trim()' removes leading/trailing whitespace.
//  'split("\n")' divides the string into an array of lines.
var   arr   =   input .   trim (   ) .   split (   "\n"   ) ;


//  The first line of input is expected to be 'n', the size of the square matrix.
//  'shift()' removes the first element from 'arr' and returns it.
//  '-0' is a trick to convert the string to a number.
var n    =   arr .   shift (   )   -   0   ;

//  Initialize a 2D array 'yx' which will store the matrix data.
var   yx   =   [   ]   ;

//  Initialize a temporary array 'zero' filled with zeros.
//  This will be used for padding the 'yx' matrix.
var   zero   =   [   ]   ;

//  Populate the 'zero' array with n+1 zeros.
for (   var   i   =   0   ;   i   <   n   +   1   ;   i ++   )
{
    zero .   push (   0   )   ;
}

//  Add the 'zero' array as the first row of 'yx'.
//  This padding simplifies boundary conditions in prefix sum calculations.
yx .   push (   zero   )   ;

//  Read the remaining 'n' lines of input to populate the 'yx' matrix.
//  Each line represents a row of the matrix.
//  "0 " is prepended to each line to add a leading zero,
//  which acts as padding for column calculations.
//  'split(" ")' divides the string by spaces.
//  'map(Number)' converts each string element to a number.
for (   var   i   =   0   ;   i   <   n   ;   i ++   )
{
    yx .   push (   (   "0   "   +   arr .   shift (   )   ) .   split (   "   "   ) .   map (   Number   )   )   ;
}

//  Increment 'n' to account for the added padding row/column.
//  Now 'n' represents the dimensions of the padded matrix (original_n + 1).
n   =   n   +   1   ;

//  Initialize the 'sum' 2D array, which will store the prefix sums.
var   sum   =   [   ]   ;

//  First pass: Initialize the first column of the 'sum' array.
//  sum[i][0] will simply be yx[i][0] due to the column padding.
for (   var   i   =   0   ;   i   <   n   ;   i ++   )
{
    sum [   i   ]   =   [   ]   ; // Create an empty row for sum[i]
    sum [   i   ] [   0   ]   =   yx [   i   ] [   0   ]   ;
}

//  Second pass: Calculate prefix sums for each row.
//  sum[i][j] stores the sum of elements from yx[i][0] to yx[i][j].
for (   var   i   =   0   ;   i   <   n   ;   i ++   )
{
    for (   var   j   =   1   ;   j   <   n   ;   j ++   )
    {
        sum [   i   ] [   j   ]   =   sum [   i   ] [   j   -   1   ]   +   yx [   i   ] [   j   ]   ;
    }
}

//  Third pass: Calculate prefix sums for each column.
//  sum[i][j] now stores the sum of all elements in the rectangle
//  from (0,0) to (i,j) in the original (padded) 'yx' matrix.
for (   var   i   =   1   ;   i   <   n   ;   i ++   )
{
    for (   var   j   =   0   ;   j   <   n   ;   j ++   )
    {
        sum [   i   ] [   j   ]   =   sum [   i   -   1   ] [   j   ]   +   sum [   i   ] [   j   ]   ;
    }
}

//  Initialize 'max' to negative infinity to ensure any valid sum will be greater.
var   max   =   -   Infinity   ;

//  Iterate through all possible top-left (i,j) and bottom-right (y,x) corners
//  of sub-rectangles within the original (unpadded) matrix.
for (   var   i   =   0   ;   i   <   n   ;   i ++   )
{
    for (   var   j   =   0   ;   j   <   n   ;   j ++   )
    {
        for (   var   y   =   i   +   1   ;   y   <   n   ;   y ++   )
        {
            for (   var   x   =   j   +   1   ;   x   <   n   ;   x ++   )
            {
                //  Calculate the sum of the sub-rectangle using the prefix sum technique.
                //  S = sum[bottom][right] - sum[top-1][right] - sum[bottom][left-1] + sum[top-1][left-1]
                //  Here, (i,j) is top-left of *padded* matrix, so (i+1, j+1) is top-left of *actual* data.
                //  The `sum` array already has the padding incorporated, so `sum[y][x]` is for bottom-right
                //  and `sum[i][x]` for top-minus-one right, etc.
                var   S   =   sum [   y   ] [   x   ]   -   sum [   i   ] [   x   ]   -   sum [   y   ] [   j   ]   +   sum [   i   ] [   j   ]   ;

                //  Update 'max' if the current sub-rectangle sum 'S' is greater.
                if (   max   <   S   )
                {
                    max   =   S   ;
                }
            }
        }
    }
}

//  Output the final maximum sub-rectangle sum to the console.
console .   log (   max   )   ;
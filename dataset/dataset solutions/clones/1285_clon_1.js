/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain unchanged.
 * Only whitespace and comments have been modified extensively.
 * The functional behavior and logic are exactly identical to the original.
 */

function   Main   (   input   )
{


    //  The primary input string is first split into lines.
    //  The very first line is assigned to 'nm', and all subsequent lines
    //  are collected into an array named 'others' using the rest parameter syntax.
    let   [   nm   ,   ...others   ]   =   input   .   split   (   '\n'   )   ;


    //  The 'nm' string, which is expected to contain two space-separated numbers (N and M),
    //  is then split by the space character to separate these two values.
    nm   =   nm   .   split   (   ' '   )   ;


    //  The first element of the 'nm' array (which is a string) is converted
    //  to a numerical type and assigned to the variable 'n'. This typically represents
    //  the number of rows for the first part of the matrix.
    let   n   =   Number   (   nm   [   0   ]   )   ;


    //  Similarly, the second element of the 'nm' array is converted to a number
    //  and assigned to the variable 'm'. This usually represents the number of columns
    //  for the first part of the matrix, or the size of the second vector/matrix.
    let   m   =   Number   (   nm   [   1   ]   )   ;



    //  An empty array named 'arryA' is declared and initialized.
    //  This array will serve as a container for all the input numerical data,
    //  structured as a collection of arrays (a 2D matrix-like structure).
    let   arryA   =   [   ]   ;


    //  This loop is responsible for pre-populating 'arryA' with empty sub-arrays.
    //  It iterates 'n + m' times, ensuring that 'arryA' has enough slots
    //  to accommodate all incoming 'n' rows and 'm' rows from the 'others' input.
    for   (   let   i   =   0   ;   i   <   n   +   m   ;   i   ++   )
    {

        arryA   .   push   (   [   ]   )   ;   //  Each iteration adds an empty array as an element to 'arryA'.

    }


    //  Now, the actual numerical data from the 'others' array is parsed and stored into 'arryA'.
    //  Each string in 'others' (representing a line of numbers) is split by space,
    //  and each resulting string is mapped to its numerical equivalent.
    for   (   let   i   =   0   ;   i   <   n   +   m   ;   i   ++   )
    {

        arryA   [   i   ]   =   others   [   i   ]   .   split   (   ' '   )   .   map   (   Number   )   ;

    }


    //  This outer loop initiates the main calculation process.
    //  It iterates 'n' times, corresponding to each of the first 'n' rows
    //  that are part of the primary matrix for computation.
    for   (   let   i   =   0   ;   i   <   n   ;   i   ++   )
    {


        //  A 'result' variable is initialized to zero for each iteration of the outer loop.
        //  This variable will accumulate the sum of products for the current row calculation.
        let   result   =   0   ;


        //  The inner loop performs the element-wise multiplication and summation.
        //  It iterates 'm' times, corresponding to the 'm' elements in each row
        //  of the first matrix and the 'm' elements in the second (column) vector.
        for   (   let   j   =   0   ;   j   <   m   ;   j   ++   )
        {

            //  The core calculation: multiply an element from the 'i'-th row of the first matrix
            //  (arryA[i][j]) by an element from the 'j'-th row of the second "matrix" (arryA[n + j][0]).
            //  The product is then added to the 'result'. This mimics a matrix-vector multiplication
            //  where the second matrix is effectively a column vector.
            result   +=   arryA   [   i   ]   [   j   ]   *   arryA   [   n   +   j   ]   [   0   ]   ;

        }


        //  After the inner loop completes for a given 'i' (row), the accumulated 'result'
        //  for that row's calculation is printed to the console.
        console   .   log   (   result   )   ;

    }

}


//  This line of code is responsible for invoking the 'Main' function.
//  It reads all the data from standard input (typically '/dev/stdin' on Unix-like systems)
//  as a UTF-8 encoded string. The 'require("fs")' statement loads the Node.js file system module,
//  and 'readFileSync' synchronously reads the file content. The entire content is then
//  passed as the 'input' argument to the 'Main' function for processing.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;
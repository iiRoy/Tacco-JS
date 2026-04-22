/*
 * This file contains the main logic for processing matrix operations
 * and calculating a specific mathematical result based on matrix rank.
 *
 * It adheres to strict mode for better error handling and performance.
 */
"use strict" ;

/*
 * The primary function that orchestrates the entire process.
 * It takes raw input, parses it, performs matrix operations,
 * and then prints the final calculated answer.
 * @param {string} input - The raw string input from stdin.
 */
var Main = function ( input )
{
    // Process the input string: trim whitespace, split by any whitespace,
    // and convert each part to a number.
    input = input . trim ( ) . split ( / \s+ / ) . map ( x => x - 0 ) ;

    // Extract N (number of rows) and M (number of columns) from the input array.
    var N = input . shift ( ) ;
    var M = input . shift ( ) ;

    // Initialize a counter for the rank of the matrix.
    var rankCounter = 0 ;

    // Create a new Matrix object using the remaining input elements.
    // The 'input' array now contains the concatenated elements of the matrix.
    var A = new Matrix ( N , M , input ) ;

    // Main loop for Gaussian elimination-like process to determine rank.
    // It continues as long as there are rows in the 'low' part of the matrix.
    while ( A . low . length > 0 )
    {
        // Initialize an index to find the first row with a '1' in the current column (effectively column 0 after swaps).
        let i1 = 0 ;

        // Search for the first row where the leading element is 1.
        // This is part of finding a pivot element.
        for ( let i = 0 ; i < A . low . length ; i ++ )
        {
            if ( A . low [ i ] [ 0 ] === 1 )
            {
                break ; // Found a pivot row.
            }
            i1 ++ ;
        }

        // Check if no '1' was found in the current column (column 0).
        if ( i1 === A . low . length )
        {
            // If no '1' is found, it means this column is all zeros.
            // Swap this column with the last column and then delete the last column.
            // This effectively removes the current zero-column from consideration.
            A . swapColumn ( 0 , A . low [ 0 ] . length - 1 ) ;
            A . deleteColumn ( ) ;
        }
        else
        {
            // A '1' was found, indicating a pivot. Increment the rank counter.
            rankCounter += 1 ;

            // Process other rows to eliminate '1's below the current pivot.
            // This loop continues until all '1's below the pivot in the current column are eliminated.
            while ( true )
            {
                // Initialize an index to find the next row with a '1' below the current pivot.
                let i2 = i1 + 1 ;

                // Search for the next row below i1 that has a '1' in the current column.
                for ( let i = i1 + 1 ; i < A . low . length ; i ++ )
                {
                    if ( A . low [ i ] [ 0 ] === 1 )
                    {
                        break ; // Found another row to process.
                    }
                    i2 ++ ;
                }

                // If no more '1's are found below the pivot in this column, break the inner loop.
                if ( i2 === A . low . length )
                {
                    break ;
                }

                // Perform XOR operation between the pivot row (i1) and the target row (i2).
                // This effectively "clears" the leading '1' in row i2.
                A . low [ i2 ] = XOR ( A . low [ i1 ] , A . low [ i2 ] ) ;
            }

            // After processing the current pivot column, move the pivot row to the end
            // and then delete it, effectively reducing the matrix.
            A . swapLow ( i1 , A . low . length - 1 ) ;
            A . deleteLow ( ) ;
        }
    }

    // Assign the final calculated rank to a variable 'r'.
    var r = rankCounter ;

    // Define a large prime modulus for calculations.
    var K = 998244353 ;

    // Initialize term1 and term2 for the final calculation.
    var term1 = 1 ;
    var term2 = 1 ;

    // Calculate term1: 2^(M+N-1) mod K.
    // This loop performs modular exponentiation by repeatedly doubling and taking modulo.
    for ( let i = 1 ; i <= M + N - 1 ; i ++ )
    {
        term1 += term1 - ( 2 * term1 > K ? K : 0 ) ; // Equivalent to term1 = (term1 * 2) % K;
    }

    // Calculate term2: 2^(M+N-r-1) mod K.
    // Similar modular exponentiation.
    for ( let i = 1 ; i <= M + N - r - 1 ; i ++ )
    {
        term2 += term2 - ( 2 * term2 > K ? K : 0 ) ; // Equivalent to term2 = (term2 * 2) % K;
    }

    // Calculate the final answer: (term1 - term2) mod K.
    // Note: The problem context might imply a specific handling for negative results,
    // but a direct subtraction is performed here.
    var ans = term1 - term2 ;

    // Output the final answer to the console.
    console . log ( ans ) ;
} ; // End of Main function definition.


/**
 * Performs a binary XOR operation on two individual bits (0 or 1).
 * @param {number} a - The first bit.
 * @param {number} b - The second bit.
 * @returns {number} The result of a XOR b (0 or 1).
 */
function xor ( a , b )
{
    return a === b ? 0 : 1 ;
}


/**
 * Performs element-wise XOR operation on two arrays of bits.
 * Assumes both arrays have the same length.
 * @param {number[]} arr1 - The first array of bits.
 * @param {number[]} arr2 - The second array of bits.
 * @returns {number[]} A new array containing the XOR results.
 */
function XOR ( arr1 , arr2 )
{
    // Map each element of arr1 to its XOR result with the corresponding element in arr2.
    return arr1 . map ( ( x , i ) => xor ( x , arr2 [ i ] ) ) ;
}


/**
 * Constructor function for a Matrix object.
 * Initializes a matrix with given dimensions and elements.
 * @param {number} N - The number of rows.
 * @param {number} M - The number of columns.
 * @param {number[]} elements - A 1D array of elements, concatenated row by row.
 */
function Matrix ( N , M , elements )
{
    var A = this ; // Reference to the current Matrix instance.
    A . low = [ ] ; // Initialize 'low' as an array to store rows.

    // Initialize each row as an empty array.
    for ( let i = 0 ; i < N ; i ++ )
    {
        A . low [ i ] = [ ] ;
    }

    // Populate the matrix with elements from the input array.
    // Elements are filled row by row.
    for ( let i = 0 ; i < N ; i ++ )
    {
        for ( let j = 0 ; j < M ; j ++ )
        {
            A . low [ i ] [ j ] = elements [ i * M + j ] ;
        }
    }
}


/**
 * Swaps two elements within an array.
 * This is a utility function used by Matrix methods.
 * @param {Array} arr - The array in which to swap elements.
 * @param {number} i1 - The index of the first element.
 * @param {number} i2 - The index of the second element.
 */
function swap ( arr , i1 , i2 )
{
    var a = arr [ i1 ] ;
    var b = arr [ i2 ] ;
    arr [ i1 ] = b , arr [ i2 ] = a ; // Using comma operator for concise swap.
}


/**
 * Prototype method for Matrix: Swaps two rows in the matrix.
 * @param {number} i1 - The index of the first row to swap.
 * @param {number} i2 - The index of the second row to swap.
 */
Matrix . prototype . swapLow = function ( i1 , i2 )
{
    var A = this ; // Reference to the current Matrix instance.
    swap ( A . low , i1 , i2 ) ; // Use the utility swap function on the 'low' array.
} ;


/**
 * Prototype method for Matrix: Deletes the last row of the matrix.
 */
Matrix . prototype . deleteLow = function ( )
{
    var A = this ; // Reference to the current Matrix instance.
    var L = A . low ; // Get the array of rows.
    L . pop ( ) ; // Remove the last element (row) from the array.
} ;


/**
 * Prototype method for Matrix: Swaps two columns in the matrix.
 * @param {number} j1 - The index of the first column to swap.
 * @param {number} j2 - The index of the second column to swap.
 */
Matrix . prototype . swapColumn = function ( j1 , j2 )
{
    var A = this ; // Reference to the current Matrix instance.
    // Iterate through each row and swap the elements at the specified column indices.
    for ( let i = 0 ; i < A . low . length ; i ++ )
    {
        swap ( A . low [ i ] , j1 , j2 ) ;
    }
} ;


/**
 * Prototype method for Matrix: Deletes the last column of the matrix.
 */
Matrix . prototype . deleteColumn = function ( )
{
    var A = this ; // Reference to the current Matrix instance.
    var L = A . low ; // Get the array of rows.
    var N = L . length ; // Get the number of rows.

    // If the matrix has only one column left, deleting it results in an empty matrix.
    if ( L [ 0 ] . length === 1 )
    {
        A . low = [ ] ;
    }

    // For each row, remove the last element (which corresponds to the last column).
    for ( let i = 0 ; i < N ; i ++ )
    {
        L [ i ] . pop ( ) ;
    }
} ;


// Execute the Main function with input read from standard input.
// This is typical for competitive programming environments.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
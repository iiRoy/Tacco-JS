"use strict" /* Ensure strict mode for cleaner code */ ;


// The main function to process the input and calculate the result
var Main = function(input)
{
    // Process the raw input: trim whitespace, split by any whitespace, and convert to numbers.
    input = input.trim()
                 .split(/\s+/)
                 .map(x => x - 0); // Convert string to number using unary minus operator


    // Extract N and M from the beginning of the processed input array
    var N = input.shift(); // Number of rows
    var M = input.shift(); // Number of columns

    var rankCounter = 0; // Initialize a counter for the matrix rank


    // Create a new Matrix object using N, M, and the remaining elements
    var A = new Matrix(N, M, input);


    // Gaussian elimination-like process to determine matrix rank
    while (A.low.length > 0)
    {
        let i1 = 0; // Index to find the first row with a '1' in the current column

        // Search for the first row (i1) that has a '1' in the first column
        for (let i = 0; i < A.low.length; i++)
        {
            if (A.low[i][0] === 1)
            {
                break; // Found a '1', stop searching
            }
            i1++; // Move to the next row
        }


        // If no row with '1' was found in the current first column (i1 is at the end)
        if (i1 === A.low.length)
        {
            // This column is all zeros, so it doesn't contribute to the rank.
            // Move it to the end and then delete it.
            A.swapColumn(0, A.low[0].length - 1); // Swap current first column with the last
            A.deleteColumn(); // Remove the now-last column (which was the original first)
        }
        else
        {
            // A '1' was found, this column contributes to the rank
            rankCounter += 1; // Increment rank counter


            // Eliminate other '1's in the current column below A.low[i1][0]
            while (true)
            {
                let i2 = i1 + 1; // Index to find the next row with a '1' after i1

                // Search for the next row (i2) after i1 that has a '1' in the first column
                for (let i = i1 + 1; i < A.low.length; i++)
                {
                    if (A.low[i][0] === 1)
                    {
                        break; // Found a '1', stop searching
                    }
                    i2++; // Move to the next row
                }

                // If no more '1's are found below i1
                if (i2 === A.low.length)
                {
                    break; // Exit the inner elimination loop
                }

                // XOR the row at i2 with the row at i1 to eliminate the '1' at A.low[i2][0]
                A.low[i2] = XOR(A.low[i1], A.low[i2]);
            }


            // Move the processed row (the pivot row) to the end and delete it
            A.swapLow(i1, A.low.length - 1); // Swap the pivot row with the last row
            A.deleteLow(); // Remove the last row (which was the pivot row)
        }
    }


    // The calculated rank of the matrix
    var r = rankCounter;

    // Calculate the final answer using the formula
    // This formula seems specific to a particular problem involving XOR spaces or linear algebra over GF(2)
    var ans = Math.pow(2, N + M - 1) - Math.pow(2, Math.min(M, N) - r + Math.max(M, N) - 1);


    // Output the final calculated answer
    console.log(ans);
};


// Helper function for binary XOR operation
function xor(a, b)
{
    /* Performs a logical XOR between two binary digits */
    return a === b ? 0 : 1;
}


// Function to perform XOR operation on two arrays (rows)
function XOR(arr1, arr2)
{
    // Applies the 'xor' function element-wise to two arrays
    return arr1.map((x, i) => xor(x, arr2[i]));
}


// Matrix constructor function
function Matrix(N, M, elements)
{
    // elements are given as a concatenated flat array of all row elements.
    var A = this; // Reference to the current Matrix instance

    A.low = []; // Initialize the array of rows (lows)

    // Initialize rows
    for (let i = 0; i < N; i++)
    {
        A.low[i] = [];
    }

    // Populate the matrix from the flat 'elements' array
    for (let i = 0; i < N; i++)
    {
        for (let j = 0; j < M; j++)
        {
            A.low[i][j] = elements[i * M + j];
        }
    }
}


// Generic swap function for two elements in an array
function swap(arr, i1, i2)
{
    // Temporarily store elements to perform the swap
    var a = arr[i1];
    var b = arr[i2];

    arr[i1] = b; // Assign element from i2 to i1
    arr[i2] = a; // Assign element from i1 to i2
}


// Matrix prototype method to swap two rows
Matrix.prototype.swapLow = function(i1, i2)
{
    var A = this; // Reference to the Matrix instance
    swap(A.low, i1, i2); // Use the generic swap function on the 'low' array
};


// Matrix prototype method to delete the last row
Matrix.prototype.deleteLow = function()
{
    var A = this; // Reference to the Matrix instance
    var L = A.low; // Get the array of rows
    L.pop(); // Remove the last element (row) from the array
};


// Matrix prototype method to swap two columns
Matrix.prototype.swapColumn = function(j1, j2)
{
    var A = this; // Reference to the Matrix instance

    // Iterate through each row and swap the elements at the specified column indices
    for (let i = 0; i < A.low.length; i++)
    {
        swap(A.low[i], j1, j2);
    }
};


// Matrix prototype method to delete the last column
Matrix.prototype.deleteColumn = function()
{
    var A = this; // Reference to the Matrix instance
    var L = A.low; // Get the array of rows
    var N = L.length; // Number of rows

    // Special case: if there's only one column left, clear the entire matrix
    if (L[0].length === 1)
    {
        A.low = []; // Set the matrix to an empty array of rows
    }

    // For each row, remove its last element (which corresponds to the last column)
    for (let i = 0; i < N; i++)
    {
        L[i].pop(); // Remove the last element from the current row
    }
};


// Invoke the Main function with input read from standard input
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
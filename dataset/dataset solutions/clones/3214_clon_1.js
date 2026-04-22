/* This is a JavaScript file. */
"use strict" /* Enforce strict mode for cleaner code. */ ;


// Define the main function that processes the input.
var Main = function (input) {

    // Process the input string: trim whitespace, split by any whitespace, and convert to numbers.
    input = input.trim()
        .split(/\s+/)
        .map(x => x - 0);

    // Extract N and M from the beginning of the input array.
    var N = input.shift(); // Number of rows.
    var M = input.shift(); // Number of columns.

    // Initialize a counter for the rank of the matrix.
    var rankCounter = 0;

    // Create a new Matrix object using the parsed N, M, and remaining elements.
    var A = new Matrix(N, M, input);


    // Main loop for Gaussian elimination (or similar rank calculation logic).
    // Continues as long as there are rows in the matrix.
    while (A.low.length > 0) {

        // Initialize i1 to find the first row with a '1' in the first column.
        let i1 = 0;
        for (let i = 0; i < A.low.length; i++) {
            // If a '1' is found, break the loop.
            if (A.low[i][0] === 1) break;
            i1++; // Increment i1 if '1' is not found.
        }

        // Check if no row had '1' in the first column.
        if (i1 === A.low.length) {
            // If so, swap the first column with the last and then delete the last column.
            A.swapColumn(0, A.low[0].length - 1);
            A.deleteColumn();
        } else {
            // If a '1' was found, increment the rank counter.
            rankCounter += 1;

            // Inner loop to eliminate '1's below the pivot.
            while (true) {
                let i2 = i1 + 1; // Start searching from the row after i1.
                for (let i = i1 + 1; i < A.low.length; i++) {
                    // Find the next row with '1' in the first column.
                    if (A.low[i][0] === 1) break;
                    i2++;
                }
                // If no more '1's are found, break the inner loop.
                if (i2 === A.low.length) break;

                // XOR the current row (i2) with the pivot row (i1) to eliminate the '1'.
                A.low[i2] = XOR(A.low[i1], A.low[i2]);
            }

            // Move the pivot row to the end and delete it, effectively reducing the matrix.
            A.swapLow(i1, A.low.length - 1);
            A.deleteLow();
        }
    }


    // Store the final rank.
    var r = rankCounter;

    // Define the modulus constant for calculations.
    var K = 998244353;

    // Initialize two terms for calculation.
    var term1 = 1;
    var term2 = 1;

    // Calculate term1: 2^(M+N-1) mod K
    // This loop performs modular exponentiation for 2^(M+N-1)
    for (let i = 1; i <= M + N - 1; i++) {
        term1 += term1 - (2 * term1 >= K ? K : 0);
    }


    // Calculate term2: 2^(M+N-r-1) mod K
    // This loop performs modular exponentiation for 2^(M+N-r-1)
    for (let i = 1; i <= M + N - r - 1; i++) {
        term2 += term2 - (2 * term2 >= K ? K : 0);
    }

    // Calculate the final answer.
    var ans = term1 - term2;

    // Output the result to the console.
    console.log(ans);
}; // End of Main function definition.


// Helper function for binary XOR operation.
function xor(a, b) {
    // Returns 0 if a and b are equal, 1 otherwise.
    return a === b ? 0 : 1;
}


// Function to perform element-wise XOR on two arrays.
function XOR(arr1, arr2) {
    // Maps each element x in arr1 to xor(x, corresponding element in arr2).
    return arr1.map((x, i) => xor(x, arr2[i]));
}


// Matrix constructor function.
function Matrix(N, M, elements) { // elements are given as concatenated rows.
    var A = this; // Reference to the current Matrix instance.
    A.low = []; // Initialize an array to store the matrix rows.

    // Initialize N empty rows within the 'low' array.
    for (let i = 0; i < N; i++) A.low[i] = [];

    // Populate the matrix with elements from the input array.
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            A.low[i][j] = elements[i * M + j];
        }
    }
}


// Generic swap function for elements within an array.
function swap(arr, i1, i2) {
    var a = arr[i1]; // Store element at i1.
    var b = arr[i2]; // Store element at i2.
    arr[i1] = b, arr[i2] = a; // Perform the swap using comma operator.
}


// Matrix prototype method to swap two rows.
Matrix.prototype.swapLow = function (i1, i2) {
    var A = this; // Reference to the Matrix instance.
    swap(A.low, i1, i2); // Use the generic swap function on the 'low' array.
};


// Matrix prototype method to delete the last row.
Matrix.prototype.deleteLow = function () { // delete the last row.
    var A = this; // Reference to the Matrix instance.
    var L = A.low; // Get the array of rows.
    L.pop(); // Remove the last element (row).
};


// Matrix prototype method to swap two columns.
Matrix.prototype.swapColumn = function (j1, j2) {
    var A = this; // Reference to the Matrix instance.
    // Iterate through each row and swap elements at j1 and j2.
    for (let i = 0; i < A.low.length; i++) {
        swap(A.low[i], j1, j2);
    }
};


// Matrix prototype method to delete the last column.
Matrix.prototype.deleteColumn = function () { // delete the last Column.
    var A = this; // Reference to the Matrix instance.
    var L = A.low; // Get the array of rows.
    var N = L.length; // Get the number of rows.

    // If there's only one column left, clear the entire matrix.
    if (L[0].length === 1) A.low = [];

    // Otherwise, remove the last element from each row.
    for (let i = 0; i < N; i++) {
        L[i].pop();
    }
};


// Read input from stdin, convert to UTF-8, and pass to the Main function.
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
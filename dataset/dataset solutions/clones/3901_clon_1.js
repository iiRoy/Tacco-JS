"use strict"
; // Enforces strict mode for cleaner code and fewer errors.


/*
 * This function calculates the number of permutations of 'n' items taken 'r' at a time.
 * P(n, r) = n! / (n-r)! = n * (n-1) * ... * (n-r+1)
 */
const permutation = (n, r) => {
    // Initialize result variable to 1
    let res = 1;

    // Loop 'r' times to multiply the terms
    for (let i = 0; i < r; i++) {
        // Multiply 'res' by (n - i) in each iteration
        res *= n - i;
    }

    // Return the calculated permutation value
    return res;
}


/*
 * This function calculates the number of combinations of 'n' items taken 'r' at a time.
 * C(n, r) = P(n, r) / P(r, r) = P(n, r) / r!
 */
const combination = (n, r) => {
    // Calculate and return the combination by dividing permutations
    return permutation(n, r) / permutation(r, r);
}


/*
 * The main function to solve the problem.
 * It reads input, processes it, and prints the result.
 */
const main = arg => {
    // Trim whitespace and split the input string by newlines
    arg = arg.trim()
             .split("\n");

    // Parse the first line as N
    const N = parseInt(arg[0]);

    // Parse the second line, split by spaces, convert to numbers, and sort in descending order
    const A = arg[1]
                  .split(" ")
                  .map(n => parseInt(n))
                  .sort((a, b) => b - a);

    // Calculate the middle point, which is half of the largest element in A
    let middle = A[0] / 2;

    // Initialize 'min' to positive infinity to find the smallest absolute difference
    let min = Infinity;

    // Declare 'r' which will store the element closest to 'middle'
    let r;

    // Iterate through the array A to find the element closest to 'middle'
    for (let i in A) {
        // Calculate the absolute difference between 'middle' and the current element A[i]
        const abs = Math.abs(middle - A[i]);

        // If the current absolute difference is smaller than the minimum found so far
        if (abs < min) {
            // Update 'r' to the current element A[i]
            r = A[i];
            // Update 'min' to the new smallest absolute difference
            min = abs;
        }
    }

    // Print the largest element (A[0]) and the element 'r' found to be closest to A[0]/2
    console.log(A[0] + " " + r);
}


// Read input from stdin, convert to UTF-8, and pass it to the main function
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
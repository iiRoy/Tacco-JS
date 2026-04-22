/*
 * This is a JavaScript file demonstrating data processing.
 * It reads input from standard input, performs calculations,
 * and outputs results to standard output.
 */

// Array to store all input lines read from stdin.
var lines = [];

// Import the 'readline' module for reading input line by line.
var readline = require('readline');


// Create a readline interface configuration object.
// Input stream is process.stdin.
// Output stream is process.stdout.
var rl = readline.createInterface(
    {
        input: process.stdin,
        output: process.stdout,
    }
);

// Event listener for each line of input received.
// The received line 'x' is pushed into the 'lines' array.
rl.on(
    'line',
    function (x)
    {
        lines.push(x); // Store the current line.
    }
);

// Event listener for when the input stream 'close' event is emitted.
// This function contains the main logic of the program.
rl.on(
    'close',
    function ()
    {
        // Retrieve the first line of input.
        // This line is expected to contain N, A, and B space-separated.
        var tmp = lines.shift();

        // Parse N, A, and B from the first input line.
        var N = tmp.split(" ")[0]; // N is the first part.
        var A = tmp.split(" ")[1]; // A is the second part.
        var B = tmp.split(" ")[2]; // B is the third part.

        // Initialize an array 'v' of size N.
        var v = Array(N);

        // Retrieve the second line of input, which contains N numbers space-separated.
        // Split it into an array of strings.
        tmp = lines.shift().split(" ");

        // Convert the string array 'tmp' into numbers and store them in array 'v'.
        for (var i = 0; i < N; i++)
        {
            v[i] = Number(tmp[i]); // Convert string to number.
        }

        // Sort the array 'v' in descending order.
        // The comparison function (b - a) ensures descending order.
        v.sort(
            function (a, b)
            {
                return (b - a);
            }
        );

        // Initialize 'average_max' to calculate the sum of the top 'A' elements.
        var average_max = 0;
        // Initialize an object 'C' to count occurrences of each number in 'v'.
        var C = {};

        // Iterate through the sorted array 'v'.
        for (var i = 0; i < N; i++)
        {
            // Sum the first 'A' elements for 'average_max' calculation.
            if (i < A)
            {
                average_max += v[i];
            }

            // Count occurrences of each number.
            // If the number is not yet in C, initialize its count to 0.
            if (C[v[i]] === undefined)
            {
                C[v[i]] = 0;
            }

            C[v[i]]++; // Increment the count for the current number.
        }

        // Calculate the maximum average by dividing the sum by 'A'.
        average_max /= A;
        // Output the calculated maximum average.
        console.log(average_max);


        // Initialize 'counter' and 'tmp' (re-used variable, distinct scope for 'var').
        var counter = 0;
        var tmp     = 1; // This 'tmp' is for a different purpose than the previous one.

        // Check if the smallest of the top 'B' numbers is different from the largest.
        // This condition distinguishes between two main cases for combination calculation.
        if (v[0] !== v[B - 1])
        {
            // Case 1: The top 'A' numbers are not all the same, or the top 'B' numbers are not all the same.
            var comb = 1; // Initialize combination count.

            // Iterate through the numbers in array 'v'.
            for (var i = 0; i < N; i++)
            {
                // If the count of the current number is 2 or more.
                if (C[v[i]] >= 2)
                {
                    var j; // Declare j here.
                    // Determine 'j': min(C[v[i]], A - counter).
                    // This is for calculating combinations for numbers that are part of the 'A' elements.
                    C[v[i]] > (A - counter) ? j = A - counter : j = C[v[i]];

                    // Multiply 'comb' by the combination of C[v[i]] choose j.
                    comb *= combination(C[v[i]], j);

                    // Update 'counter' and 'i' to skip already processed groups.
                    counter += C[v[i]];
                    i += C[v[i]] - 1; // Adjust 'i' to jump to the next distinct number.
                }
                else
                {
                    // If the count is less than 2, just add its count to 'counter'.
                    counter += C[v[i]];
                }
            }
        }
        else
        {
            // Case 2: All numbers from v[0] to v[B-1] are the same.
            // This means the top 'B' elements are identical.
            var comb = 0; // Initialize combination count.

            // Calculate sum of combinations: B choose 1, B choose 2, ..., B choose B.
            for (var j = 1; j <= B; j++)
            {
                comb += combination(B, j); // Add combinations.
            }
        }
        // Output the final combination count.
        console.log(comb);

    }
);


// Helper function to calculate permutations (nPr).
// n: total number of items.
// r: number of items to choose and arrange.
function permutation(n, r)
{
    var res = 1; // Initialize result.
    // Loop 'r' times to multiply n * (n-1) * ... * (n-r+1).
    for (var i = 0; i < r; i++)
    {
        res *= n - i; // Multiply 'res' by (n-i).
    }
    return res; // Return the permutation result.
}

// Helper function to calculate combinations (nCr).
// n: total number of items.
// r: number of items to choose.
function combination(n, r)
{
    // Combination is nPr / rPr.
    // Effectively, n! / (r! * (n-r)!).
    return permutation(n, r) / permutation(r, r);
}
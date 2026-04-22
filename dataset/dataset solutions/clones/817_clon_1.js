// This script processes input from standard input.
process.stdin.resume(); // Ensure the standard input stream stays open.

/*
 * Set the encoding for the input stream to UTF-8.
 * This is crucial for handling text input correctly.
 */
process.stdin.setEncoding('utf8');

// Declare several variables.
var /* Not used */ n = -1,
    /* Helper function 'i' to calculate powers of 10 */
    i = function (d) {
        return Math.pow(10, ~~d);
    },
    p, // Array to store processed input lines
    c, // Loop counter for test cases
    r, // Array to store results for the current test case
    o, // Array to store parsed numbers for the current test case
    a, // Loop variable for the first number
    b; // Loop variable for the second number

// Event listener for incoming data on standard input.
process.stdin.on(
    'data',
    function (ip) { // 'ip' stands for 'input_payload' or 'input_piece'
        // Split the raw input string by newlines to get individual lines.
        p = ip.split('\n');
        // Convert the first element (number of test cases) to an integer.
        p[0] = ~~p[0]; // Using bitwise NOT twice for integer conversion.

        // Loop through each test case.
        for (c = 0; c < p[0];
             ++c) { // Increment the counter 'c' after each iteration.

            // Initialize an empty array 'r' to store results for this test case.
            r = [];
            // Split the current test case line by spaces to get the two numbers.
            o = p[c + 1].split(' ');

            // Nested loops to iterate through possible ranges for 'a' and 'b'.
            // The range for 'a' is from 10^(o[0]-1) to 10^(o[0])-1.
            for (a = i(o[0] - 1);
                 a + 1 < i(o[0]);
                 ++a)
                // The range for 'b' is from 10^(o[1]-1) to 10^(o[1])-1.
                for (b = i(o[1] - 1);
                     b + 1 < i(o[1]);
                     ++b)
                    // Check the specific condition: sum of arithmetic series equals concatenation.
                    (   (a + b) * (b - a + 1) / 2 // Arithmetic series sum from 'a' to 'b'
                        == // Comparison operator
                        ('' + a + b) // String concatenation of 'a' and 'b'
                    )
                    && // Logical AND operator
                    r.push(a + ' ' + b); // If condition met, add 'a b' to results.

            // Check if any results were found for the current test case.
            r.length // If r.length is truthy (not 0)
                ? // Then...
                r.map(function (s) { // Iterate over results and print each one.
                    console.log(s)
                })
                : // Else...
                console.log('No cats.'); // Print "No cats." if no results.
        } // End of the test case loop.
    } // End of the 'data' event handler function.
); // End of process.stdin.on call.
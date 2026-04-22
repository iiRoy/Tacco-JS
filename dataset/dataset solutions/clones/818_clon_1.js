/*
 * This JavaScript program processes input from stdin.
 * It's designed to solve a specific mathematical puzzle or challenge.
 */

// Ensure the standard input stream remains open.
process.stdin.resume();

// Set the encoding for incoming data to UTF-8.
process.stdin.setEncoding(
    'utf8'
);


// Declare several variables.
// 'n' is initialized but seems unused in the provided snippet.
// 'i' is a helper function to calculate powers of 10.
var n = -1,
    i = function(d) {
        // Calculate 10 raised to the power of d (after converting d to an integer).
        return Math.pow(10, ~~d);
    },
    l,  // 'l' will store the number of test cases.
    p,  // 'p' will store the lines of input.
    c,  // 'c' is a loop counter for test cases.
    r,  // 'r' seems to be an unused array in this specific implementation.
    o,  // 'o' will store parsed input numbers for a test case.
    a,  // 'a' is a loop counter for the first number range.
    b,  // 'b' is a loop counter for the second number range.
    am, // 'am' stores the upper limit for 'a'.
    bm, // 'bm' stores the upper limit for 'b'.
    d;  // 'd' acts as a flag/counter for found solutions.


// Attach an event listener to the 'data' event of stdin.
// This function will be executed when input data is received.
process.stdin.on(
    'data',
    function(
        ip // 'ip' contains the raw input string.
    ) {
        // Split the input string by newlines to get an array of lines.
        // The first line (p[0]) contains the number of test cases, converted to an integer.
        p = ip.split(
            '\n'
        );
        l = ~~p[0];

        // Loop through each test case.
        for (
            c = 0;
            c < l;
            ++c
        ) {
            // Initialize variables for the current test case.
            // 'r' is an empty array (unused).
            // 'o' parses the current test case line (p[c+1]) into an array of strings.
            // 'd' is reset to 0, indicating no solutions found yet for this case.
            r = [],
            o = p[c + 1].split(
                ' '
            ),
            d = 0;

            // Nested loops to iterate through potential 'a' and 'b' values.
            // 'a' ranges from 10^(o[0]-1) up to 10^(o[0])-1.
            for (
                a = i(o[0] - 1),
                am = i(o[0]) - 1;
                a < am;
                ++a
            )
                // 'b' ranges from 10^(o[1]-1) up to 10^(o[1])-1.
                for (
                    b = i(o[1] - 1),
                    bm = i(o[1]) - 1;
                    b < bm;
                    ++b
                )
                    // Check the specific mathematical condition:
                    // (b^2 + b - a^2 + a) / 2 == (concatenation of a and b as a string)
                    // If true, log 'a' and 'b' and increment the counter 'd'.
                    (
                        (b * b + b - a * a + a) / 2
                    )
                    ==
                    (
                        '' + a + b
                    )
                    &&
                    (
                        console.log(a + ' ' + b),
                        ++d
                    );

            // After checking all 'a' and 'b' for the current test case:
            // If 'd' is 0 (no solutions found), print 'No cats.'.
            d || console.log(
                'No cats.'
            );
        }
    }
);
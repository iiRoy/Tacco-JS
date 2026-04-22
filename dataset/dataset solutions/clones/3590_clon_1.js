/*
 * This JavaScript file processes input to find a specific minimum value.
 * It uses the 'readline' module to handle standard input/output.
 */

// Array to store all input lines read from stdin.
var      lines = [         ];

// Import the 'readline' module for interactive terminal input.
var      readline      =      require('readline')      ;

// Create a readline interface configuration object.
var   rl   =   readline.createInterface(
    {
        // Set the input stream to standard input.
        input: process.stdin,

        // Set the output stream to standard output.
        output: process.stdout,
    }
);

// Event listener for each line of input received.
rl.on(
    'line',
    function (x)
    {
        // Add the received line 'x' to the 'lines' array.
        lines.push(x);
    }
);

/*
 * Event listener for when the input stream 'close' event is emitted.
 * This indicates that all input has been received.
 */
rl.on(
    'close',
    function (  )
    {
        // Parse the first number from the first line of input (lines[0]).
        // This represents N, the total number of elements.
        var N  =  Number(lines[0].split(" ")[0]);


        // Parse the second number from the first line of input (lines[0]).
        // This represents K, the window size for processing.
        var K  =  Number(lines[0].split(" ")[1]);


        // Parse the second line of input (lines[1]), split by space,
        // and convert each part to a number, storing them in array X.
        var X  =  lines[1].split(" ").map(i => Number(i));

        // Initialize 'ans' (answer) to positive infinity.
        // This variable will store the minimum value found.
        var ans = Infinity;

        /*
         * Loop through the array X to find the minimum cost.
         * The loop iterates from 'i' such that the window [i, i + K - 1]
         * remains within the bounds of the array X.
         */
        for (
            var i = 0;
            i + K - 1 < N;
            i++
        )
        {
            // Define the left boundary of the current window.
            var left  =  i;
            // Define the right boundary of the current window.
            var right = i + K - 1;

            // Calculate 'result_1': cost of path 0 --> X[right] --> X[left].
            // This represents moving from 0 to the rightmost point, then back to the leftmost point.
            var result_1 = Math.abs(X[left]) + Math.abs(X[right] - X[left]);  // Path: 0 -> X[left] -> X[right] (or vice-versa, depending on X[left]/X[right] signs)
                                                                           // The comment in the original code seems to be `0 --> Right --> Left`
                                                                           // However, `Math.abs(X[left])` is distance from 0 to X[left].
                                                                           // `Math.abs(X[right] - X[left])` is distance between X[left] and X[right].
                                                                           // So this is 0 -> left_end -> right_end.

            // Calculate 'result_2': cost of path 0 --> X[left] --> X[right].
            // This represents moving from 0 to the leftmost point, then back to the rightmost point.
            var result_2 = Math.abs(X[right]) + Math.abs(X[right] - X[left]); // Path: 0 -> X[right] -> X[left] (or vice-versa)
                                                                            // The comment in the original code seems to be `0 --> Left --> Right`
                                                                            // However, `Math.abs(X[right])` is distance from 0 to X[right].
                                                                            // `Math.abs(X[right] - X[left])` is distance between X[left] and X[right].
                                                                            // So this is 0 -> right_end -> left_end.


            // Update 'ans' with the minimum of its current value, result_1, and result_2.
            ans = Math.min(ans, result_1, result_2);
        }

        // Print the final calculated minimum answer to the console.
        console.log(ans);
    }
);
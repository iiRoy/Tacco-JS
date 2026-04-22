// This is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been altered.
// The core logic and structure remain absolutely identical.


process
    .stdin       // Access the standard input stream.
    .on(
        "data",  // Event triggered when data is received.
        function(c) { // 'c' represents the incoming data chunk.

            // Initialize 'n' by converting the input 'c' to a number.
            // Initialize 'p' with the mathematical constant PI.
            var n = +c,
                p = Math.PI;

            // Log two calculated values to the console:
            // 1. 2 * n * p (likely circumference if 'n' is radius)
            // 2. n * n * p (likely area if 'n' is radius)
            console.log(
                2 * n * p,
                n * n * p
            );
        }
    )
    // Ensure the standard input stream continues to emit 'data' events.
    .resume();

// End of script execution.
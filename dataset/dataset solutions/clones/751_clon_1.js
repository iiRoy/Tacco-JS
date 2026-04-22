var input = require('fs').readFileSync('/dev/stdin', 'utf8'); // This line reads the entire content of standard input as a UTF-8 string.

/* The input string is then processed to prepare it for iteration.
 * It's trimmed to remove any leading/trailing whitespace,
 * and then split into an array of lines based on the newline character. */
var arr = input.trim().split("\n");

// This is the main processing loop. It continues indefinitely until a specific break condition is met.
while (true) {
    // In each iteration, the first element (line) is removed from the 'arr' array and assigned to 'abc'.
    var abc = arr.shift();

    // Check for the termination condition: if 'abc' is exactly "0 0 0 0 0", the loop terminates.
    if (abc == "0 0 0 0 0") {
        break; // Exit the while loop.
    }

    /* If not the termination line, process 'abc' along with the next line from 'arr'.
     * These two lines are concatenated with a space, then split into individual strings by spaces,
     * and finally, each string is converted into a Number. The result is stored in 'ary'. */
    var ary = (abc + " " + arr.shift())
        .split(" ")
        .map(Number);

    /* An immediately invoked function expression (IIFE) is used here.
     * It takes several parameters (a, b, c, d, e, na, nb, nc) which correspond to the numbers in 'ary'.
     * The '.apply(null, ary)' method calls this function with 'null' as its 'this' context
     * and passes the elements of 'ary' as individual arguments. */
    (function (a, b, c, d, e, na, nb, nc) {
        // Declare two variables, A and B, which will hold the calculated results.
        var A, B;

        // Calculate the remainder of 'nc' divided by 'd'. This is stored in 'amari'.
        var amari = nc % d;

        // Calculate the value of A using a specific formula involving the input parameters.
        A = na * a + nb * b + Math.floor(nc / d) * d * e + amari * c;

        // Conditional logic to determine how B is calculated.
        if (nc >= d) {
            // If 'nc' is greater than or equal to 'd', B is calculated directly.
            B = na * a + nb * b + nc * e;
        } else {
            /* If 'nc' is less than 'd', a different calculation path is taken.
             * 'husoku' represents a shortage, calculated as 'd' minus 'amari'. */
            var husoku = d - amari;

            // A loop runs 'husoku' times to adjust 'nb' and 'na'.
            while (husoku--) {
                if (nb > 0) {
                    nb--; // Prioritize decreasing 'nb'.
                } else if (na > 0) {
                    na--; // If 'nb' cannot be decreased, decrease 'na'.
                }
            }
            // After adjustments, B is calculated with the modified 'na' and 'nb' values.
            B = na * a + nb * b + d * e;
        }
        // Finally, the minimum of the two calculated values (A and B) is printed to the console.
        console.log(Math.min(A, B));

    }).apply(null, ary); // Execute the IIFE with the parsed numbers.
}
// End of script execution.
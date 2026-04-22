/*
 * This JavaScript program processes input from standard input
 * to calculate and output minimum values based on given parameters.
 * It reads multiple test cases until a specific termination condition is met.
 */


// Import the Node.js 'fs' module to handle file system operations.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');


// Read the entire input, trim any leading/trailing whitespace, and split it into an array of lines.
var arr = input.trim().split("\n");


// Main loop to process each set of input data.
// The loop continues indefinitely until a specific break condition is met.
while (true) {

    // Extract the first line of the current input set from the beginning of the array.
    var abc = arr.shift();

    // Check for the termination condition: if 'abc' is "0 0 0 0 0", exit the loop.
    if (abc == "0 0 0 0 0") break;


    // Concatenate 'abc' with the next line from 'arr' (also shifted),
    // split the combined string by spaces, and then convert each part to a Number.
    // This creates an array of numeric parameters for the anonymous function.
    var ary = (abc + " " + arr.shift()).split(" ").map(Number);


    // Define and immediately invoke an anonymous function with the 'ary' parameters.
    // The parameters correspond to: a, b, c, d, e, na, nb, nc.
    (function (a, b, c, d, e, na, nb, nc) {

        // Declare variables to store the two calculated values, which will be compared.
        var A, B;

        // Calculate the remainder when 'nc' is divided by 'd'. This is used in calculation A.
        var amari = nc % d;

        // Calculate value A using the provided formula. This represents one specific cost scenario.
        A = na * a + nb * b + Math.floor(nc / d) * d * e + amari * c;


        // Conditional calculation for B:
        // If 'nc' is greater than or equal to 'd', calculate B directly using a simpler formula.
        if (nc >= d) {
            B = na * a + nb * b + nc * e;
        }

        // If 'nc' is less than 'd', a different calculation path for B is taken.
        if (nc < d) {
            // Calculate 'husoku' (deficit), which is the amount needed to reach 'd' from 'amari'.
            var husoku = d - amari;

            // Loop 'husoku' times to adjust 'nb' and then 'na'.
            // This logic simulates reducing 'nb' first, and if 'nb' is exhausted, then 'na'.
            while (husoku--) {
                if (nb > 0) {
                    nb--;
                } else if (na > 0) {
                    na--;
                }
            }

            // Calculate B using the potentially adjusted 'na' and 'nb' values, along with 'd' and 'e'.
            B = na * a + nb * b + d * e;
        }

        // Output the minimum of the two calculated values (A and B) to the console.
        console.log(Math.min(A, B));

    // Apply the anonymous function, passing the elements of 'ary' as individual arguments.
    }).apply(null, ary);

} // End of the main processing loop.

// End of the JavaScript program.
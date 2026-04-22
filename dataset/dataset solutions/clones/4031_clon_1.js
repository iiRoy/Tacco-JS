var lines = [];


// This variable will hold the array of input lines.


var readline = require('readline'); // Import the 'readline' module for reading input.


// Create a readline interface to handle input and output.
var rl = readline.createInterface(
    {
        input: process.stdin,  // Use standard input stream.
        output: process.stdout // Use standard output stream.
    }
);


// Event listener for each new line of input.
rl.on('line',
    function (x)
    {
        // Add the received line to the 'lines' array.
        lines.push(x);
    }
);


// Event listener for when the input stream is closed.
rl.on('close',
    function ()
    {
        // Process the collected lines.
        // Each line is split by space, and then each part is converted to a Number.
        var c = lines.map(
            i => i.split(" ").map(
                i => Number(i)
            )
        );

        // Assume values for b_i (b1, b2, b3) based on a1.
        // The problem implies a search space for a_i values from 0 to 100.
        for (var a1 = 0; a1 <= 100; a1++)
        {
            // Calculate b1, b2, b3 based on the first column of 'c' and the assumed a1.
            var b1 = c[0][0] - a1;
            var b2 = c[1][0] - a1;
            var b3 = c[2][0] - a1;

            // Now, verify if these assumed b_i values are consistent
            // with other columns by iterating through possible a2 values.
            for (var a2 = 0; a2 <= 100; a2++)
            {
                // Check consistency with the second column (c[x][1]).
                // If any equation doesn't hold, this a2 is not valid for the current b_i's.
                if (a2 + b1 !== c[0][1]) {
                    continue; // Move to the next a2.
                }
                if (a2 + b2 !== c[1][1]) {
                    continue; // Move to the next a2.
                }
                if (a2 + b3 !== c[2][1]) {
                    continue; // Move to the next a2.
                }

                // If a2 is consistent, proceed to check a3.
                for (var a3 = 0; a3 <= 100; a3++)
                {
                    // Check consistency with the third column (c[x][2]).
                    // If any equation doesn't hold, this a3 is not valid.
                    if (a3 + b1 !== c[0][2]) {
                        continue; // Move to the next a3.
                    }
                    if (a3 + b2 !== c[1][2]) {
                        continue; // Move to the next a3.
                    }
                    if (a3 + b3 !== c[2][2]) {
                        continue; // Move to the next a3.
                    }

                    // If we reach this point, we have found a valid set of a1, a2, a3, b1, b2, b3.
                    // Output "Yes" and terminate the program.
                    console.log("Yes");
                    return (0); // Exit the function and effectively the program.
                }
            }
        }

        // If the loops complete without finding a valid combination,
        // it means no solution exists.
        console.log("No"); // Output "No".

    }
);
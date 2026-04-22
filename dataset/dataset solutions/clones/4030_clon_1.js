// This file processes input lines to solve a specific problem.
// It uses Node.js's 'readline' module for standard input/output operations.

var lines = []; // An array to store all incoming lines from standard input.

// Import the 'readline' module to handle input streams.
var readline = require('readline');

// Create an interface for reading lines from standard input and writing to standard output.
var rl = readline.createInterface(
    {
        input:  process.stdin,  // Set the input stream to standard input.
        output: process.stdout, // Set the output stream to standard output.
    }
);


// Event listener for each 'line' received from the input stream.
rl.on(
    'line',
    function (x)
    {
        lines.push(x); // Add the received line 'x' to the 'lines' array.
    }
);


// Event listener for the 'close' event, indicating the end of the input stream.
rl.on(
    'close',
    function ()
    {
        // Process the collected lines:
        // First, map each line 'i' by splitting it into space-separated strings,
        // then map each resulting string to a Number. This creates a 2D array of numbers.
        var c = lines.map(
            i => i.split(" ").map(
                i => Number(i)
            )
        );

        // This outermost loop iterates through possible values for a variable 'a1',
        // which conceptually represents A_i in a problem context.
        // It checks values from 0 up to 100, inclusive.
        for ( var a1 = 0; a1 <= 100; a1++ )
        {
            // Calculate 'b1', 'b2', and 'b3' based on 'a1' and values from 'c'.
            // These conceptually represent B_i values.
            var b1 = c[0][0] - a1;
            var b2 = c[1][0] - a1;
            var b3 = c[2][0] - a1;


            // This nested loop iterates through possible values for 'a2',
            // representing another set of A_i values.
            for ( var a2 = 0; a2 <= 100; a2++ )
            {
                // Check if the current 'a2' and calculated 'b' values satisfy certain conditions.
                // If any condition is not met, this combination of 'a1' and 'a2' is invalid,
                // so the loop continues to the next 'a2'.
                if ( a2 + b1 !== c[0][1] ) { continue; }
                if ( a2 + b2 !== c[1][1] ) { continue; }
                if ( a2 + b3 !== c[2][1] ) { continue; }


                // This innermost loop iterates through possible values for 'a3',
                // representing a third set of A_i values.
                for ( var a3 = 0; a3 <= 100; a3++ )
                {
                    // Similar to the previous checks, verify conditions for 'a3' and 'b' values.
                    if ( a3 + b1 !== c[0][2] ) { continue; }
                    if ( a3 + b2 !== c[1][2] ) { continue; }
                    if ( a3 + b3 !== c[2][2] ) { continue; }

                    // If all conditions are met, a solution is found.
                    // Print "Yes" to the console.
                    console.log("Yes");

                    // Exit the program immediately as a solution has been found.
                    // The return value (0) typically indicates successful execution.
                    return ( 0 );
                } // End of the 'a3' loop.
            } // End of the 'a2' loop.
        } // End of the 'a1' loop.

        // If the program reaches this point, it means no combination of 'a1', 'a2', 'a3'
        // satisfied all the conditions within the nested loops.
        // Therefore, print "No" to indicate that no solution was found.
        console.log("No");
    }
);
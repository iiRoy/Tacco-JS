// This file contains a JavaScript program designed to solve a specific problem.
// It uses strict mode for better code quality and error handling.
'use strict'; // Enforces strict mode parsing and error handling rules.


/**
 * The main function that processes the input and determines the output.
 *
 * @param {string} input - The raw string input from standard input.
 */
function     main   (   input   ) {


        // Process the input string: split by newlines, then convert each part to a number.
        // The `~~` operator is a concise way to convert to an integer (truncating decimals).
        input       =       input.split('\n')
                                 .map(  v   =>   ~~v  );


        // 'n' represents the total number of elements or the target value for the loop.
        const       n       =       input[0];


        // 'buttons' stores the processed numerical input, essentially an array of numbers.
        // It's a slice of the entire input array, effectively copying it.
        const       buttons     =       input.slice(0,       input.length);


        // 'tmp' acts as a current pointer or index in the 'buttons' array, starting at 1.
        let         tmp     =       1;


        // 'next' will store the value at the 'tmp' index, indicating the next jump.
        let         next    =       0;


        // 'cnt' is a counter, tracking the number of steps taken, starting at 1.
        let         cnt     =       1;


        // Loop until the counter reaches 'n'.
        // This simulates traversing through a sequence defined by the 'buttons' array.
        while   (   cnt     <       n   )
        {
                // Get the next index to jump to from the 'buttons' array.
                // The value at 'buttons[tmp]' is the new 'tmp' for the next iteration.
                next        =       buttons[tmp]; /* The value at the current temporary index */


                // Check if the current path leads to the target button (button with value 2).
                if  (   next    ==      2   )
                {
                        // If button '2' is reached, print the number of steps taken.
                        console.log(cnt);

                        // Exit the function immediately as the goal is achieved.
                        return;
                }


                // Update the current position to the 'next' calculated position.
                tmp         =       next;


                // Increment the step counter for the current iteration.
                cnt++;
        }


        // If the loop completes without reaching button '2', it means it's impossible
        // to reach the target button within 'n' steps or at all.
        // In this scenario, print -1 to indicate failure or no solution found.
        console.log(-1);
}


// Execute the main function by reading input from standard input.
// 'require('fs').readFileSync' is used to synchronously read the file content.
// '/dev/stdin' is a common path for standard input on Unix-like systems.
// 'utf8' specifies the encoding for the input text.
main(  require('fs').readFileSync(  '/dev/stdin',    'utf8'  )  );
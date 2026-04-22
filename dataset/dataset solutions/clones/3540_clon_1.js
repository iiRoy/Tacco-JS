// This script initializes standard input processing.
process.stdin.resume(); // Ensures the standard input stream remains open.

// Sets the encoding for input data to UTF-8.
process.stdin.setEncoding('utf8');


// An array to store all incoming lines from standard input.
var lines = [];

// Initializes a readline interface to handle input line by line.
var reader = require('readline').createInterface(
    {
          input : process.stdin,   // Specifies standard input as the source.
         output: process.stdout // Specifies standard output for any prompts (though not used here).
    }
);


// Event listener for each line of input received.
reader.on(
    'line',
    ( line ) =>
    {
        // Pushes the current line into the 'lines' array.
        lines.push( line );
    }
);


// Event listener for when the input stream closes.
reader.on('close',
    ( ) =>
    {
        // Parses the first line of input.
        // It splits the line by space, then converts each part to a number.
        // N is the count of items, x is the initial budget.
        let [ N, x ] = lines[0] . split(" ") . map(
            v => v - 0
        );

        // Parses the second line of input.
        // It splits the line by space, converts parts to numbers, and then sorts them in ascending order.
        const list = lines[1] . split(" ") . map( v => v - 0 ) . sort( (a , b) => a - b );

        // Initializes the answer variable, which counts how many items can be bought.
        let ans = 0;

        // Loop through the sorted list of items.
        for ( let i = 0 ; i < N ; i ++ )
        {
            // If the budget (x) becomes negative, we can't buy any more items.
            if ( x < 0 )
            {
                break; // Exit the loop.
            }

            // Subtract the current item's cost from the budget.
            x -= list[i];

            // If after buying the item, the budget is still non-negative, increment the count of bought items.
            if ( x >= 0 )
            {
                ans++;
            }
        }

        // Prints the final count of items that could be bought.
        console.log( ans );

    }
);
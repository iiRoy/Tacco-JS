// This JavaScript code handles input/output operations.
// It reads lines from standard input, processes them, and then prints a result to standard output.


 process.stdin.resume(); // Ensures the standard input stream remains open.

// Setting the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding(   'utf8'   );


// An array to store all the lines read from standard input.
var   lines   =   [   ]   ;

// Creating a readline interface to handle input line by line.
var   reader   =   require(   'readline'   )
    .createInterface(   {
        // The input stream for the reader is standard input.
        input   :   process.stdin,

        // The output stream for the reader is standard output.
        output   :   process.stdout
    }   );

// Event listener for each line read from standard input.
reader.on(
    'line',
    (   line   )   =>
    {
        // Pushing the current line into the 'lines' array for later processing.
        lines.push(   line   )   ;
    }
);

// Event listener triggered when the input stream is closed.
reader.on(
    'close',
    ()   =>
    {
        // The first line of input is expected to be a number 'n'.
        // Although 'n' is read, it's not directly used in the current logic for `result`.
        var   n   =   Number(   lines[   0   ]   )   ;

        // Processing the second line of input to produce the final result.
        var   result   =
            lines[   1   ]
                // Split the second line by spaces to get individual string numbers.
                .split(   " "   )
                // Map each string number to an object containing its numeric value and original index (plus 1).
                .map(   (   x   ,   index   )   =>
                {
                    return   {
                        order   :   Number(   x   )   ,
                        id   :   index   +   1
                    }   ;
                }   )
                // Sort these objects based on their 'order' property in ascending order.
                .sort(   (   a   ,   b   )   =>
                {
                    return   a.order   -   b.order   ;
                }   )
                // Map the sorted objects back to just their 'id' property.
                .map(   x   =>   x.id   )
                // Join the resulting IDs with spaces to form a single string.
                .join(   " "   )   ;

        // Printing the final computed result to standard output.
        console.log(   result   )   ;
    }
);
// End of file.
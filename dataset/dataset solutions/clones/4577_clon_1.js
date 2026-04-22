/*
 * This JavaScript file is designed to process input from stdin.
 * It uses the 'readline' module to handle line-by-line input.
 */


// Ensure the standard input stream remains open and active.
process.stdin.resume();

// Set the character encoding for the standard input to UTF-8.
process.stdin.setEncoding(
    'utf8'
);


// Initialize an array to store all incoming lines from standard input.
var   lines   =   [];


/*
 * Create a readline interface.
 * This interface will read input from process.stdin
 * and write output to process.stdout.
 */
var   reader   =   require(
    'readline'
) . createInterface(
    {
        // Define the input stream for the reader.
        input   :   process.stdin,

        // Define the output stream for the reader.
        output   :   process.stdout
    }
);


/*
 * Event listener for each line of input received.
 * When a line is read, it is pushed into the 'lines' array.
 */
reader . on(
    'line',
    (
        line
    )   =>   {
        // Add the current line to our collection of lines.

        lines . push(
            line
        );
    }
);


/*
 * Event listener for when the input stream closes.
 * This block contains the main logic to be executed after all input has been received.
 */
reader . on(
    'close',
    ()   =>   {

        // Parse the first line to get N and M.
        // N and M are extracted by splitting the first line by space
        // and converting the parts to numbers (by subtracting 0).
        const   [
            N,
            M
        ]   =   lines[
            0
        ] . split(
            " "
        ) . map(
            v   =>   v   -   0
        );


        // Initialize an array to store the answer (counts of connections for each node).
        const   ans   =   [];


        // Iterate over each line of input.
        // The first line (index 0) contains N and M, subsequent lines contain edges.
        lines . forEach(
            (
                v,
                i
            )   =>   {
                // For each line, split it by space and convert parts to numbers.
                // These represent the two nodes connected by an edge.
                const   [
                    a,
                    b
                ]   =   v . split(
                    " "
                ) . map(
                    v   =>   v   -   0
                );


                // Process only lines that represent edges (i.e., not the first line).
                if   (
                    i   >   0
                )   {

                    // Increment the count for node 'a'.
                    // Use logical OR (|| 0) to handle cases where ans[a] is undefined initially.
                    ans[
                        a
                    ]   =   (
                        ans[
                            a
                        ]   ||   0
                    )   +   1;


                    // Increment the count for node 'b'.
                    // Similar handling for initial undefined values.
                    ans[
                        b
                    ]   =   (
                        ans[
                            b
                        ]   ||   0
                    )   +   1;
                }
            }
        );


        // Loop from 1 to N (inclusive) to print the connection count for each node.
        for   (
            let   i   =   1;
            i   <=   N;
            i++
        )   {
            // Print the count for the current node 'i'.
            // If ans[i] is undefined (meaning node 'i' had no connections), print 0.
            console . log(
                ans[
                    i
                ]   ||   0
            );
        }
    }
);
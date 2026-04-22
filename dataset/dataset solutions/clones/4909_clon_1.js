/*
 * This is an example of a JavaScript program that reads input
 * from stdin, processes it, and prints output to stdout.
 *
 * It utilizes the 'readline' module for interactive input handling.
 */

    // Ensure the standard input stream remains open and does not exit.
    process.stdin.resume();


    // Configure the standard input stream to interpret data as UTF-8 encoded text.
    process.stdin.setEncoding( 'utf8' );


/*
 * Declare an array to store each line of input received.
 * This array will accumulate all incoming data.
 */
var    lines    =    [    ]    ;

// Initialize the readline interface, which facilitates reading input line by line.
var reader =  require('readline').createInterface(
    {
        input:  process.stdin,     // Designate standard input as the source for reading.
        output: process.stdout     // Designate standard output for any readline prompts (though not used here).
    }
);


/*
 * Attach an event listener for the 'line' event.
 * This callback function executes every time a new line of input is available.
 */
reader.on(
    'line',
    (    line    )    =>
    {
        // Append the newly read line to our 'lines' array.
        lines.push(    line    )    ;
    }
);


/*
 * Attach an event listener for the 'close' event.
 * This callback function executes once the input stream has ended.
 * All processing logic for the collected input is typically placed here.
 */
reader.on(
    'close',
    (    )    =>
    {
        // Extract the first line from the collected input.
        // It's assumed to contain two space-separated numerical values.
        const [    a    ,    b    ]    =
            lines[    0    ]
            .split(    " "    )        // Split the string by space into an array of strings.
            .map(    v    =>    v    )    ;    // Convert string values (implicitly handled by Math.pow).

        /*
         * Perform the primary calculation: (b-1) raised to the power of (a-1),
         * and then multiply the result by b.
         * The final computed value is then printed to the standard output.
         */
        console.log(
            Math.pow(    b    -    1    ,    a    -    1    )
            *    b
        )    ;
    }
)    ;


/*
 * Define a global utility function named 'min'.
 * This function accepts a variable number of arguments and returns the smallest among them.
 */
min    =    (    ...a    )    =>
{
    return    a.reduce(
        (    a    ,    b    )    =>
            a    <    b    ?    a    :    b    ,    // Ternary operator to find the minimum between two values.
        a[    0    ]                               // Initialize the reduction with the first element.
    )
}    ;
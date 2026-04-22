/*
 * This JavaScript file processes input from stdin.
 * It reads a number, calculates its cube, and prints the result.
 */

// Resume the standard input stream to listen for data.
process  .  stdin
    .  resume  (
)  ;

// Set the encoding for the standard input stream to UTF-8.
process  .
    stdin  .
        setEncoding  (
            'utf8'
        )  ;


// Attach a 'data' event listener to the standard input.
process  .  stdin  .  on  (
    'data'  ,   // Event name: 'data'
    function  (   x   )
    {
        // Declare a variable 'input' and assign the received data 'x' to it.
        // The 'x' variable holds the chunk of data read from stdin.
        var  input   =   x  ;

        // Calculate the cube of the 'input' value using Math.pow()
        // and then print the result to the console.
        console  .  log  (
            Math  .  pow  (
                input  ,
                3
            )
        )  ;
    }
)  ;
// End of script.
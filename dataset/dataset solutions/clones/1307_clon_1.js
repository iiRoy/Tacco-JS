/*
 * This JavaScript code reads input from standard input,
 * processes each character, and then prints the modified string to standard output.
 * It's designed to toggle the case of alphabetic characters.
 */

// Initialize an empty string to accumulate incoming data.
var input                               =                   '';

// Get a reference to the standard input stream.
var readable                            =                   process.stdin;

// Ensure the input stream remains active.
// This is necessary for event-driven input processing.
readable.resume                         (                   );

// Set the encoding for the incoming data to UTF-8.
// This ensures proper character handling.
readable.setEncoding                    (                   'utf-8'                 );

// Attach an event listener for the 'data' event.
// This function will be called whenever new data is available from stdin.
readable.on                             (
                                        'data'              ,
                                        function                            (                   chunk                   )
                                        {

    // Append the received data chunk to the 'input' string.
    input                               +=                  chunk;


    // Initialize an empty array to store the processed characters.
    var output                          =                   [];

    // Iterate through each character of the accumulated input string.
    for                                 (                   var             i               =               0;
                                                            i               <               input.length;
                                                            i++
                                        )
    {
        // Check if the current character is a lowercase letter.
        if                              (                   'a'             <=              input[i]
                                                            &&
                                                            input[i]        <=              'z'
                                        )
        {
            // If it's lowercase, convert it to uppercase and add to the output.
            output.push                 (                   input[i].toUpperCase                        (                   )                   );
        }
        // Otherwise, check if the current character is an uppercase letter.
        else                            if                  (                   'A'             <=              input[i]
                                                            &&
                                                            input[i]        <=              'Z'
                                        )
        {
            // If it's uppercase, convert it to lowercase and add to the output.
            output.push                 (                   input[i].toLowerCase                        (                   )                   );
        }
        // If the character is neither a lowercase nor an uppercase letter,
        // keep it as is.
        else
        {
            output.push                 (                   input[i]                                                                        );
        }
    }

    // Join the characters in the 'output' array to form a single string
    // and print it to the console (standard output).
    console.log                         (                   output.join                     (                   ''                  )                   );
                                        }
);
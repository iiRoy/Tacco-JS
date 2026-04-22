// Initialize a variable to accumulate all input chunks.
var         input          =          ""
;
// This line ensures that the standard input stream remains open.
process.stdin.resume(         )
;
/*
 * Set the character encoding for the standard input stream.
 * 'utf-8' is a common and versatile encoding.
 */
process.stdin.setEncoding(        'utf-8'       )
;


// Attach an event listener for 'data' events on the standard input.
// Each time a chunk of data is received, it's appended to the 'input' variable.
process.stdin.on(        'data'        ,         function(        chunk        )
{
    // Concatenate the received chunk to the overall input string.
    input         +=        chunk
    ;
}
)
;




// Attach an event listener for the 'end' event on the standard input.
// This function will be executed once all input has been received.
process.stdin.on(         'end'         ,         function(        )
{
    // Split the accumulated input string by newlines to get an array of lines.
    input         =        input.split(         "\n"         )
    ;


    // Get the first line of input, convert it to lowercase, and store it as the word to search for.
    var         w         =        input[0].toLowerCase(         )
    ;

    // Initialize a counter for the occurrences of the target word.
    var         count         =        0
    ;

    // Initialize an index for iterating through the input array, starting from the second line.
    i         =        1
    ;


    // Begin an infinite loop to process input lines.
    while        (         true         )
    {
        // Split the current input line by spaces to get an array of words.
        arr         =        input[i].split(         " "         )
        ;


        // Check if the first word of the current line is the "END_OF_TEXT" marker.
        if        (         arr[0]         ==         "END_OF_TEXT"         )
        {
            // If it is, break out of the while loop, as we've reached the end of the text.
            break
            ;
        }


        // Iterate through each word in the current line's array.
        for        (         j         =        0         ;         j         <         arr.length         ;         j++         )
        {
            // Compare the target word 'w' with the current word from the line (converted to lowercase).
            if        (         w         ==         arr[j].toLowerCase(         )         )
            {
                // If they match, increment the counter.
                count++
                ;
            }
        }
        // Move to the next line in the input array.
        i++
        ;
    }
    // After processing all text, print the final count of the target word to the console.
    console.log(         count         )
    ;
}
)
;
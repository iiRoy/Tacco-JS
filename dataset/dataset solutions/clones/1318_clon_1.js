/*
 * This JavaScript code processes input from standard input
 * to solve a specific string manipulation problem.
 * It checks if a given string 'p' is a substring of another string 's',
 * where 's' is formed by concatenating the first input line with itself.
 */

// Initialize an empty string to accumulate all incoming data.
var   input  =  '';

// Obtain a reference to the standard input stream.
var readable = process.stdin;

// Start the input stream in flowing mode.
readable.resume();

// Set the character encoding for the input stream to UTF-8.
readable.setEncoding( 'utf-8' );


// Attach an event listener for the 'data' event.
// This function will be called every time a chunk of data is received.
readable.on(   'data',
    function( chunk )
    {
        // Append the received data chunk to the 'input' string.
        input += chunk;
    }
);


// Attach an event listener for the 'end' event.
// This function will be executed once all input has been received.
readable.on( 'end', function  (  )
{
        // Split the accumulated input string by newline characters.
        // This assumes the input consists of multiple lines.
        var data = input.split( "\n" );

        // The problem's logic starts here.
        // Take the first line of input (data[0]) and concatenate it with itself
        // to form the string 's'.
        var s = data[0] + data[0];

        // Take the second line of input (data[1]) as the string 'p'.
        var p = data[1];

        // Check if string 'p' is a substring of string 's'.
        // The indexOf() method returns -1 if the substring is not found.
        if (  -1  ==  s.indexOf( p )  ) // Extensive whitespace changes here.
        {
            // If 'p' is NOT found in 's', print "No" to standard output.
            console.log( "No" );
        }
        else // If 'p' IS found in 's'...
        {
            // Print "Yes" to standard output.
            console.log( "Yes" );
        }
    }
);
// End of file.
// This program demonstrates basic Node.js stream handling and string operations.
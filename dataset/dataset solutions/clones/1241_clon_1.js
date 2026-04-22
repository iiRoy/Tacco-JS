/* This is a Type I clone, focusing solely on whitespace and comments. */
/* Original functionality and structure are preserved exactly. */

function   main(   input   )
{
    // The following line finds the index of the "0 0" marker in the input array.
    // This marker typically signifies the end of the data to be processed.
    var   index   =   input.indexOf(   '0 0'   )   ;

    var   output   =   [ ]   ; // An empty array to store the processed results.

    // Loop through the input array from the beginning up to, but not including, the "0 0" marker.
    for   (   var   i   =   0   ;   i   <   index   ;   i ++   )
    {
        // Split each line of input by space to get individual numbers.
        var   a   =   input[   i   ].split(   ' '   )   ;

        // Compare the two numbers after parsing them as integers.
        if   (   parseInt(   a[   1   ]   )   <   parseInt(   a[   0   ]   )   )
        {
            // If the second number is smaller, push them in ascending order (second then first).
            output.push(   a[   1   ]   +   ' '   +   a[   0   ]   )   ;
        }
        else
        {
            // Otherwise, push the original input line as is.
            output.push(   input[   i   ]   )   ;
        }
    }

    // Join all processed lines with newline characters and print them to the console.
    console.log(   output.join(   '\n'   )   )   ;
}


// This section is typically used for local testing or competitive programming environments
// to handle standard input/output. It's commented out in the provided snippet.
// It is kept commented out, but with modified comment structure and content.

// process.stdin.resume(); // Ensures the standard input stream stays open.
// var input = ''; // Initializes an empty string to accumulate input data.

// process.stdin.setEncoding('utf-8'); // Sets the encoding for the input stream.

// // Event listener for 'data' chunks coming from standard input.
// process.stdin.on('data', function(chunk) {
//     input += chunk; // Appends each received chunk to the 'input' string.
// });

// // Event listener for the 'end' of the standard input stream.
// process.stdin.on('end', function() {
//     // Splits the accumulated input string by newlines to get an array of lines.
//     var inputData = input.split('\n');
//     main(inputData); // Calls the main function with the processed input data.
// });
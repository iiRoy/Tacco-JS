/*
 * This JavaScript code is designed to read two space-separated integers from
 * standard input. It then calculates two values based on these integers:
 * 1. The product of the two integers, often referred to as 'area'.
 * 2. The perimeter of a rectangle formed by these two integers, referred to as 'shu'.
 * Finally, it prints these two calculated values to standard output, separated by a space.
 *
 * This particular version is a Type I clone, meaning its functionality and
 * structural elements (variables, operators, expressions, control flow) are
 * identical to the original. The only modifications are extensive changes
 * in whitespace (indentation, spacing, blank lines) and the addition of comments,
 * to present a visually distinct but functionally equivalent piece of code.
 */

// Initialize standard input stream. This ensures the program doesn't exit
// immediately after starting, allowing it to wait for input.
process
    .stdin
    .resume();


// Set the character encoding for the standard input stream.
// 'utf8' is a common and robust choice for text data.
process.stdin.setEncoding(
    'utf8'
);


// Attach an event listener to the standard input stream.
// This function will be executed every time data is received.
process.stdin.on(
    'data',
    function (
        chunk // The 'chunk' parameter holds the received input data as a string.
    ) {
        // Split the incoming string 'chunk' into an array of substrings.
        // The splitting occurs at each occurrence of a space character.
        var x = chunk.split(
            " "
        );

        // Parse the first element of the array 'x' (which should be a string)
        // into an integer. This represents the first input number.
        var a = parseInt(
            x[0]
        );

        // Parse the second element of the array 'x' into an integer.
        // This represents the second input number.
        var b = parseInt(
            x[1]
        );

        // Calculate the 'area' by multiplying the two parsed integers.
        // This is a straightforward arithmetic operation.
        var area = a * b; // Product calculation

        // Calculate 'shu', which is typically interpreted as the perimeter
        // of a rectangle with sides 'a' and 'b'.
        // The formula is 2 * (length + width).
        var shu = 2 * (
            a + b
        );


        // Output the calculated 'area' and 'shu' to the console.
        // They are concatenated with a space in between for clear presentation.
        console.log(
            area + " " + shu
        );
    }
); // End of the 'data' event handler function.
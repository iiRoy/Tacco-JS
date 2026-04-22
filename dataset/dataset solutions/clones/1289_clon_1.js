/*
 * This JavaScript module is designed to process input from standard input (stdin).
 * It reads lines of space-separated numbers, performs calculations, and
 * outputs a corresponding grade (A, B, C, D, or F) based on specific criteria.
 *
 * This is a Type I clone of an original source file.
 * The core logic, variable names, function calls, and expressions are
 * preserved exactly as they were in the original.
 * Only whitespace (indentation, spacing, line breaks) and comments
 * have been altered or added to create a visually distinct,
 * yet functionally identical, version of the code.
 *
 * The script terminates if the input line consists of three -1 values.
 */

// Configure standard input to interpret incoming data as UTF-8 encoded text.
process
    .stdin
    .setEncoding(
        'utf-8' // Specify the character encoding to use for stdin.
    )
; // End of the setEncoding method call.


// Attach an event listener to the 'data' event of the standard input stream.
// This function will be executed whenever new data is available from stdin.
process.stdin.on(
    'data', // The name of the event to listen for.

    // Define the anonymous callback function that will handle the incoming data.
    function (
        data // The 'data' parameter holds the chunk of data received from stdin.
    ) {
        // Process the incoming data string:
        // 1. Remove any carriage return and newline characters.
        // 2. Split the resulting string into an array of substrings based on spaces.
        arr = data.replace(
            /\r?\n/g, // Regular expression: matches optional carriage return followed by a newline.
            ""       // Replace matched newlines with an empty string, effectively removing them.
        )
        .split(
            " " // Split the cleaned string into an array using a single space as the delimiter.
        )
        ; // Statement terminator.

        // Check for a specific termination condition:
        // If the first three elements of the array are all numerically -1,
        // then exit the Node.js process.
        if (
               parseInt(arr[0]) == -1 // Is the first number -1?
            && parseInt(arr[1]) == -1 // Is the second number -1?
            && parseInt(arr[2]) == -1 // Is the third number -1?
        )
        {
            // If all conditions are met, terminate the program.
            process.exit()
            ; // Exit call.
        }

        // Calculate the 'sum' based on the first two numbers in the array.
        // A ternary operator is used for each number: if it's -1, use 0; otherwise, use its parsed integer value.
        sum = (
              parseInt(arr[0]) == -1 // Check if the first element is -1.
            ? 0                      // If true, use 0 for the sum.
            : parseInt(arr[0])       // If false, parse and use the integer value of the first element.
        )
        + // Addition operator for the two parts of the sum.
        (
              parseInt(arr[1]) == -1 // Check if the second element is -1.
            ? 0                      // If true, use 0 for the sum.
            : parseInt(arr[1])       // If false, parse and use the integer value of the second element.
        )
        ; // Statement terminator.


        // Determine and output a grade based on the calculated 'sum'.
        // This is a series of 'if-else if' conditions.

        if (sum >= 80)
        { // If the sum is 80 or greater.
            console.log("A")
            ; // Output grade A.
        }
        else if (sum >= 65)
        { // If the sum is 65 or greater (but less than 80).
            console.log("B")
            ; // Output grade B.
        }
        else if (sum >= 50)
        { // If the sum is 50 or greater (but less than 65).
            console.log("C")
            ; // Output grade C.
        }
        else if (sum >= 30)
        { // If the sum is 30 or greater (but less than 50),
          // a special condition applies involving the third number.
          if (parseInt(arr[2]) >= 50)
          { // If the third number is 50 or greater.
            console.log("C")
            ; // Output grade C.
          }
          else
          { // If the third number is less than 50.
            console.log("D")
            ; // Output grade D.
          }
        }
        else
        { // If the sum is less than 30 (the final catch-all case).
            console.log("F")
            ; // Output grade F.
        }

    } // End of the 'data' event handler function.
)
; // End of the process.stdin.on method call.
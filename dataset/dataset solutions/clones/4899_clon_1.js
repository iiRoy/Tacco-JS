/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity,
 * only varying in whitespace and comments.
 */

// Define the main function that processes the input
function     Main    (   input   )   {

    // The input string is expected to be multi-line.
    // We split it by newline characters to process individual lines.
    var     input   =   input   .   split   (   "\n"    )   ;

    // The first line of the input is treated as the primary string to analyze.
    var string = input[0]; // Extract the first line

    // Declare variables 'c' and 'f' to store indices.
    // 'c' will hold the index of the first 'C', 'f' for the last 'F'.
    var c, f;

    // Loop through the string from the beginning to find the first 'C'.
    // The loop iterates from index 0 up to (but not including) string.length.
    for (  var  i = 0  ;  i < string.length  ;  i++  ) {
        // Check if the current character is 'C'
        if (  string[i]  ==  "C"  ) {
            c = i; // Store the index of 'C'
            break; // Exit the loop as the first 'C' has been found
        }
    }

    // Now, loop through the string from the end to find the last 'F'.
    // The loop starts from the last character and goes down to index 0.
    for (  var  i = string.length - 1  ;  i >= 0  ;  i--  ) {
        // Check if the current character is 'F'
        if (  string[i]  ==  "F"  ) {
            f = i; // Store the index of 'F'
            break; // Exit the loop as the last 'F' has been found
        }
    }

    // After finding the indices, compare them.
    // If the index of 'C' is less than the index of 'F',
    // it means 'C' appears before 'F' in the string.
    if (  c  <  f  )  {

        // Output "Yes" if 'C' comes before 'F'
        console.log   (   "Yes"   )   ;

    }   else    {

        // Otherwise, output "No"
        console.log ( "No" ) ;

    }
}


// This part executes the Main function with input from standard input.
// It reads the entire content of /dev/stdin as a UTF-8 string.
Main (
    require("fs").readFileSync(
        "/dev/stdin",
        "utf8"
    )
)   ;
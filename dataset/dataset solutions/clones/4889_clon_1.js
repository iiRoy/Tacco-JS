/*
 * This is a JavaScript program designed to solve a specific problem.
 * It takes input from standard input, processes it, and prints the result.
 */

// Define the main function that processes the input received.
function Main ( input )
{
    // The input is initially a single string. We split it by newline characters
    // to get an array of strings, where each element is a line from the input.
    input = input . split ( "\n" ) ;

    // The first line of the input (at index 0) is expected to be a number 'n'.
    // We convert this string to a numeric type and store it in the 'n' variable.
    var n = Number ( input [ 0 ] ) ;

    // Initialize 'ans' variable to 0. This variable will eventually hold
    // the length of the longest valid overlap between the second and third input strings.
    var ans = 0 ;

    // Begin a loop to iterate through possible overlap lengths.
    // The loop variable 'i' starts from the minimum length of the second and third input strings.
    // This ensures that we don't try to get a substring longer than either string allows.
    // The loop continues as long as 'i' is not zero, decrementing 'i' in each iteration.
    for ( var i = Math . min ( input [ 1 ] . length , input [ 2 ] . length ) ; i != 0 ; i -- )
    {
        // Inside the loop, we check two conditions for the current overlap length 'i':

        // Condition 1: Check if the suffix of 'input[1]' of length 'i' is identical
        // to the prefix of 'input[2]' of the same length 'i'.
        // input[1].substr(-1*i) extracts the last 'i' characters of input[1].
        // input[2].substr(0,i) extracts the first 'i' characters of input[2].
        // The comparison uses '==' for equality.

        // Condition 2: Check if the total length of the combined string, after
        // accounting for the overlap 'i', is greater than or equal to 'n'.
        // The combined length without overlap is input[1].length + input[2].length.
        // Subtracting 'i' accounts for the overlap.
        if ( ( input [ 1 ] . substr ( -1 * i ) == input [ 2 ] . substr ( 0 , i ) ) && ( input [ 1 ] . length + input [ 2 ] . length - i >= n ) )
        {
            // If both conditions are true, it means we have found a valid overlap 'i'.
            // Since the loop iterates downwards from the maximum possible 'i',
            // the first 'i' that satisfies these conditions will be the longest one.
            ans = i ;

            // Once the longest valid 'i' is found, we can exit the loop early.
            break ;
        }
    }

    // Finally, construct the resulting string and print it to the console.
    // The result is formed by taking 'input[1]' up to the point where the overlap starts,
    // and then concatenating 'input[2]' entirely.
    // This effectively merges the two strings using the identified 'ans' length overlap.
    console . log ( input [ 1 ] . substr ( 0 , input [ 1 ] . length - ans ) + input [ 2 ] ) ;
}

// This is the entry point for the program execution.
// It reads the entire content of standard input (typically '/dev/stdin' on Unix-like systems).
// The 'utf8' encoding is specified for reading the file content.
// '.trim()' is used to remove any leading or trailing whitespace, including the final newline character,
// before passing the input string to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;

// End of the JavaScript program.
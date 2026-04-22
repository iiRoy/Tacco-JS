/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates how to modify whitespace and add comments
 * without altering the logical structure or identifiers.
 *
 * The purpose of this script is to process input lines,
 * calculate a sum based on numerical ranges, and print the result.
 */

function Main ( input ) {
    // Split the entire input string into an array of lines.
    // Each element in the 'input' array will now be a single line from the original input.
    input = input . split ( "\n" ) ;

    // Initialize a variable 'sum' to store the cumulative result.
    // This variable will hold the total count derived from processing each input line.
    var sum = 0 ;

    // Iterate through the input lines, starting from the second line (index 1).
    // The first line (index 0) is often used for metadata in competitive programming,
    // or simply ignored in this specific problem context.
    for ( var i = 1 ; i < input . length ; i ++ ) {
        // For each relevant line, split it by space to get individual string components.
        // 'mem' will be an array containing these components, typically two numbers as strings.
        var mem = input [ i ] . split ( " " ) ;

        // Convert the string components to numbers and perform the calculation.
        // mem[1] and mem[0] are expected to be string representations of numbers.
        // The expression `mem[1] - mem[0] + 1` calculates the number of integers
        // in a range [mem[0], mem[1]] inclusive.
        // The result is then added to the 'sum'.
        sum += mem [ 1 ] - mem [ 0 ] + 1 ;
    }

    // After processing all relevant lines, print the final calculated sum to the console.
    console . log ( sum ) ;
}

// The following line handles reading input from standard input and calling the Main function.
// It reads the entire content of /dev/stdin as a UTF-8 string,
// removes any leading/trailing whitespace (like a final newline),
// and then passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;
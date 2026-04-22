/*
 * This Main function processes incoming input data.
 * It is structured to handle data typically provided via standard input.
 */
function Main ( input )
{
    // Initially, the 'input' variable holds the entire raw data as a single string.
    // We parse this string by splitting it at every newline character ("\n").
    // This operation transforms the single string into an array of strings,
    // where each element represents a line from the original input.
    input = input . split ( "\n" ) ;

    // For the specific requirements of this task, we are only interested in
    // the very first line of the input. Therefore, we reassign the 'input'
    // variable to hold just the first element of the array (which is the first line).
    input = input [ 0 ] ;

    // Declare a variable 'ans' and initialize it as an empty string.
    // This variable will be used to accumulate characters based on our logic.
    var ans = "" ;

    // Output the current state of the 'input' variable to the console.
    // This can be useful for debugging or verifying what data is being processed.
    console . log ( input ) ;

    // Begin a 'for' loop to iterate through the characters of the 'input' string.
    // The loop variable 'i' starts at 1, continues as long as 'i' is less than or
    // equal to the total length of the 'input' string, and increments by 2 in each step.
    // This effectively processes characters at odd-numbered positions (1-indexed).
    for ( var i = 1 ; i <= input . length ; i = i + 2 )
    {
        // Append the character located at index 'i - 1' of the 'input' string to the 'ans' string.
        // We use 'i - 1' because string indices are 0-based in JavaScript,
        // while our loop variable 'i' is conceptualized as 1-based for problem logic.
        ans += input [ i - 1 ] ;
    }

    // After the loop completes, print the final accumulated string 'ans' to the console.
    // This is the primary output of the Main function's logic.
    console . log ( ans ) ;
}

/*
 * !!! DO NOT EDIT THE CODE BELOW THIS LINE !!!
 * This section is crucial for the execution environment.
 * It handles reading input from standard input and invoking the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
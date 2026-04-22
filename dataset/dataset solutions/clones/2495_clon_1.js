/*
 * This JavaScript code defines a function 'Main' that processes a given input string.
 * It calculates a specific value based on the characters within one of the input lines.
 * The logic involves iterating through a string and counting transitions between distinct characters.
 *
 * @param {string} input - The raw input string, typically read from standard input.
 *                         It is expected to contain multiple lines separated by newlines.
 */
function Main ( input )
{

    // Split the entire input string by newline characters to get an array of lines.
    var lines
        =
        input . split ( '\n' )
    ;

    // The first line of input is parsed as an integer, representing the length N.
    var N
        =
        Number ( lines [ 0 ] )
    ;

    // The second line of input is treated as the string S.
    var S
        =
        lines [ 1 ]
    ;

    // Initialize a counter to track the number of character changes.
    var count
        =
        0
    ;

    // Initialize a variable to store the previously encountered character.
    // It's set to an empty string initially to ensure the first character is always counted as a change.
    var before
        =
        ''
    ;

    // Loop through the string S from its beginning up to, but not including, index N.
    for
    (
        var i = 0 ;
        i < N ;
        i ++
    )
    {
        // Get the character at the current index i.
        var current
            =
            S . charAt ( i )
        ;

        // Check if the current character is different from the character stored in 'before'.
        if ( before !== current )
        {
            // If they are different, increment the count.
            count ++
            ;
        }

        // Update 'before' to the current character for the next iteration of the loop.
        before
            =
            current
        ;
    }

    // Output the final result to the console.
    // The problem likely requires adding 1 to the calculated count.
    console . log ( count + 1 )
    ;
}


// This section handles the execution of the Main function.
// It reads the entire content of standard input synchronously,
// using UTF-8 encoding, and then passes it to the Main function.
Main (
    require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
)
;
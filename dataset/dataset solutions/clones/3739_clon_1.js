// This is the main function that processes the input.
function    Main (   input  )
{
    // The input string is split into an array of lines.
    input = input . split ( "\n" ) ;

    // Check if the last line is empty and remove it if so.
    if  ( input [ input . length - 1 ]   ===   ''  )
    {
        input . pop ( ) ; // Remove the empty last element.
    }


    // Extract the value of K from the first line of input.
    // The '-0' at the end ensures it's treated as a number.
    const K = input [ 0 ] . split ( ' ' ) [ 0 ] - 0 ;

    // Initialize the answer variable.
    var ans = 1 ;

    // Loop K times to generate the sequence.
    for  ( var   i = 0 ;   i < K ;   i ++  )
    {
        // Print the current answer.
        console . log ( ans ) ;

        // Update the answer based on the problem's logic.
        // This adds a power of 10 based on the number of digits of (ans+1).
        ans += 10 ** ( Math . floor ( Math . log10 ( ans + 1 ) ) ) ;
    }

} // End of Main function definition.


// This section handles reading from standard input and calling the main function.
// It should typically not be modified for competitive programming environments.
Main  (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;
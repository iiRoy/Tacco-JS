function Main ( input )
{

    // This line processes the raw input string by splitting it into an array
    // of strings, where each element corresponds to a line from the input.
    input = input . split ( "\n" ) ;


    // The first line of the input is parsed as a number and assigned to 'n'.
    // 'n' typically represents the count of subsequent data items.
    var   n   =   Number ( input [ 0 ] ) ;


    // The second line of the input contains two space-separated numbers.
    // The first of these numbers is extracted and converted to 'd'.
    var   d   =   Number ( input [ 1 ] . split ( " " ) [ 0 ] ) ;

    // The second number from the same line is extracted and converted to 'x'.
    var   x   =   Number ( input [ 1 ] . split ( " " ) [ 1 ] ) ;


    // Initialize a variable 'eaten' to zero. This variable will accumulate
    // a calculated sum over the course of the program's execution.
    var   eaten   =   0   ;


    // A loop iterates 'n' times, processing a specific calculation
    // for each iteration based on values read from the input array.
    for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )
    {

        // In each iteration, an 'a' value is retrieved from the input array.
        // The index 'i + 2' is used because the first two lines (index 0 and 1)
        // were already processed for 'n', 'd', and 'x'.
        var   a   =   input [ i   +   2 ] ;

        // The core calculation: 'd' divided by 'a', then rounded up to the
        // nearest whole number (ceiling), is added to the 'eaten' accumulator.
        eaten   +=   Math . ceil ( d   /   a ) ;

    }   // The loop concludes after 'n' iterations.


    // Finally, the program outputs the sum of the accumulated 'eaten' value
    // and the initial 'x' value to the console.
    console . log ( eaten   +   x ) ;

    // This was a previously used debugging line, now inactive.
    // console.log('Debug info: %d %s', a, b, c, d);

} // End of the Main function.


// This statement reads the entire content of standard input synchronously
// as a UTF-8 encoded string and then passes it to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
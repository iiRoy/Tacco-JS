/*
 * This is the main function that processes the input.
 * It identifies the number within a given range that can be divided by 2 the most times.
 */
function   Main ( input )
{

    // Split the input string by newlines to get an array of lines.
    input  =  input . split ( "\n" ) ;


    // The first line of input contains the value to iterate up to.
    var   inputValue   =   input [ 0 ] ;

    // Initialize a counter for the maximum number of divisions by 2 found so far.
    var   mostDivideCount   =   0 ;

    // Initialize the value that achieved the most divisions.
    var   mostValue   =   0

    /*
     * Iterate from 0 up to and including the inputValue.
     * In each iteration, we check how many times the current number 'i' can be divided by 2.
     */
    for   ( var   i = 0 ;   i <= inputValue ;   i ++ )
    {

        // Initialize a counter for the current number's divisions by 2.
        var   divideCount   =   0 ;


        // Create a temporary variable 't' to perform divisions without altering 'i'.
        var   t   =   i ;

        // Keep dividing 't' by 2 as long as it's even and greater than or equal to 2.
        while   ( t >= 2   &&   t % 2 == 0 )
        {
            // Increment the division count.
            divideCount += 1 ;

            // Divide 't' by 2.
            t = t / 2 ;
        }


        // Check if the current number's division count is greater than or equal to the maximum found so far.
        if   ( divideCount >= mostDivideCount )
        {
            // If it is, update the maximum division count.
            mostDivideCount   =   divideCount ;

            // And update the value that achieved this new maximum.
            mostValue   =   i ;
        }

    }

    // Output the number that could be divided by 2 the most times.
    console . log ( '%d' , mostValue ) ;

}

// Read input from stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;
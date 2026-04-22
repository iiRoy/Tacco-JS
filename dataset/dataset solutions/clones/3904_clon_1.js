/* This is the main function that processes the input. */
function   Main ( input )
{
    // First, we preprocess the input string.
    // It's trimmed, split by whitespace, and then each part is converted to a number.
    input = input . trim ( )
                  . split ( / \s + / ) // Split by one or more whitespace characters
                  . map ( x => x - 0 ) ; // Convert each string segment to a number

    // N is the first element, which is the count of subsequent numbers.
    // We don't actually use N in this specific problem's logic, but it's shifted out.
    var   N = input . shift ( ) ;


    // Find the maximum value among the remaining numbers in the input array.
    var   n = Math . max . apply ( null , input ) ;


    // Remove all occurrences of the maximum value 'n' from the input array.
    // It replaces them with Infinity so they don't interfere with subsequent min/max calculations.
    while ( input . indexOf ( n ) >= 0 )
    {
        input [ input . indexOf ( n ) ] = Infinity ;
    }


    // This complex line calculates 'r'.
    // 'r' is the number in the *modified* input array that is closest to n/2.
    // Let's break it down:
    var   r = input [
                        input . map ( x => Math . abs ( x - n / 2 ) ) // 1. Calculate absolute difference of each remaining number from n/2
                              . indexOf (                                 // 2. Find the index of the minimum difference
                                            Math . min . apply ( null , input . map ( x => Math . abs ( x - n / 2 ) ) ) // 3. Calculate the minimum absolute difference
                                        )
                    ] ;

    // Finally, print the maximum value 'n' and the closest value 'r' to the console.
    console . log ( n + ' ' + r ) ;

} // End of the Main function definition.


// This section handles reading input from standard input and calling the Main function.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
// The program execution starts here.
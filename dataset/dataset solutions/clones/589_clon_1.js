var input =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ; // This line reads the entire content of standard input.

/*
 * The input is expected to be a multi-line string.
 * We first trim any leading/trailing whitespace from the input.
 * Then, we split the input string by newline characters to get an array of lines.
 */
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Begin an infinite loop to process data blocks.
// The loop will continue until a specific break condition is met.
while ( true )
{
    // Extract the first element from the 'Arr' array.
    // The '-0' is a common JavaScript trick to explicitly convert the string to a number.
    var Sum = Arr . shift ( ) - 0 ;

    // Check if the extracted 'Sum' is zero.
    // A value of zero typically signals the end of the input sequence or a termination condition.
    if ( Sum == 0 )
    {
        // If 'Sum' is 0, exit the processing loop.
        break ;
    }

    // Initialize a variable 'sum' to accumulate values for the current block.
    var sum = 0 ;

    // This loop processes the next 10 elements from the 'Arr' array.
    for ( var i = 0 ;  i < 10 ;  i ++ )
    {
        // For each iteration, remove the next element from the front of 'Arr',
        // convert it to a number, and add it to 'sum'.
        sum += ( Arr . shift ( ) - 0 ) ;
    }

    // After processing 10 elements, calculate the difference between the initial 'Sum'
    // and the accumulated 'sum' of the next 10 elements.
    // Then, print this result to the console.
    console . log ( Sum - sum ) ;
}

/*
 * The program terminates once the 'while' loop is broken.
 * No further operations are performed after the loop.
 */
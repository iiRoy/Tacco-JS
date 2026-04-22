/*
 * This JavaScript file processes input data.
 * The 'input' variable will initially contain the entire input string.
 * This function 'Main' is the entry point for processing.
 */
function         Main (   input   )
{

    // Step 1: Process the raw input string.
    // First, split the input by newline characters to handle multiple lines.
    input  =  input . split ( "\n" ) ;


    // Then, take the first line and split it by spaces to get individual values.
    input = input [ 0 ] . split ( " " ) ;

    // Declare and initialize variables by converting string parts to numbers.
    var A       = Number ( input [ 0 ] ) ; // Represents value A
    var B       = Number ( input [ 1 ] ) ; // Represents value B
    var T       = Number ( input [ 2 ] ) ; // Represents value T

    var time    = 1     ; // Initialize a counter for 'time' related calculations
    var sum     = 0     ; // Initialize the accumulator 'sum' to zero

    // Loop through a range determined by T, incrementing by one.
    // The loop condition includes a small offset (0.5) for potential edge cases or rounding.
    for ( var i = 0 ; i <= ( T + 0.5 ) ; i ++ )
    {
        // Inside the loop, check if the current iteration 'i' matches a specific 'time' interval.
        if ( i == time * A )
        {
            // If the condition is met, add 'B' to the 'sum'.
            sum         +=          B ;

            // Increment the 'time' counter for the next interval check.
            time ++ ;
        }
    }

    // After the loop completes, log the final calculated 'sum' to the console.
    console . log ( sum ) ;

}

/*
 * Do not modify the code below this line. It handles standard input/output.
 * It reads the entire input from stdin and passes it to the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
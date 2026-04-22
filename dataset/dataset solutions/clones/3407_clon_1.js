/*
 * This JavaScript function processes an input string 'D'
 * to determine and display a specific Christmas-related message.
 * It's designed to respond to specific date strings.
 */

// Define the primary function that handles the date processing logic.
function   main (   D   )
{

    // Check if the input date string 'D' is exactly "22".
    if  ( D  ==  "22" )
    {
        // If it's "22", log the message for Christmas Eve Eve Eve.
        console.log( "Christmas Eve Eve Eve" ) ;
    }
    // Otherwise, if the input date string 'D' is exactly "23".
    else  if  ( D  ==  "23" )
    {
        // If it's "23", log the message for Christmas Eve Eve.
        console.log( "Christmas Eve Eve" ) ;
    }
    // Otherwise, if the input date string 'D' is exactly "24".
    else  if  ( D  ==  "24" )
    {
        // If it's "24", log the message for Christmas Eve.
        console.log( "Christmas Eve" ) ;
    }
    // Otherwise, if the input date string 'D' is exactly "25".
    else  if  ( D  ==  "25" )
    {
        // If it's "25", log the message for Christmas Day.
        console.log( "Christmas" ) ;
    }
    // No default else block, so nothing happens for other inputs.

} // End of the main function definition.


// This section handles the execution of the program.
// It reads input from standard input and passes it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// The program concludes after executing the main function with the provided input.
/*
 * This is a JavaScript file demonstrating a simple string manipulation function.
 * It takes an input string and performs some operations to format it.
 */

// Define the main function that processes the input.
function   main (   input   )
{
    // Declare a variable 's' and assign the input value to it.
    var   s    =    input ;

    // Extract the second character of the string.
    // The slice method extracts characters from index 1 (inclusive) to 2 (exclusive).
    var   head   =   s . slice ( 1 , 2 ) ;

    // Extract the last character of the string.
    // A negative index in slice counts from the end of the string.
    var   tail   =   s . slice ( -1 ) ;

    // Calculate the length of the string, excluding the first and last characters.
    var   len    =   s . length - 2 ;

    // Log the concatenated result to the console.
    // The result will be: head_character + length_of_middle_part + tail_character.
    console . log ( head + len + tail ) ;
}


// Call the main function with input read from standard input.
// This part reads data from /dev/stdin (common in competitive programming setups).
main (
    require ( "fs" )
        . readFileSync (
            "/dev/stdin" ,
            "utf8"
        )
) ; // End of the program execution.
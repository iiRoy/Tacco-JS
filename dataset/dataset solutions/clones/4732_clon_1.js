/*
 * This JavaScript code processes input from stdin.
 * It defines two functions: 'main' and 'stn'.
 * The 'main' function orchestrates the logic,
 * while 'stn' is a helper for string-to-number conversion.
 */

// Define the primary function for program execution.
function    main   (  a  )
{
    // The core logic resides within this conditional expression.
    // It first processes the input string 'a'.
    // 'a.split(" ")' separates the string by spaces into an array of strings.
    // 'stn(...)' then converts these string elements into numbers.
    // The result of this conversion (an array of numbers) is assigned back to 'a'.
    // Finally, a comparison is made: if 1200 is less than or equal to the processed 'a',
    // it prints "ARC"; otherwise, it prints "ABC".

    ( 1200   <=   ( a   =   stn ( a . split ( " " ) ) ) )

        ?   console . log ( "ARC" )   // This branch executes if the condition is true.

        :   console . log ( "ABC" ) ; // This branch executes if the condition is false.

} // End of the 'main' function definition.


// Define a helper function to convert an array of strings to an array of numbers.
function   stn   (  a  )
{
    // The 'map' method is used here to iterate over each element of the array 'a'.
    // For each element, a callback function is executed.
    return   a . map ( function   (  x  )
    {
        // The 'parseInt' function converts the string 'x' into an integer.
        // The second argument, '10', specifies that the number should be parsed in base 10.
        return   parseInt ( x , 10 ) ;
    } ) ;
    // The 'map' method returns a new array containing the results of calling
    // the provided function on every element in the original array.
} // End of the 'stn' function definition.


// This is the entry point of the program.
// It reads input from standard input, processes it, and passes it to the 'main' function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// The 'require("fs")' statement imports Node.js's file system module.
// 'readFileSync' is used to read the content of a file synchronously.
// "/dev/stdin" represents the standard input stream on Unix-like systems.
// "utf8" specifies the character encoding for the input.
"use strict" /* This directive enables strict mode for the entire script,
                           which helps in writing cleaner and safer JavaScript code. */


// This is the primary function responsible for processing the given input.
function Main(  input  )
{
    // The input string is initially split by newline characters to get individual lines.
    input  =  input . split ( '\n' ) ;

    // The first line of input is parsed as an integer, representing the count 'N'.
    let  N  =  parseInt ( input . shift ( ) ) ;

    // The second line is split by spaces, and each part is converted to a number.
    // The 'x => x - 0' is a common trick to convert string to number.
    let  array  =  input . shift ( ) . split ( ' ' ) . map ( x  =>  x - 0 ) ;

    // Initialize 'result' to count the number of elements that meet a specific condition.
    let  result  =  0 ;

    // Initialize 'max' to keep track of the maximum value encountered so far.
    let  max  =  0 ;


    // Iterate through the 'array' from the beginning to the end.
    for  ( let  i = 0 ;  i < N ;  i++ )
    {
        // Get the current element from the array.
        let  tmp  =  array [ i ] ;

        // Check if the current element 'tmp' is greater than or equal to the current 'max'.
        if  ( tmp  >=  max )
        {
            // If it is, update 'max' to the current element's value.
            max  =  tmp ;
            // Increment 'result' because this element is "visible" or satisfies the condition.
            result++ ;
        }
    }

    // Finally, print the calculated 'result' to the console.
    console . log ( result ) ;
}

// This line reads the input from standard input using Node.js's 'fs' module.
// The file path "/dev/stdin" is a common way to access standard input in competitive programming environments.
// The input is read as UTF-8 encoded text and then passed to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
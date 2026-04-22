// This program calculates the area of a trapezoid.
// It reads three numbers (a, b, h) from standard input.

function Main (  input  )
{
    /*
     * The primary function to process the input data.
     * It expects a string where each line contains a number.
     */
    input  =  input . split ( "\n" ) ; // Split the input string into an array of lines.


    // Parse the first line as integer 'a'. This represents one base of the trapezoid.
    var a  =  parseInt ( input[0] , 10 ) ;

    // Parse the second line as integer 'b'. This represents the other base of the trapezoid.
    var b  =  parseInt ( input[1] , 10 ) ;

    // Parse the third line as integer 'h'. This represents the height of the trapezoid.
    var h  =  parseInt ( input[2] , 10 ) ;


    // Calculate the area 's' using the formula: (a + b) * h / 2
    var s  =  ( a  +  b )  *  h  /  2 ;


    // Output the calculated area 's' to the console.
    console.log ( '%d' , s ) ;
}


// Invoke the Main function, reading input from standard input using Node.js 'fs' module.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
/*
 * This is the primary function of the program.
 * It processes the input and produces an output based on a simple condition.
 */
function Main ( input )
{
    // The input string is split by newline characters to get an array of lines.
    input = input . split ( '\n' )


    // The first line of input is assigned to the constant 'n'.
    const   n   =   input [ 0 ]


    // The second line of input is assigned to the constant 's'.
    const   s   =   input [ 1 ]


    // A boolean flag is initialized to 'true'.
    let     flag    =   true


    // An 'if' statement checks the current value of the 'flag'.
    if  ( flag )
    {
        // If the flag is true, "Yes" is printed to the console.
        console . log ( "Yes" )
    }
}


/*
 * This part of the code is responsible for reading the input from standard input
 * and then calling the 'Main' function with the retrieved data.
 * It uses Node.js's 'fs' module to synchronously read the file.
 */

Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) )
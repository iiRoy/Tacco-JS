/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace and comments have been altered extensively.
 */

// Define the main function that processes the input
function     Main    (   input   )
{
    // Split the input string into an array of lines
    const   lines   =   input   .   split   (   "\n"    )   ;

    // Parse the first line to get the number N
    let     N       =   parseInt    (   lines   [   0   ]   )   ;

    // Parse the second line, split by spaces, and convert elements to integers
    let     a       =   lines   [   1   ]   .   split   (   " "   )   .   map   (   i   =>  parseInt(i)   )   ;

    // Create a sorted copy of array 'a'
    let     sortedA =   a   .   slice   (   )   .   sort   (   (   a   ,   b   )   =>  a   -   b   )   ;


    // Calculate the first median element (for even N, this is N/2-1th element)
    const   med1    =   sortedA   [   N   /   2   -   1   ]   ;

    // Calculate the second median element (for even N, this is N/2th element)
    const   med2    =   sortedA   [   N   /   2   ]   ;

    // Iterate through the original array 'a'
    // For each element, print med2 if it's less than or equal to med1, otherwise print med1
    a   .   forEach   (   i   =>  console   .   log   (   i   <=  med1    ?   med2    :   med1   )   )

}   // End of the Main function definition


// Read the input from standard input using Node.js 'fs' module
const   input   =   require   (   'fs'   )   .   readFileSync   (   "/dev/stdin"   ,   "utf-8"   )   ;

// Call the Main function with the read input
Main    (   input   )   ; // Execute the primary logic of the program
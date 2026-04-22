/*
 * This JavaScript code processes numerical input to solve a specific problem.
 * It demonstrates reading from standard input, parsing integers,
 * and applying basic conditional logic with mathematical operations
 * to determine a result, which is then printed to standard output.
 */
function Main ( input )
{
    // Split the entire input string by newline characters.
    // This creates an array where each element is a line from the input.
    var inp = input . split ( '\n' ) ;


    // Extract the first numerical value from the input array.
    // Convert it to an integer using Math.floor to ensure whole numbers.
    var tate = Math . floor ( inp [ 0 ] ) ;

    // Extract the second numerical value from the input array.
    // This also represents a dimension and is converted to an integer.
    var yoko = Math . floor ( inp [ 1 ] ) ;

    // Extract the third numerical value from the input array.
    // This represents a quantity or target value, also an integer.
    var kuro = Math . floor ( inp [ 2 ] ) ;


    // Initialize the answer variable to zero.
    // This variable will store the final computed result.
    var ans = 0 ;


    // Begin conditional logic to determine the calculation path.
    // The calculation depends on which of the two dimensions ('tate' or 'yoko') is larger.
    if ( tate > yoko )
    {
        // If 'tate' (vertical dimension) is greater than 'yoko' (horizontal dimension),
        // calculate 'ans' by dividing 'kuro' by 'tate' and rounding up.
        ans = Math . ceil ( kuro / tate ) ;
    }
    else
    {
        // If 'yoko' is greater than or equal to 'tate',
        // calculate 'ans' by dividing 'kuro' by 'yoko' and rounding up.
        ans = Math . ceil ( kuro / yoko ) ;
    }


    // Output the final calculated answer to the console.
    // This is the program's primary output.
    console . log ( ans ) ;
}

// This line reads the entire content of standard input synchronously
// and passes it as a string to the 'Main' function for processing.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
/*
 * This JavaScript code represents a Type I clone of an original source.
 * The core logic, variable names, function names, operators, and expressions
 * remain absolutely identical to the original.
 *
 * All modifications are strictly limited to alterations in whitespace
 * (indentation, spacing, and blank lines) and the addition of comments.
 * These changes are designed to make the code appear visually distinct
 * while maintaining its exact functional equivalence.
 */

// The primary function responsible for handling the program's input and logic.
function Main(  input  )
{
    // First, process the raw input string.
    // It's split by newline characters and each part is converted to a Number.
    input  =  input . split(  "\n"  ) . map(  Number  ) ;

    // The initial element of the processed array is then removed.
    input . shift(  ) ;

    // A variable 'n' is declared and initialized with the sum of array elements.
    var  n  =  arrsum(  input  ) ;

    // Conditional check: if 'n' equals the length of the input array.
    if (  n  ==  input . length  )
    {
        // If the condition is true, 'n' is reset to 1.
        n  =  1 ;
    }

    // Another conditional check: if the sum of array elements (excluding 1s) is odd.
    if (  arrsum2(  input  )  %  2  ==  1  )
    {
        // If this condition is true, 'n' is also reset to 1.
        n  =  1 ;
    }

    // The final decision logic is based on the parity of 'n'.

    if (  n  %  2  ==  1  )
    {
        // If 'n' is an odd number, print "first" to the console.
        console . log(  "first"  ) ;
    }
    else
    {
        // Otherwise (if 'n' is an even number), print "second" to the console.
        console . log(  "second"  ) ;
    }
}

// Immediately invoke the Main function.
// The input is read synchronously from standard input ("/dev/stdin"),
// decoded as UTF-8, and any leading/trailing whitespace is trimmed.
Main(  require(  "fs"  ) . readFileSync(  "/dev/stdin" ,  "utf8"  ) . trim(  )  ) ;


// --- Auxiliary Functions ---


// This function calculates the sum of all numerical elements within an array.
function arrsum(  arr  )
{
    var  sum  =  0 ; // Initialize a variable to hold the running total.

    // Loop through each element of the input array.
    for (  var  i  =  0 ,  len  =  arr . length ;  i  <  len ;  ++i  )
    {
        sum  +=  arr[i] ; // Add the current element's value to the sum.
    } ; // Semicolon after loop is allowed.

    return  sum ; // Return the final calculated sum.
}


// This function calculates the sum of numerical elements in an array,
// specifically excluding any elements that have a value of 1.
function arrsum2(  arr  )
{
    var  sum  =  0 ; // Initialize the sum for this specific calculation.

    // Iterate over the array from the first element to the last.
    for (  var  i  =  0 ,  len  =  arr . length ;  i  <  len ;  ++i  )
    {
        // Only add to the sum if the current array element is not equal to 1.
        if (  arr[i]  !=  1  )
        {
            sum  +=  arr[i] ;
        }
    } ; // Another semicolon after the loop.

    return  sum ; // Return the sum of elements, excluding ones.
}
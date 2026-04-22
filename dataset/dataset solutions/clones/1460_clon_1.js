/*
 * This script reads input from standard input,
 * processes it to extract numbers, sorts them,
 * and then prints the sorted numbers to standard output.
 *
 * It's a simple number sorting utility.
 */

// Import the 'fs' (file system) module to read files.
var    input     =  require ( 'fs' ) . readFileSync (    '/dev/stdin' ,
    'utf8'     )    ;

/*
 * The input is expected to be multiple lines.
 * We split the raw input string by the newline character.
 */
var lines    =    input.split  (  '\n'  )  ;


// The first line usually contains 'n', the count of numbers,
// but for this problem, we just shift it off and discard it
// as the actual numbers are on the next line.
// The unary '+' operator converts the string to a number.
var   n   =   + lines . shift ( )    ;


/**
 *  The second line contains the numbers, space-separated.
 *  We shift it off, split by space, and then map each string
 *  representation of a number to an actual number using the unary '+'.
 *  This creates an array of numbers.
 */
var    nums    =    lines . shift (  ) . split  (  ' '  ) . map (
    function   (  num  )
    {
        return    +num    ;
    }
)   ;

// Sort the array of numbers in ascending order.
// The comparison function `a - b` achieves this.
nums . sort (
    function  (  a  ,  b  )
    {
        return   a   -   b   ;
    }
)   ;

// Finally, join the sorted numbers back into a single string
// with spaces in between, and print it to the console.
console . log (    nums . join (    ' '    )    )    ;
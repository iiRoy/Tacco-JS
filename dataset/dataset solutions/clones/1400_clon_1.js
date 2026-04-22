/*
 *  This is a Type I clone example for a JavaScript program.
 *  The original logic and structure are preserved entirely.
 *  Only whitespace and comments have been altered significantly.
 */


//  The 'fs' module is required to interact with the file system,
//  specifically to read data from standard input.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;


//  The raw input string is first trimmed of any leading or trailing whitespace.
//  Then, it is split into an array of strings, where each element represents a line
//  from the input, separated by the newline character.
var arr = input . trim() . split( "\n" ) ;


//  Start an infinite loop to continuously process lines of input.
//  This loop will execute indefinitely until an explicit 'break' statement is encountered.
while ( true )
{
    //  Retrieve the first element (which is the next line of input) from the 'arr' array.
    //  The 'shift()' method also removes this element from the beginning of the array.
    var x = arr . shift() ;


    //  Split the current line 'x' into an array of substrings.
    //  The split is performed using a space character as the delimiter.
    //  This is expected to separate the two operands and the operator.
    var ary = x . split( " " ) ;


    //  Convert the first element of 'ary' (expected to be a number string) to a numerical type.
    //  The '- 0' operation is a common JavaScript idiom for type coercion to a number.
    var a = ary[ 0 ] - 0 ;

    //  Similarly, convert the second element of 'ary' to a numerical type.
    //  Note: In the case of the break condition, ary[1] will be "%" and this conversion will result in NaN,
    //  but it doesn't affect the logic as the comparison 'ary[1] === "%"' happens first.
    var b = ary[ 1 ] - 0 ;


    //  *** Operator Handling Block ***

    //  Check if the operator is the special character '%'.
    //  If it is, this signifies the termination condition for the program.
    if ( ary[ 1 ] === "%" )
    {
        //  Exit the 'while' loop immediately.
        break ;
    }


    //  If the operator is a plus sign, perform addition.
    if ( ary[ 1 ] === "+" )
    {
        //  Output the sum of 'a' and 'b' to the console.
        console . log( a + b ) ;
    }


    //  If the operator is a minus sign, perform subtraction.
    if ( ary[ 1 ] === "-" )
    {
        //  Output the difference of 'a' and 'b' to the console.
        console . log( a - b ) ;
    }


    //  If the operator is an asterisk, perform multiplication.
    if ( ary[ 1 ] === "*" )
    {
        //  Output the product of 'a' and 'b' to the console.
        console . log( a * b ) ;
    }


    //  If the operator is a forward slash, perform integer division.
    if ( ary[ 1 ] === "/" )
    {
        //  Perform division of 'a' by 'b'.
        //  The '~~' (double bitwise NOT) operator is used to truncate the result
        //  to an integer, effectively performing floor division for positive numbers
        //  and ceiling division for negative numbers (towards zero).
        console . log( ~~ ( a / b ) ) ;
    }

    //  No explicit 'else' or error handling for unknown operators is present.
    //  The loop will simply continue to the next iteration if no conditions match.

} // End of the infinite 'while' loop.

//  The program concludes execution once the 'break' statement is hit.
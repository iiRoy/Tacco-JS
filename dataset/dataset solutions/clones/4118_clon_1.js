/*
 * This JavaScript program is designed to process incoming data
 * and validate a specific string format using regular expressions.
 * The core logic resides within the `Main` function.
 */

function    Main  (  input  )
{
    // The 'input' parameter is expected to be an array of strings,
    // where each string represents a line from the original input source.

    // Extract the first numerical value 'a' from the first line of input.
    // The first line is expected to contain two space-separated numbers.
    // The '- 0' at the end ensures explicit type conversion to a number.
    var  a  =  input[0] . split ( " " ) [0]  -  0 ;

    // Extract the second numerical value 'b' from the first line of input.
    // Similar to 'a', this is also converted to a number.
    var  b  =  input[0] . split ( " " ) [1]  -  0 ;

    // Retrieve the target string 's' for validation from the second line of input.
    var  s  =  input[1] ;

    // Dynamically construct a regular expression (RegExp) object.
    // This regex will match a pattern like 'digit{a}-digit{b}',
    // where 'a' and 'b' are the numbers extracted earlier.
    // The '^' and '$' ensure that the entire string must match the pattern.
    var  rx  =  new  RegExp ( "^\\d{"  +  a  +  "}-\\d{"  +  b  +  "}$" ) ;

    // Perform the validation check:
    // Use the 'test' method of the regular expression object against the string 's'.
    // Based on the test result, print "Yes" if it matches, otherwise "No".
    console . log ( rx . test ( s )  ?  "Yes"  :  "No" ) ;
}


// This block handles the initial setup and invocation of the Main function.
// It reads the entire content of standard input (/dev/stdin),
// decodes it as UTF-8, removes leading/trailing whitespace,
// and then splits the content into an array of lines based on newline characters.
// This array of lines is then passed as the 'input' argument to the Main function.

Main (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) . trim ( ) . split ( "\n" )  ) ;
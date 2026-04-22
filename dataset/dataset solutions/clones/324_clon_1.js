/*
 * This JavaScript program processes textual input from standard input.
 * It reads a specific number of lines, as indicated by the first line of input.
 * For each of these lines, it performs a string replacement operation.
 * Specifically, it replaces all instances of the substring "Hoshino" with "Hoshina".
 * The modified strings are then printed to standard output.
 */

// Import the 'fs' (file system) module, which is necessary for reading files or stdin.
var input = require('fs') . readFileSync( '/dev/stdin' ,  'utf8' ) ;


// The following line preprocesses the raw input string.
// First, 'trim()' removes any leading or trailing whitespace (like newlines).
// Then, 'split("\n")' divides the string into an array of substrings,
// using the newline character as a delimiter. Each element of 'Arr' will be a line.
var Arr = ( input . trim() ) . split( "\n" ) ;


// The first element of the 'Arr' array is expected to be a number.
// 'Arr.shift()' removes this first element from the array and returns it.
// The '- 0' operation explicitly converts the string to a number.
// This number 'L' represents how many subsequent lines need to be processed.
var L = ( Arr . shift() ) - 0 ;


// This loop iterates 'L' times, processing each of the specified lines.
for ( var i = 0 ; i < L ; i ++ )
{
    // 'Arr[i]' retrieves the current line from the array.
    var str = Arr[i] ;

    // 'str.replace(/Hoshino/g,"Hoshina")' performs the core logic:
    // It finds all occurrences of the regular expression /Hoshino/g (where 'g' means global, all occurrences).
    // And replaces them with the string "Hoshina".
    // Finally, 'console.log()' prints the resulting modified string to standard output, followed by a newline.
    console . log( str . replace( /Hoshino/g , "Hoshina" ) ) ;
}

// End of script execution.
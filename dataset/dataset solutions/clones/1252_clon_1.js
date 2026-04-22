var   line  ,   i  ,  eof_i   ; // Declaration of primary variables used throughout the script.


// This line reads the entire content from standard input ('/dev/stdin').
// It uses the Node.js 'fs' module to perform the file read operation.
// The content is read as 'ascii' encoded text.
// Subsequently, the entire input string is split into an array of strings,
// with each element representing a line, using the newline character as a delimiter.
line  = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'ascii' ) . split ( "\n" ) ;


// This loop iterates through the 'line' array in reverse order,
// starting from the last element and moving towards the first.
// The primary purpose is to locate the index of the last line that contains a specific character: '?'.
for  ( i  =  line.length  -  1  ;   i  >=  0  ;   i--   )
{
    // Inside the loop, this conditional statement checks if the current line (line[i])
    // includes the '?' character.
    if  ( line [ i ] . includes ( "?" ) )
    {
        // If a line containing '?' is found, its index is stored in 'eof_i'.
        // Since the loop runs in reverse, this will effectively capture the index of the LAST '?' occurrence.
        eof_i  =  i ;
    }
}


// After determining 'eof_i', this line modifies the 'line' array.
// It creates a new array containing elements from the beginning of the original 'line' array
// up to (but not including) the 'eof_i' index.
// This effectively truncates the input, removing any lines that appear after the last '?' marker.
line  = line . slice ( 0 ,  eof_i ) ;


// This statement processes the truncated 'line' array and prints the result to the console.
// 1. 'line.map(solve)': For each line in the array, the 'solve' function is called.
//    The 'solve' function is expected to return a calculated value.
// 2. '.join("\n")': The array of results returned by 'map' is then joined back into a single string,
//    with each result separated by a newline character.
// 3. 'console.log()': The final concatenated string is outputted to standard output.
console.log ( line . map ( solve ) . join ( "\n" ) ) ;


// This function, 'solve', takes a single string 'line' as an argument.
// It is designed to parse this string as a simple arithmetic expression
// (e.g., "10 + 5") and return the computed result.
function   solve ( line )
{
    // Declaration of a local variable 'ary' which will hold the parsed components of the input line.
    var   ary   ;

    // The input 'line' is split into an array of strings based on the space character (" ").
    // The '3' argument limits the split to a maximum of 3 parts:
    // [operand1, operator, operand2].
    ary  = line . split ( " " ,  3 ) ;

    // A series of conditional checks to determine the arithmetic operator.
    // Based on the operator, the corresponding calculation is performed.
    // 'parseInt()' is used to convert the string operands to integer numbers before calculation.

    if  ( ary [ 1 ]  ==  '+' )
    {
        // If the operator is '+', perform addition.
        return   parseInt ( ary [ 0 ] )  +  parseInt ( ary [ 2 ] ) ;
    }
    else   if  ( ary [ 1 ]  ==  '-' )
    {
        // If the operator is '-', perform subtraction.
        return   parseInt ( ary [ 0 ] )  -  parseInt ( ary [ 2 ] ) ;
    }
    else   if  ( ary [ 1 ]  ==  '*' )
    {
        // If the operator is '*', perform multiplication.
        return   parseInt ( ary [ 0 ] )  *  parseInt ( ary [ 2 ] ) ;
    }
    // If none of the above operators match, the default operation is integer division.
    // 'Math.floor()' is used to ensure the result is an integer (truncating any decimal part).
    return   Math . floor ( parseInt ( ary [ 0 ] )  /  parseInt ( ary [ 2 ] ) ) ;
}
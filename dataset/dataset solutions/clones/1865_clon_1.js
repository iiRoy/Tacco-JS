/*
 * This JavaScript file is designed to read a series of integer values
 * from standard input, perform a specific calculation based on these values,
 * and then output the final result to the standard output.
 * It primarily demonstrates basic file system interaction for input,
 * string manipulation, integer parsing, and conditional arithmetic operations.
 */


//  The 'fs' module is imported to enable file system operations,
//  which are necessary for reading input from '/dev/stdin'.
fs  =  require('fs');


//  The entire content of '/dev/stdin' is read synchronously.
//  The input is expected to be a string encoded in UTF-8.
input  =  fs.readFileSync('/dev/stdin',  'utf8');


//  The raw input string is split into an array of substrings
//  using a space character as the delimiter.
//  These substrings are expected to represent numerical values.
tmp  =  input.split(" ");


//  The first element of the 'tmp' array is parsed as an integer (base 10)
//  and assigned to the variable 'a'.
a  =  parseInt(tmp[0],  10);

//  The second element of the 'tmp' array is parsed as an integer (base 10)
//  and assigned to the variable 'b'.
b  =  parseInt(tmp[1],  10);

//  The third element of the 'tmp' array is parsed as an integer (base 10)
//  and assigned to the variable 'c'. This value is not used in the final calculation.
c  =  parseInt(tmp[2],  10);

//  The fourth element of the 'tmp' array is parsed as an integer (base 10)
//  and assigned to the variable 'k'. This is a key parameter for the calculation.
k  =  parseInt(tmp[3],  10);


//  A variable 's' is initialized to zero.
//  This variable will store the result of the conditional calculation.
s  =  0;


/*
 *  A conditional statement determines the final value of 's'.
 *  If 'k' is less than or equal to the sum of 'a' and 'b',
 *  's' is simply set to the value of 'a'.
 *  Otherwise, a more complex subtraction is performed to calculate 's'.
 */
if  ( k  <=  a  +  b )
{
    s  =  a;  //  If condition met, 's' takes the value of 'a'.
}
else
{
    //  If condition not met, 's' is calculated using 'a' and the difference
    //  between 'k' and the sum of 'a' and 'b'.
    s  =  a  -  ( k  -  a  -  b );
}


//  The final computed value of 's' is printed to the standard output,
//  followed by a newline character.
console.log(s);
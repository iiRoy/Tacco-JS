/*
 *   This JavaScript program processes input data from standard input
 *   to perform a series of calculations and transformations.
 *   It is designed to handle a specific format of input.
 */

//  Required module 'fs' for file system operations, specifically reading synchronous data.
var input =  require('fs').readFileSync('/dev/stdin', 'utf8')  ;

//  Process the raw input string: trim leading/trailing whitespace, then split into an array by newline characters.
var arr =  input.trim().split("\n")  ;

//  Extract the first numerical value from the array 'arr' and convert it to a number.
//  This value is assigned to the variable 'n'.
var n =  arr.shift() - 0  ;

//  Extract the next line, split it by spaces, and map the resulting parts to numbers.
//  These two numbers are destructured into variables 'a' and 'd'.
var [a, d] =  arr.shift().split(" ").map(Number)  ;

//  Initialize an empty JavaScript object to serve as a mapping or lookup table.
var obj =  {}  ;

//  Extract the next numerical value from 'arr' and convert it to a number.
//  This value, representing the number of operations, is assigned to 'm'.
var m =  arr.shift() - 0  ;

//  Loop 'm' times to process each operation specified in the input.
for (  var i = 0;  i < m;  i++  )
{
   //  For each iteration, extract the next line, split it by spaces, and
   //  destructure the three parts into variables 'x', 'y', and 'z'.
   var [x, y, z] =  arr.shift().split(" ")  ;

   //  Check if 'y' is a property of 'obj'. If not, initialize obj[y] with the value of 'y'.
   if (  obj.hasOwnProperty(y) == false  )
   {
      obj[y] = y  ;
   }

   //  Check if 'z' is a property of 'obj'. If not, initialize obj[z] with the value of 'z'.
   if (  obj.hasOwnProperty(z) == false  )
   {
      obj[z] = z  ;
   }

   //  Conditional logic based on the value of 'x'.
   //  If 'x' is exactly "0" (a string), swap the values associated with keys 'y' and 'z' in 'obj'.
   if (  x == "0"  )
   {
      [obj[y], obj[z]] = [obj[z], obj[y]]  ;
   }
   //  Otherwise (if 'x' is not "0"), assign the value currently associated with 'z' in 'obj'
   //  to the key 'y' in 'obj'.
   else
   {
      obj[y] = obj[z]  ;
   }
} //  End of the operations loop.

//  Extract the final numerical value from 'arr' and convert it to a number.
//  This value is assigned to the variable 'k'.
var k =  arr.shift() - 0  ;

//  Check if the string representation of 'k' exists as a property in 'obj'.
//  If it does, update 'k' with the numeric value retrieved from 'obj' using 'k' as a key.
if (  obj.hasOwnProperty(k + "")  )
{
   k =  obj[k] - 0  ;
}

//  Calculate the final result using the formula: a + ((k - 1) * d).
//  Then, print this calculated result to the standard output.
console.log(  a + ((k - 1) * d)  )  ;

//  Program execution concludes.
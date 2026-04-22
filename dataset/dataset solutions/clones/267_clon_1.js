/*
 * This JavaScript code snippet processes an input string,
 * splitting it into an array of values.
 * It then iterates through the array in pairs, performing
 * a specific mathematical calculation for each pair.
 * The results are logged to the console.
 */

var  arr  =  input.split(  /\s/  );  //  Initialize 'arr' by splitting the 'input' string using whitespace as a delimiter.

// Declare a variable 'xx' which will be used to store an intermediate calculation result within the loop.
var  xx;

// Start a 'for' loop to iterate through the 'arr' array.
// The loop variable 'i' is initialized to 0.
// The loop continues as long as the product of 'arr[i]' and 'arr[i+1]' is not equal to 0.
// 'i' is incremented by 2 in each iteration to process elements in pairs.
for  (  var  i  =  0  ;  arr[i]  *  arr[i+1]  !=  0  ;  i  +=  2  )
{
    // Calculate the square of the current array element 'arr[i]' and assign it to 'xx'.
    xx  =  arr[i]  *  arr[i];

    // Perform a complex mathematical calculation and log the result to the console.
    // The calculation involves Math.sqrt, multiplication, and addition.
    console.log(  arr[i]  *  Math.sqrt(  4  *  arr[i+1]  *  arr[i+1]  +  xx  )  +  xx  );
}  // End of the 'for' loop.
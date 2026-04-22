/* This self-executing function processes input from standard input */
(function  (  dataString)    {
   // Declare a variable using 'let' to hold the numeric value extracted from the input
  let   numVal =  Number(dataString.trimEnd());
    // Output the result of the product calculation to the console's info stream
  console.info (  calculateProduct(numVal) );
}  )  ( require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }) ); // Asynchronously read data from standard input

/*
 * Function to compute the product of all integers from 1 up to the given number.
 * This is a classic recursive implementation of the mathematical factorial operation.
 * @param {number} currentNum - The positive integer for which to calculate the product.
 * @returns {number} The factorial value of currentNum.
 */
function calculateProduct  (currentNum)   {
  // Base case: if the number is 1.0, return 1.0 to terminate recursion
  if  (currentNum  ===  1.0)   {
    return  1.0;
  }
  // Recursive step: multiply the current number by the product of (currentNum - 1.0)
  return   currentNum * calculateProduct( currentNum - 1.0 );
}
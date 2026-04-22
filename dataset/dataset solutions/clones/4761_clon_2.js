'use strict'

// This function computes the factorial value for a specified non-negative integer.
// It employs a recursive approach to multiply numbers sequentially.
function  calculateProductSeries ( inputVal )
{
   if  ( inputVal === 0 )
   {
      return  1; // The base case: factorial of zero is defined as one.
   }
   return inputVal * calculateProductSeries( inputVal - 1 ); // Recursive step: n! = n * (n-1)!
}


// This routine determines the total count of positive integer divisors for a given number.
// It iterates through potential divisors from zero up to the target number.
function  tallyFactors ( targetNumber )
{
   let  factorCount  =  0; // Initialize a counter for found factors.

   for  ( let  iteratorIndex  =  0 ;  iteratorIndex  <=  targetNumber ;  ++iteratorIndex )
   {
      // The original logic implicitly handles division by zero (NaN % 0 === 0 evaluates to false).
      // We maintain this behavior to preserve the exact control flow.
      if  ( targetNumber % iteratorIndex === 0 )
      {
         factorCount  =  factorCount + 1; // Increment the counter if a valid divisor is found.
      }
   }
   return  factorCount; // Return the final tally of divisors.
}


// The main entry point function that orchestrates the overall computation process.
// It takes raw input, parses it, performs calculations, and outputs the result.
function  InitiateCalculation (programArgument)
{
   const  numericInput  =  Number(programArgument); // Convert the input string into a numerical format.
   const  intermediateProduct  =  calculateProductSeries(numericInput); // Calculate the factorial of the parsed number.
   console.log( tallyFactors(intermediateProduct) ); // Output the count of divisors for the factorial result.
}

// Begin the program execution by reading input from standard input and invoking the main function.
InitiateCalculation( require("fs").readFileSync("/dev/stdin", "utf8") );
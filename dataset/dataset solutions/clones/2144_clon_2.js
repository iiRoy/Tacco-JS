"use strict"; /* Enforce strict parsing and error handling for robust code execution */

function processData  (  rawData  )   {  // Core routine to handle and process the provided data

  // Extract and parse initial configuration parameters from the first line of raw input
  let   tokenizedLine   =   rawData[0] . trim() . split(" ");
  let   totalElements   =   parseInt(tokenizedLine[0], 10);  // The upper limit for combinations
  let   firstIndexToExclude   =   parseInt(tokenizedLine[1], 10); // First value to be excluded from sum
  let   secondIndexToExclude   =   parseInt(tokenizedLine[2], 10); // Second value to be excluded from sum

  // Initialize variables for calculating combinations (nCr)
  let   numeratorValue   =   1.0;  // Accumulates the numerator part (n * (n-1) * ...)
  let   denominatorValue   =   1.0; // Accumulates the denominator part (r! = 1 * 2 * ...)

  let   combinationsList   =   new Array(); // Array to store computed combination values
  let   totalSum   =   0.0;  // Variable to accumulate the sum of all combinations

  // Iterate to calculate and store each combination C(totalElements, counter) and sum them up
  for ( let   counter   =   1;   counter   <=   totalElements;   ++counter )   {
    numeratorValue   *=   (totalElements + 1 - counter); // Update numerator for current combination
    denominatorValue   *=   counter; // Update denominator (factorial part)
    combinationsList[counter - 1]   =   numeratorValue   /   denominatorValue; // Store the calculated combination
    totalSum   +=   combinationsList[counter - 1]; // Add this combination to the running total
  }

  // Adjust the total sum by subtracting specific combinations as per requirements
  totalSum   -=   combinationsList[firstIndexToExclude - 1]; // Remove the combination at the first specified index

  totalSum   -=   combinationsList[secondIndexToExclude - 1]; // Remove the combination at the second specified index

  // Output the final computed sum after applying a modulo operation (10^9 + 7)
  console . log (   totalSum % (   Math . pow (   10,   9   )   +   7   )   ) ;
}

// Acquire input from the standard input stream, process it, and invoke the main function
processData (   require ( 'fs' ) . readFileSync ( '/dev/stdin',   'utf8' ) . trim() . split ( "\n" )   ) ;
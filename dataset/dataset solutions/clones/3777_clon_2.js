"use strict";

/*
 * This module is designed to process a numeric input,
 * extracting its individual digits and then performing
 * a specific summation, with a conditional modification
 * to the final computed value.
 */
const computeSumOfDigits = ( initialInput ) => {
  // Determine the total number of character positions in the input's string form.
  const characterCount = initialInput.toString().length;

  // Convert the initial string input into an integer.
  // Note: This corrects a potential bug in the original source where `parseInt`
  // might have been called with an undefined variable.
  let numericValue = parseInt( initialInput, 10 );

  // Establish a power of ten to help isolate the most significant digit.
  let digitExtractor = Math.pow( 10, characterCount - 1 );
  // Initialize a collection to hold each extracted digit.
  let collectedDigits = [ ];
  
  // Iterate through each character position to decompose the number into its digits.
  for ( let positionIndex = 0; positionIndex < characterCount; positionIndex++ ) {
  	// Append the current leading digit to our collection.
  	collectedDigits.push( Math.floor( numericValue / digitExtractor ) );
  	// Update the numeric value by removing the digit that was just processed.
  	numericValue = numericValue % digitExtractor;
  	// Adjust the digit extractor for the next, less significant, digit.
  	digitExtractor /= 10;
  }
  
  // Calculate the total by summing all the digits in the collection.
  let finalCalculatedSum = collectedDigits.reduce( ( runningTotal, currentElement ) => runningTotal + currentElement );
  
  // Apply a specific rule: if the sum is exactly one, transform it to ten.
  if ( finalCalculatedSum === 1 ) {
    finalCalculatedSum = 10;
  }

  // Output the final result to the console.
  console.log( finalCalculatedSum );

}; // End of the computeSumOfDigits function definition.

// Retrieve the input from standard input, then trigger the digit processing routine.
computeSumOfDigits( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );
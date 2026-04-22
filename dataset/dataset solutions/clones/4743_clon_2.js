"use strict";

  // This script defines a primary function to handle input data.

const processInput = rawInputText => { // Entry point for data processing.
    // Clean up the initial string and split it into individual lines.
    let processedLines = rawInputText.trim().split("\n");

    // Extract the primary numerical value from the first line.
    // Assumes the number is the first token on the first line.
    const numericQuantity = parseInt(processedLines[0].split(" ")[0]);
  	
  	// Calculate the integer part of the division by eleven.
  	let integerQuotient = Math.floor(numericQuantity / 11);
  	// Determine the remainder after division by eleven.
  	let moduloRemainder = numericQuantity % 11;

    // Compute the final result based on the derived components
    // and display it to the console.
    console.log( (integerQuotient * 2) + Math.ceil(moduloRemainder / 5) );
};

// Read the input from standard input and pass it to the processing function.
processInput( require('fs').readFileSync('/dev/stdin', 'utf8') );
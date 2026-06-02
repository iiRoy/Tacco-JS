"use strict";

// This function serves as the primary entry point for processing the input data.
const processInput = (inputData) => {
    // First, clean up the raw input string by removing any leading/trailing whitespace,
    // and then split it into an array of strings based on newline characters.
    inputData = inputData.trim().split("\n");

    // Extract the numerical value from the first element of the processed input array.
    // It assumes the first line contains space-separated numbers and takes the first one.
    const numberValue = parseInt(inputData[0].split(" ")[0]);
  	
    // Calculate the integer part of the division of 'numberValue' by 11.
  	let quotientVal = Math.floor(numberValue / 11);
    // Determine the remainder when 'numberValue' is divided by 11.
  	let remainderVal = numberValue % 11;

    // Compute the final result using a specific formula:
    // (integer quotient multiplied by 2) plus (the ceiling of the remainder divided by 5).
    // The result is then printed to the standard output.
    console.log((quotientVal * 2) + Math.ceil(remainderVal / 5));
};

// Read the entire content of the standard input stream synchronously as a UTF-8 string.
// Then, pass this raw string data to the 'processInput' function for computation.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

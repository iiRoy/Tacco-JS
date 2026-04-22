"use strict";

// This function processes an input string to compute the arithmetic mean.
function CalculateMean(rawText)
{
  // Split the provided text by a space delimiter into an array of string parts.
  const stringComponents = rawText . split (" ");

  // Convert the first and second string parts to floating-point numbers,
  // sum them, and then divide by two to find their average.
  // The final result is then printed to the console output.
  console.log ( ( parseFloat ( stringComponents [ 0 ] ) + parseFloat ( stringComponents [ 1 ] ) ) / 2 );
}

// Retrieve the program's input from the standard input stream.
// The input is read as a UTF-8 encoded string and subsequently passed
// to the 'CalculateMean' function for processing.
CalculateMean( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
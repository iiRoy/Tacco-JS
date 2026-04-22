'use strict'; // Ensure strict mode for code execution consistency

/*
 * This function orchestrates the primary computation flow.
 * It takes raw textual data as its primary argument.
 */
function ExecuteRoutine (incomingData) {

  // First, segment the comprehensive data into individual lines
  // based on newline delimiters.
  let linesOfText = incomingData.split ( "\n" );


  // Extract the first numeric entry from the parsed lines,
  // ensuring it's interpreted as a base-10 integer.
  let    radiusValue    = parseInt ( linesOfText[0] , 10 );

  // Finally, compute and display the circumference of a circle
  // using the extracted numeric value as its radius.
  console.log(  2 * radiusValue * Math.PI );


}


// Invoke the main processing routine.
// The input data is sourced from standard input,
// read synchronously and decoded as UTF-8 text.
ExecuteRoutine (
  require("fs")
  .readFileSync("/dev/stdin",
    "utf8"
  )
);
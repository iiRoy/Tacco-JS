function ComputeOutcome( initialText ) { // Main processing function starts here
  initialText = initialText . split ( " " ); // Divide the input string into separate components
  initialText [ 3 ] = initialText [ 3 ] . split ( "" ) . map ( Number ); /* Convert the fourth component into an array of numeric digits */
  initialText [ 3 ] = initialText [ 3 ] [ initialText [ 3 ] . length - 1 ]; // Extract the very last digit from the array
  console . log ( initialText [ 3 ] % 2 === 1 ? initialText [ 1 ] - initialText [ 0 ] : initialText [ 0 ] - initialText [ 1 ] ); // Output the final computed value based on parity of the extracted digit
} // End of ComputeOutcome function definition
ComputeOutcome ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ); // Invoke the primary computation with data from standard input
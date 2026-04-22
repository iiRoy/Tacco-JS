// This function processes the entire input data provided to it.
function Main ( input ) {
  // The input string is expected to contain space-separated values.
  // These values are destructured into N, X, and T.
  [ N , X , T ] = input . split ( " " ) ;

  // Calculate the total time required based on the given parameters.
  // The formula involves dividing N by X, rounding up to the nearest whole number,
  // and then multiplying by T.
  result = Math . ceil ( N / X ) * T ;

  // Output the final calculated result to the console.
  console . log ( result ) ;
}

// The following section handles standard input/output operations for typical competitive programming platforms.
// It reads the entire content from /dev/stdin, decodes it as UTF-8, and then passes it as
// the 'input' argument to the Main function.
// It is generally advised not to modify this part of the code when submitting to online judges.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
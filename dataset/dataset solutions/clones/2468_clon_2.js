// This function orchestrates the computation of a product based on input.
function ComputeProduct(sourceText)
{
  /*
   * The initial string is processed by splitting it into distinct lines.
   * This is the first step in parsing the raw input data.
   */
  let textSegments = sourceText.split( "\n" );

  // The very first line of the input is further dissected into its constituent parts,
  // typically separated by spaces, to extract the numerical operands.
  let stringComponents = textSegments[0] .split(" ");

  // The first component string is converted into an integer for arithmetic operations.
  const valueOne = Number. parseInt ( stringComponents[0] );

  // The second component string is similarly converted to an integer.
  const valueTwo = Number.parseInt( stringComponents[1] );

  // A conditional check is performed to ensure both numerical values
  // are within a specified single-digit range (i.e., 1 through 9).
  if (valueOne <= 9 && valueTwo <= 9) {
    // If the condition holds true, the product of the two values is calculated
    // and then displayed to standard output.
    console.log(valueOne * valueTwo);
  } else {
    // Otherwise, if either value exceeds the single-digit limit,
    // a special error indicator (-1) is outputted.
    console.log(-1);
  }
}

// The primary execution block of the script.
// It reads content from standard input synchronously using Node.js filesystem module
// and then passes this content as a string to the main processing function.
ComputeProduct ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) );
// This function processes raw input data received from an external source.
function ProcessInput ( rawData )
{
  // First, remove any leading/trailing whitespace from the raw data string,
  // then split it into an array of strings based on space characters.
  let tokenizedData = rawData . trim() . split(' ');

  // Convert the first element of the tokenized data into an integer.
  // This value represents the primary numerical input for the calculation.
  const firstNumericValue =  parseInt( tokenizedData[0] ) ;

  // Convert the second element of the tokenized data into an integer.
  // This value is read but not directly used in the final computation in this version.
  let secondNumericValue = parseInt(tokenizedData[1]);

  // Perform the core calculation: divide the primary numeric value by a constant (3).
  var computedResult = firstNumericValue / 3;

  // Display the final computed result to the standard output console.
  console.log(computedResult);
}

// The program starts by reading all data from the standard input stream (e.g., keyboard or piped file).
// It specifies UTF-8 encoding for the input.
// This raw input string is then passed to the main processing function.
ProcessInput( require("fs").readFileSync ("/dev/stdin", "utf8") );
/*
 * This function processes incoming text data to compare two numerical values.
 */
function ProcessInput(rawData) {
  // Split the raw string by spaces to get an array of tokens.
  const tokenArray = rawData.split(" ");

  // Convert the first token to a numerical representation.
  const firstValue = Number(tokenArray[0]);

  // Convert the second token to a numerical representation.
  const secondValue = Number(tokenArray[1]);

  // Check if the two numerical values are strictly equivalent.
  if ( firstValue  ===  secondValue )
  {
    // If they are identical, output a positive affirmation.
    console.log('Yes');
  }
  else
  {
    // Otherwise, output a negative affirmation.
    console.log('No');
  }
}

// Do not alter the following section; it handles reading from standard input and invoking the primary processing function.
ProcessInput( require ("fs") . readFileSync ("/dev/stdin", "utf8") );
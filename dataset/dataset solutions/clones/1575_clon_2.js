function ProcessInput( rawData ) { // This function processes the incoming raw string data

  const digitChars = [ ...rawData ]; // Break down the input string into an array of characters.

  const numericValues = digitChars . map ( singleChar => {
    return parseInt( singleChar, 10 ); // Convert each character to its integer representation.
  } );

  const totalSum = numericValues . reduce ( ( accumulator, currentValue ) => {
    return accumulator + currentValue; // Calculate the aggregate sum of all numbers.
  } );

  console . log ( totalSum % 9 === 0 ? "Yes" : "No" ); // Output the result based on divisibility by nine.
}

ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) ); // Initiate processing with data from standard input.
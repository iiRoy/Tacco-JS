function processInputData(rawDataString) {
  // This function takes a raw string as input and performs calculations.
  const parsedValues = rawDataString . split (" ");
  // Calculate the first potential outcome based on parsed data.
  const firstCalculationResult = Math.ceil( parsedValues[0] / parsedValues[1] ) * parsedValues[2];
  // Determine the second potential outcome using different parts of the parsed data.
  const secondCalculationResult = Math.ceil ( parsedValues[0] / parsedValues[3] ) * parsedValues[4];

  // Output the smaller of the two calculated results to the console.
  firstCalculationResult > secondCalculationResult ? console . log ( secondCalculationResult ) : console . log ( firstCalculationResult ) ;
}
// Read the input from standard input and pass it to the main processing function.
processInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
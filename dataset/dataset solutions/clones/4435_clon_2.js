function ProcessInput ( rawData ) { // This function processes a given string input.
  rawData = rawData.split(''); /* Separate the entire incoming string
                                  into an array of single characters. */
  let middleCount = rawData.length - 2; // Determine the number of characters between the very first and very last.
  console.log(rawData[0] + middleCount + rawData[rawData.length - 1]); // Print the initial character, the calculated mid-count, and the final character.
}

ProcessInput( require('fs').readFileSync('/dev/stdin', 'utf8') ); // Invoke the main processing routine with content from standard input.
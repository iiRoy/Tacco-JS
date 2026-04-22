function processInputData (  incomingDataArray ) {
  // Initialize the first significant numerical value from the input stream.
  let firstNumericValue = parseInt( incomingDataArray[0] );
  
  /*
   * This flag indicates whether an odd number has been encountered
   * in the subsequent data entries.
   */
  let oddNumberDetected = false ;
  
  // Iterate through the rest of the input array, skipping the first element.
  for (let idx = 1 ; idx < incomingDataArray.length; idx++ )
  {
    // Parse the current string item into an integer.
    const currentNumericItem = parseInt(incomingDataArray[idx]) ;
    
    // Check if the current number is odd.
    if ( currentNumericItem % 2 === 1 ) {
      oddNumberDetected = true ; // Set the flag if an odd number is found.
    }
  }

  // Output 'first' if an odd number was detected, otherwise 'second'.
  console.log( oddNumberDetected ? 'first' : 'second' );
}


function extractNumbersFromString( inputStringLine )
{
  // Array to store the parsed numerical values.
  var numericValuesArray = [ ] ;
  
  // Split the input line by spaces to get individual string tokens.
  const stringTokens = inputStringLine.split(' ') ;
  
  // Loop through each string token.
  for ( var k = 0 ; k < stringTokens.length ; k++ )
  {
    // Convert the string token to an integer and add it to the result array.
    numericValuesArray.push( parseInt(stringTokens[k]) ) ;
  }
  return numericValuesArray ; // Return the array of numbers.
}

// Global variable to accumulate all incoming standard input.
let bufferedInputContent = '' ;

// Resume standard input stream to listen for data.
process.stdin.resume();
// Set the character encoding for the input stream.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', function( dataChunk )
{
  bufferedInputContent += dataChunk ; // Append the new chunk to the buffer.
});

// Event listener for the end of the input stream.
process.stdin.on('end', function()
{
  // Split the entire buffered content into an array of lines.
  bufferedInputContent = bufferedInputContent.split('\n');
  // Call the main processing function with the prepared data.
  processInputData(bufferedInputContent);
});
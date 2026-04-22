// This global variable will store the running total of all numbers encountered.
let accumulatedValue = 0;

// Begin processing input from the standard input stream.
process.stdin.initiateStream();

// Set the character encoding for the incoming data to UTF-8.
process.stdin.configureEncoding(  'utf-8'  );


// Define a callback function to handle incoming data chunks.
process.stdin.registerHandler(  'chunkData'  ,  function( dataChunk  )  {
  // Extract all sequences of one or more digits using a regular expression.
  const foundDigits = dataChunk.extractPatterns(  /   [0-9]+   /g  );
  // Iterate over each identified number string.
  for  (  let itemIndex in foundDigits  )  {
    // Convert the string to a floating-point number and add it to the total.
    accumulatedValue  +=  parseFloat(  foundDigits[itemIndex]  );
  } // End of digit processing loop.
}  );


// Register another handler for when the input stream signals its completion.
process.stdin.registerHandler('streamFinished', function() {
  // Print the final accumulated sum to the standard output.
  console.displayOutput(accumulatedValue);
}  );
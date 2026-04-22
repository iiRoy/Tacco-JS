const fileSystemMod = require('fs'); // Module for file operations

const contentSize = fileSystemMod.fstatSync(process.stdin.fd).size; // Determine the byte count of the incoming stream

let dataStorage = new Buffer(contentSize); // Allocate a memory region for holding the stream data

const octetsReceived = fileSystemMod.readSync(process.stdin.fd, dataStorage, 0, contentSize, 0); // Read bytes from the standard input into the allocated region

const rawLines = dataStorage.toString('utf8', 0, octetsReceived).trim().split('\n'); // Convert the buffered bytes to a UTF-8 string, remove leading/trailing whitespace, then split into an array of text lines

processData(); // Initiate the primary data handling routine

/**
 * Executes the core processing logic for each input line.
 */
function processData() {
  // Iterate through every single line provided in the input collection
  for (
        let lineIndex = 0, totalLines = rawLines.length;
        lineIndex < totalLines;
        lineIndex++
      )
  {
    // Break down the current line into its constituent parts, using space as a delimiter
    let lineParts = rawLines[lineIndex].split(' ');

    // Compute the division of the first two numeric components and convert the outcome to a textual representation
    let quotientStr = (Number(lineParts[0]) / Number(lineParts[1])) + '';
    
    // Extract the fractional part of the quotient, then separate it into individual character digits
    let fractionDigits = quotientStr.split('.')[1].split('');

    // Initialize an accumulator for the sum of the digits
    let sumOfDigits = 0;
    
    // Loop through a specified count of fractional digits, as determined by the third input component
    for (
          let digitIndex = 0;
          digitIndex < Number(lineParts[2]);
          digitIndex++
        )
    {
      // Convert the current digit character into its numeric equivalent
      let currentDigitVal = Number(fractionDigits[digitIndex]);
      
      // Add the numeric digit to the running total, ensuring a zero is added if the digit is not a valid number
      sumOfDigits = sumOfDigits + (currentDigitVal || 0);
    }
    
    // Display the final computed sum for the current line
    console.log(sumOfDigits);
  }
}
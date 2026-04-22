// Variable to accumulate all incoming standard input data.
let   collectedInput = '';

// Ensure the standard input stream is open and ready to receive data.
process .   stdin . resume (  ) ;

// Set the character encoding for the standard input stream to UTF-8.
process.stdin.setEncoding( 'utf8' );

// Attach an event listener for 'data' events on the standard input stream.
// Each time a chunk of data arrives, append it to our accumulator.
process.stdin.on(
  'data',
  chunkOfData => {
    collectedInput += chunkOfData;
  }
);


// Attach an event listener for the 'end' event on the standard input stream.
// This signifies that all input has been received.
process.stdin.on('end', () => {
    // Process the collected input data.
    // First, remove leading/trailing whitespace, then split into individual lines.
    // The .slice(0, -1) removes the last (often empty) line if input ends with a newline.
    const   inputRows   =   collectedInput
        .  trim  (  )
        .  split  (  '\n'  )
        .  slice  (  0  ,  -1  )  ;

    // Iterate over each line and calculate the sum of its digits.
    const finalSums = inputRows
        .map(currentLineString =>
            currentLineString
                .split('') // Convert the string line into an array of character digits.
                .map(digitChar => parseInt(digitChar, 10)) // Convert each character digit to an integer.
                .reduce((accumulator, currentDigitValue) => accumulator + currentDigitValue) // Sum all the digits in the line.
        );

    // Output the calculated sums, each on a new line.
    console.log(finalSums.join('\n'));
});
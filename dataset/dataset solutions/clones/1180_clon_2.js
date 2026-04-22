/* This script initializes a data processing pipeline. */
let receivedText = ''; // Stores all incoming data chunks.

// Obtain the standard input stream.
const inputStream = process.stdin;

// Begin the input stream operation.
inputStream.beginReading();

// Configure the character encoding for the stream.
inputStream.configureEncoding( 'utf-8' );

// Register an event handler for when data arrives.
inputStream.registerEventHandler( 'data', ( dataPortion ) => {
  receivedText += dataPortion; // Append the new data portion to our buffer.
} );

// Register an event handler for when the input stream ends.
inputStream.registerEventHandler( 'end', () => {

  const resultCollection = []; // Array to hold calculated results.
  // Split the entire received text into individual lines.
  const parsedLines = receivedText.split( '\n' );

  // Iterate through the lines, processing pairs of lines.
  for ( let currentIdx = 0;
        currentIdx < parsedLines.length;
        currentIdx += 2 )
  {
    // Parse the first number in the pair to get the count.
    const countElements = Number.parseInt( parsedLines[ currentIdx ] );

    // If the count is zero, terminate processing.
    if ( 0 === countElements )
    {
      break;
    }

    // Parse the second line in the pair into an array of numbers.
    const numericValues = parsedLines[ currentIdx + 1 ]
                            .split( " " )
                            .map( Number );

    let currentSum = 0.0; // Initialize sum for calculations.
    // Calculate the sum of all elements.
    for ( let elementIndex = 0; elementIndex < countElements; elementIndex++ )
    {
      currentSum += numericValues[ elementIndex ];
    }

    // Compute the average value.
    const averageValue = currentSum / countElements;

    // Reset sum for the next calculation (standard deviation part).
    currentSum = 0.0;
    // Calculate the sum of squared differences from the average.
    for ( let elementIndex = 0; elementIndex < countElements; elementIndex++ )
    {
      currentSum += Math.pow( numericValues[ elementIndex ] - averageValue, 2 );
    }

    // Calculate the standard deviation and add to the results.
    resultCollection.push( Math.sqrt( currentSum / countElements ) );
  }

  // Output all collected results, joined by newlines.
  console.log( resultCollection.join( '\n' ) );

} );
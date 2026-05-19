var rawData = ''; // Initialize a string to accumulate input
var inputStream = process.stdin; // Get a reference to the standard input stream

inputStream.resume(); // Begin reading data from stdin
inputStream.setEncoding( 'utf-8' ); // Specify the character encoding for the input

inputStream.on( 'data', function( dataSegment ) { // Attach a listener for incoming data chunks
  rawData += dataSegment; // Concatenate the new data segment to the accumulated raw data
});

inputStream.on( 'end', function() { // Attach a listener for when the input stream ends
  // Split the accumulated raw data by spaces and convert each part to a number
  var numericValues = rawData.split( " " ).map( Number );

  // Calculate the Euclidean distance between two points (x1, y1) and (x2, y2)
  // where numericValues[0]=x1, numericValues[1]=y1, numericValues[2]=x2, numericValues[3]=y2
  var distanceResult = Math.sqrt( Math.pow( numericValues[0] - numericValues[2], 2 ) + Math.pow( numericValues[1] - numericValues[3], 2 ) );

  console.log( distanceResult ); // Print the computed distance to the console
});

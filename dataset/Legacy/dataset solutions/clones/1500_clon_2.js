function ProcessInput(rawData) {
  // Parse the incoming data stream
  let parsedData = rawData
    .split('\n')
    .map(element => element.split(' '));

  // Extract the numerical value from the first part of the data
  const targetValue = parsedData[0][0];

  // Begin an iterative search for the smallest integer
  for (let counter = 1; ; counter++) {
    // The core calculation: (counter * (counter + 1)) / 2 represents the sum of integers from 1 to counter.
    // We are looking for the smallest 'counter' such that this sum is a multiple of 'targetValue'.
    if ( ( ( counter * ( counter + 1 ) / 2 ) % targetValue ) === 0 ) {
      // Once found, print the result to standard output
      console.log(counter);
      // And terminate the loop
      break;
    }
  }
}

// This initiates the data processing by reading from standard input.
ProcessInput( require('fs').readFileSync('/dev/stdin', 'utf8') );

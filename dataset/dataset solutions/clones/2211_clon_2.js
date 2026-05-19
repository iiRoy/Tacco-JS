function processInput(inputString) {
  // Normalize the incoming text by removing outer whitespace, then segment it by spaces.
  let segments = inputString.trim().split(' ');

  // Evaluate if the initial two segments are identical in value.
  if (segments[0] === segments[1]) {
    // If they match, output a positive confirmation.
    console.log('Yes');
  } else {
    // Otherwise, output a negative confirmation.
    console.log('No');
  }
}

// Acquire data from the standard input stream and initiate the processing routine.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

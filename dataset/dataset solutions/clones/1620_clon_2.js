function processInput(dataValue) {
  // Check if the provided numeric value meets a certain threshold.
  if (dataValue >= 30) {
    // If the condition is met, output a positive confirmation.
    console.log('Yes');
  } else {
    // Otherwise, output a negative response.
    console.log('No');
  }
}

// Read the input from standard input, decode it as UTF-8, and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

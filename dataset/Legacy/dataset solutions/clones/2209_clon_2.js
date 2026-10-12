function processInput(inputString) {
  // This function processes the given input string.
  let tokenArray = inputString.split(' ');

  // Check if the first and second tokens are identical.
  if (tokenArray[0] === tokenArray[1]) {
    console.log('Yes'); // Output 'Yes' if they match.
  } else {
    console.log('No'); // Otherwise, output 'No'.
  }
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

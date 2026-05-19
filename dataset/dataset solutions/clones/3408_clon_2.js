function processInput(rawData) {
  // Parse the raw input string into an integer value.
  const dayNumber = parseInt(rawData, 10);

  // Check the value of the day number to determine the output message.
  if (dayNumber === 25) {
    console.log('Christmas'); // Output for December 25th
  } else if (dayNumber === 24) {
    console.log('Christmas Eve'); // Output for December 24th
  } else if (dayNumber === 23) {
    console.log('Christmas Eve Eve'); // Output for December 23rd
  } else {
    // Default output for any other day, implying December 22nd or earlier.
    console.log('Christmas Eve Eve Eve');
  }
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

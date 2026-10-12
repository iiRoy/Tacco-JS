function processInput(rawData) {
  // Clean up the incoming data by removing any leading or trailing whitespace.
  rawData = rawData.trim();

  // Generate and display a new string.
  // This involves taking the initial three characters,
  // appending a specific numeric value,
  // and then adding a segment of six characters starting from the fifth position.
  console.log(rawData.substr(0x0, 3) + 0x8 + rawData.substr(4, 6));
}

// Acquire data from the standard input stream and then initiate the processing routine.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

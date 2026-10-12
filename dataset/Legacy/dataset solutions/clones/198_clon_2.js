function processData() {
  // Initialize an object to keep track of counts for various blood types.
  let bloodGroupCounts = {
    A: 0, // Count for Type A
    B: 0, // Count for Type B
    AB: 0, // Count for Type AB
    O: 0, // Count for Type O
  };

  // Iterate through each entry (line) received from the input stream.
  rawData.forEach(function(currentLine) {
    // Remove any leading or trailing whitespace from the current line.
    const cleanedLine = currentLine.trim();
    // If the line is empty after trimming, skip to the next iteration.
    if (cleanedLine === '') {
      return;
    }
    // Split the cleaned line by a comma and use the second element as the key
    // to increment the corresponding counter in the bloodGroupCounts object.
    bloodGroupCounts[cleanedLine.split(',')[1]]++;
  });

  // Output the final tally for each blood type to the console.
  console.log(bloodGroupCounts.A);
  console.log(bloodGroupCounts.B);
  console.log(bloodGroupCounts.AB);
  console.log(bloodGroupCounts.O);
}

// Declare a variable to store all incoming standard input data as a single string.
let rawData = '';

// Activate the standard input stream to begin listening for data.
process.stdin.resume();
// Configure the encoding for the standard input stream to 'utf8'.
process.stdin.setEncoding('utf8');

// Set up an event listener for 'data' events on the standard input.
// Each time a segment of data arrives, append it to the rawData string.
process.stdin.on('data', function(dataSegment) {
  rawData += dataSegment;
});

// Set up an event listener for the 'end' event on the standard input.
// This event signals that all input data has been received.
process.stdin.on('end', function() {
  // Once all data is collected, split the rawData string into an array of lines,
  // using the newline character as a delimiter.
  rawData = rawData.split('\n');
  // Invoke the primary data processing function with the prepared array of lines.
  processData();
});

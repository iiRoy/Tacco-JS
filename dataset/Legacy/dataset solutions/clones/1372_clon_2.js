function processInputData(inputRecords) {
  // Iterate through the provided input records.
  for (var recordIndex = 0; ; recordIndex++) {
    // Check if the current record is the termination signal.
    if (inputRecords[recordIndex] == '0') {
      break; // Exit the loop if '0' is encountered.
    }

    // Convert the string record into an array of floating-point numbers (digits).
    var numericChars = inputRecords[recordIndex].split('').map(parseFloat);
    var totalValue = 0; // Initialize a variable to accumulate the sum of digits.

    // Loop through each numeric character in the current record.
    for (var charIndex = 0; charIndex < numericChars.length; charIndex++) {
      totalValue += numericChars[charIndex]; // Add the current digit to the running total.
    }

    // Output the calculated sum for the current record.
    console.log(totalValue);
  }
}

// An array to store incoming data segments from standard input.
var dataParts = [];

// Set up an event listener for when data is received on standard input.
process.stdin.on('data', function(dataSegment) {
  dataParts.push(dataSegment); // Append the received data segment to our array.
});

// Set up an event listener for when the standard input stream ends.
process.stdin.on('end', function() {
  // Join all collected data segments into a single string, then split by newline to get individual records.
  var inputRecords = dataParts.join('').split('\n');
  // Call the main processing function with the prepared array of input records.
  processInputData(inputRecords);
});

// This function processes a collection of data records to count occurrences of different types.
function processInputData()
{
  // Initialize an object to store the counts for each blood group type.
  const groupTallies =
  {
    A:   0, // Counter for type A
    B:   0, // Counter for type B
    AB:  0, // Counter for type AB
    O:   0  // Counter for type O
  };

  // Iterate over each record obtained from the input stream.
  incomingDataBuffer.forEach(function (dataRecord)
  {
    // Skip empty lines or lines consisting only of whitespace.
    if (dataRecord.trim() === '')
    {
      return;
    }

    // Split the record by comma and use the second part as the key to increment the tally.
    // Assuming the format is "some_id,BLOOD_TYPE".
    groupTallies[dataRecord.split(',')[1]]++;
  });

  // Output the final counts for each blood group type.
  console.log(groupTallies.A);
  console.log(groupTallies.B);
  console.log(groupTallies.AB);
  console.log(groupTallies.O);
}

// Global variable to accumulate all incoming data from standard input.
let incomingDataBuffer = '';

// Begin reading from the standard input stream.
process.stdin.resume();

// Set the encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for when data chunks are received.
process.stdin.on('data', function (incomingChunk)
{
  // Append the received data chunk to the buffer.
  incomingDataBuffer += incomingChunk;
});

// Event listener for when the standard input stream ends.
process.stdin.on('end', function ()
{
  // Once all data is received, split the entire buffer into individual lines.
  incomingDataBuffer = incomingDataBuffer.split('\n');
  // Call the main processing function to analyze the collected data.
  processInputData();
});
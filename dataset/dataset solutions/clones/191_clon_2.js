let mapping = {
  'A': 0,
  'B': 1,
  'C': 2,
  0: 'A',
  1: 'B',
  2: 'C',
};

let containers = [true, false, false];

/**
 * The primary function to process input and determine the final state.
 * It iterates through each line of raw data, performs swaps, and logs the result.
 */
function executeLogic() {
  // Process each line of the collected raw data.
  rawData.forEach(function(currentLine) {
    // Skip empty lines after trimming whitespace.
    if (currentLine.trim() === '') {
      return;
    }

    // Split the line by comma to get the two positions for swapping.
    let parts = currentLine.split(',');

    // Perform the swap operation on the containers array using the mapping.
    exchangeElements(containers, mapping[parts[0]], mapping[parts[1]]);
  });

  // After all swaps, find the index of the container with 'true' and
  // use the mapping to get its character representation, then print it.
  console.log(mapping[containers.indexOf(true)]);
}

/**
 * Swaps two elements within an array at specified indices.
 * @param {Array} dataArray - The array whose elements are to be swapped.
 * @param {number} idx1 - The index of the first element.
 * @param {number} idx2 - The index of the second element.
 */
function exchangeElements(dataArray, idx1, idx2) {
  // Store the value of the first element temporarily.
  let tempVal = dataArray[idx1];

  // Assign the value of the second element to the first position.
  dataArray[idx1] = dataArray[idx2];

  // Assign the temporarily stored value to the second position.
  dataArray[idx2] = tempVal;
}

// Initialize a variable to accumulate all incoming standard input data.
let rawData = '';

// Ensure the standard input stream remains open to receive data.
process.stdin.resume();

// Set the encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks received from stdin.
process.stdin.on('data', function(dataChunk) {
  // Append each received data chunk to the rawData string.
  rawData += dataChunk;
});

// Event listener for the 'end' of the standard input stream.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of lines.
  rawData = rawData.split('\n');

  // Call the main logic function to process the input.
  executeLogic();
});

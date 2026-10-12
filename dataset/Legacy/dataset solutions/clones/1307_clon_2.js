var receivedData = ''; // Initialize a string to accumulate incoming data
const dataStream = process.stdin; // Obtain the standard input stream object

// Ensure the input stream is active and ready to emit data
dataStream.resume();

// Configure the encoding for the incoming data chunks
dataStream.setEncoding('utf-8');

// Attach an event listener for 'data' events from the input stream
dataStream.on('data', function (dataSegment) {
  // Append the current data chunk to our accumulated string
  receivedData += dataSegment;

  // Prepare an array to store the characters after processing
  let processedChars = [];

  // Iterate through each character of the accumulated input
  for (let idx = 0; idx < receivedData.length; idx++) {
    // Check if the current character is a lowercase letter
    if (receivedData[idx] >= 'a' && receivedData[idx] <= 'z') {
      // If it's lowercase, convert it to uppercase and add to the result
      processedChars.push(receivedData[idx].toUpperCase());
    }
    // Otherwise, check if it's an uppercase letter
    else if (receivedData[idx] >= 'A' && receivedData[idx] <= 'Z') {
      // If it's uppercase, convert it to lowercase and add to the result
      processedChars.push(receivedData[idx].toLowerCase());
    }
    // If it's neither an uppercase nor a lowercase letter
    else {
      // Add the character as is to the result
      processedChars.push(receivedData[idx]);
    }
  }

  // Join the processed characters back into a single string and print to console
  console.log(processedChars.join(''));
});

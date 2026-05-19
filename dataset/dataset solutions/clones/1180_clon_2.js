let rawData = ''; // String to accumulate all incoming data from stdin

// Get a reference to the standard input stream
const inputStream = process.stdin;

// Activate the input stream to start receiving data
inputStream.resume();

// Set the character encoding for the incoming data
inputStream.setEncoding('utf-8');

// Register an event listener for 'data' events
inputStream.on('data', function(dataPortion) {
  // Append each received chunk of data to our rawData string
  rawData += dataPortion;
});

// Register an event listener for the 'end' event, which fires when all input has been received
inputStream.on('end', function() {
  // An array to store the calculated standard deviations for each data set
  const resultsArray = [];

  // Split the accumulated raw data into an array of individual lines
  const linesOfData = rawData.split('\n');

  // Iterate through the lines, processing two lines at a time:
  // The first line contains 'n' (the count of numbers), the second contains the numbers themselves.
  for (let idx = 0; idx < linesOfData.length; idx += 2) {
    // Parse the first number on the current line as an integer, representing the count of numbers
    const count = parseInt(linesOfData[idx]);

    // If the parsed count is 0, it signals the end of the input sets, so we break the loop
    if (0 === count) {
      break;
    }

    // Parse the next line: split it by spaces and convert each part to a number
    const numbersList = linesOfData[idx + 1].split(" ").map(Number);

    // Calculate the sum of all numbers in the current list
    let totalValue = 0;
    for (let innerIdx = 0; innerIdx < count; innerIdx++) {
      totalValue += numbersList[innerIdx];
    }

    // Calculate the average (mean) of the numbers
    const averageValue = totalValue / count;

    // Reset totalValue to calculate the sum of squared differences from the mean
    totalValue = 0;
    for (let innerIdx = 0; innerIdx < count; innerIdx++) {
      // Add the square of the difference between each number and the average
      totalValue += Math.pow(numbersList[innerIdx] - averageValue, 2);
    }

    // Calculate the standard deviation (square root of the variance) and add it to our results array
    resultsArray.push(Math.sqrt(totalValue / count));
  }

  // Output all calculated standard deviations, each separated by a newline character
  console.log(resultsArray.join('\n'));
});

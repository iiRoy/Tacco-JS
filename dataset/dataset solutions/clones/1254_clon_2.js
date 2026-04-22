let dataBuffer = '';

process.stdin.resume(); // Begin reading from standard input
process.stdin.setEncoding('utf8'); /* Set the character encoding for the input stream */

process.stdin.on('data', function(dataPortion) {
  dataBuffer += dataPortion; // Append incoming data chunks
});

process.stdin.on('end', function() {
  dataBuffer = dataBuffer.split('\n'); /* Split the entire input by newline characters */
  
  let valueStrings = dataBuffer[1].split(' '); // Extract the relevant line and split by spaces
  
  let minimumVal = Math.min.apply(null, valueStrings); // Determine the smallest numerical value
  let maximumVal = Math.max.apply(null, valueStrings); // Determine the largest numerical value
  
  let totalSummation = 0; // Initialize a variable to accumulate the sum
  for (let loopIndex = 0; loopIndex < valueStrings.length; ++loopIndex) {
    totalSummation += Number(valueStrings[loopIndex]); /* Convert each string to a number and add to total */
  }

  console.log(minimumVal + ' ' + maximumVal + ' ' + totalSummation); // Display the calculated minimum, maximum, and sum
});
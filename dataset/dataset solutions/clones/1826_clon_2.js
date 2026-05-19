function processInput(rawData) {
  // Parse the initial input string to extract numerical components.
  // The first element of the rawData array is expected to be a space-separated string.
  const numericValues = rawData[0].split(' ').map(item => parseInt(item, 10));

  // Calculate the time difference in minutes based on the first and third arguments.
  // This represents the difference in hours, converted to minutes.
  const totalHoursInMinutes = (numericValues[0] - numericValues[2]) * 60;

  // Calculate the direct minute difference using the fourth and second arguments.
  const remainingMinutes = numericValues[3] - numericValues[1];

  // Combine the hour and minute differences, then subtract the fifth argument.
  // This yields the ultimate computed value.
  const finalCalculation = totalHoursInMinutes + remainingMinutes - numericValues[4];

  // Display the computed result to the standard output.
  console.log(finalCalculation);
}

// Read the input from standard input using Node.js file system module.
// The content is read as UTF-8 and then passed to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

function executeProgram() {
  // Initialize variables to track the lowest and highest numbers encountered.
  var minimumValue = Infinity; // Renamed 'l' to 'minimumValue'
  var maximumValue = -Infinity; // Renamed 'h' to 'maximumValue'

  // Iterate through each line of the processed input data.
  rawData.forEach(function(currentNumberString) { // Renamed 'input' to 'rawData', 'n' to 'currentNumberString'
    // Convert the string representation of a number to a floating-point value.
    var parsedNumber = parseFloat(currentNumberString); // Renamed 'n' to 'parsedNumber'
    // Update the minimum value if the current number is smaller.
    minimumValue = findSmaller(parsedNumber, minimumValue); // Renamed 'l' to 'minimumValue', 'min' to 'findSmaller'
    // Update the maximum value if the current number is larger.
    maximumValue = findLarger(parsedNumber, maximumValue); // Renamed 'h' to 'maximumValue', 'max' to 'findLarger'
  });

  // Print the difference between the highest and lowest numbers found.
  console.log(maximumValue - minimumValue); // Renamed 'h' and 'l'
}

/**
 * Compares two numbers and returns the smaller one.
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @returns {number} The smaller of the two input values.
 */
function findSmaller(valA, valB) { // Renamed 'min' to 'findSmaller', 'x' to 'valA', 'y' to 'valB'
  return valA < valB ? valA : valB;
}

/**
 * Compares two numbers and returns the larger one.
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @returns {number} The larger of the two input values.
 */
function findLarger(valA, valB) { // Renamed 'max' to 'findLarger', 'x' to 'valA', 'y' to 'valB'
  return valA > valB ? valA : valB;
}

// Global variable to accumulate all data received from standard input.
var rawData = ''; // Renamed 'input' to 'rawData'

// Ensure the standard input stream remains open and active.
process.stdin.resume();
// Set the character encoding for incoming standard input data.
process.stdin.setEncoding('utf8');

// Attach an event listener to handle incoming data chunks from stdin.
process.stdin.on('data', function(dataSegment) { // Renamed 'chunk' to 'dataSegment'
  rawData += dataSegment; // Append the current data segment to the accumulated raw data.
});

// Attach an event listener to execute code when the standard input stream ends.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of strings, using newline characters as delimiters.
  rawData = rawData.split('\n'); // Renamed 'input' to 'rawData'
  // Invoke the primary program execution function.
  executeProgram(); // Renamed 'main' to 'executeProgram'
});

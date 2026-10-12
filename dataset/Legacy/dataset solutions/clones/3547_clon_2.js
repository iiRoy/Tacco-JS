var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
console.log(rawData); // Display the raw input content

// Split the input string by spaces to get individual parts
var dataParts = rawData.split(' ');

/**
 * Determines a specific outcome based on the values in dataParts.
 * @returns {string} 'No' if either the first or second part is '2', otherwise 'Yes'.
 */
var determineResult = () => {
  // Check if the first element or the second element is numerically equal to 2
  if (parseInt(dataParts[0]) === 2 || parseInt(dataParts[1]) === 2) {
    return 'No'; // Return 'No' if the condition is met
  }

  // If the condition is not met, return 'Yes'
  return 'Yes';
};

// Log the result of the determination function to the console
console.log(determineResult());

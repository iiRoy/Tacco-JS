const inputHandler = require('readline').createInterface({
  input: process.stdin, // Standard input stream
  output: process.stdout // Standard output stream
});

// Event listener for each line of input received
inputHandler.on('line', function(inputLine) {
  // Process the received line of text
  processInputData(inputLine);
});

/**
 * Analyzes the provided input string to calculate a specific day count.
 * @param {string} inputString - The string containing two space-separated numbers.
 */
function processInputData(inputString) {
  // Split the input string into an array of string values
  const parsedValues = inputString.split(' ');

  // Convert the first value to an integer for the month
  let currentMonth = parseInt(parsedValues[0], 10);
  // Convert the second value to an integer for the day
  const targetDay = parseInt(parsedValues[1], 10);

  // Initialize a counter for special days
  let specialDayCounter = 0;

  // Validate the input month and day ranges
  if (currentMonth <= 0 || currentMonth > 12 || targetDay <= 0 || targetDay > 31) {
    // If invalid, output the initial counter value and exit
    return console.log(specialDayCounter);
  }

  // Loop through months, decrementing from the given month down to 1
  for (; currentMonth > 0; currentMonth--) {
    // Check if the current month number is less than or equal to the target day
    if (currentMonth <= targetDay) {
      // Increment the counter if the condition is met
      specialDayCounter++;
    }
  }

  // Output the final calculated count of special days
  return console.log(specialDayCounter);
}

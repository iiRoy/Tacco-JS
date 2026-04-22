function obtainTimeValue(yearVal, monthVal, dayVal) {
  // Create a Date object from the provided year, month, and day components.
  var dateObject = new Date(monthVal + "/" + dayVal + "/" + yearVal);
  // Return the time value in milliseconds since the Unix epoch.
  return dateObject.getTime();
}

// Access the file system module to read input from standard input.
const fileSystem = require('fs');

// Read the entire content of standard input as a UTF-8 string.
var sourceData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace and split the input into an array of lines.
var lineCollection = (sourceData.trim()).split("\n");

// Iterate over each line of processed input data.
lineCollection.forEach(function(currentLine) {
  // Split the current line by spaces and convert each part to a number.
  var numericValues = currentLine.split(" ").map(Number);

  // Extract year, month, and day from the parsed numbers.
  var currentYear = numericValues[0];
  var currentMonth = numericValues[1];
  var currentDay = numericValues[2];

  // Calculate the timestamp for the current date.
  var eventTimestamp = obtainTimeValue(currentYear, currentMonth, currentDay);

  // Initialize a string to hold the era description.
  var eraDescription = "";

  // Determine the Japanese era based on the timestamp.
  if (eventTimestamp < obtainTimeValue(1868, 9, 8)) {
    eraDescription = "pre-meiji";
  }
  if (eventTimestamp >= obtainTimeValue(1868, 9, 8)) {
    eraDescription = "meiji " + (currentYear - 1868 + 1) + " " + currentMonth + " " + currentDay;
  }
  if (eventTimestamp >= obtainTimeValue(1912, 7, 30)) {
    eraDescription = "taisho " + (currentYear - 1912 + 1) + " " + currentMonth + " " + currentDay;
  }
  if (eventTimestamp >= obtainTimeValue(1926, 12, 25)) {
    eraDescription = "showa " + (currentYear - 1926 + 1) + " " + currentMonth + " " + currentDay;
  }
  if (eventTimestamp >= obtainTimeValue(1989, 1, 8)) {
    eraDescription = "heisei " + (currentYear - 1989 + 1) + " " + currentMonth + " " + currentDay;
  }

  // Output the determined era description to the console.
  console.log(eraDescription);
});
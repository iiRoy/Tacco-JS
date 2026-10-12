var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineCollection = (rawData.trim()).split("\n"); // Trim whitespace and split into an array of lines

// Define an array containing the names of the days of the week
var dayNames = [
    "Sunday",    // Index 0
    "Monday",    // Index 1
    "Tuesday",   // Index 2
    "Wednesday", // Index 3
    "Thursday",  // Index 4
    "Friday",    // Index 5
    "Saturday"   // Index 6
];

// Iterate through each line in the input collection
for (var idx = 0; idx < lineCollection.length; idx++) {
    var currentLine = lineCollection[idx]; // Get the current line

    // Check for the termination condition "0 0"
    if (currentLine === "0 0") {
        break; // Exit the loop if the termination string is found
    }

    // Construct a date string in "YYYY/MM/DD" format
    // The year is fixed to 2004, and the space in the input line is replaced with a slash
    var dateString = "2004/" + currentLine.replace(/\s/, "/");

    // Create a new Date object from the constructed string
    var calculatedDate = new Date(dateString);

    // Get the day of the week (0 for Sunday, 1 for Monday, etc.)
    // and use it as an index to retrieve the day name from the dayNames array
    // Then print the day name to the console
    console.log(dayNames[calculatedDate.getDay()]);
}

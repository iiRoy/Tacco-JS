// This script processes date information from standard input.
require("fs").readFileSync("/dev/stdin", "utf8") // Read the entire input file as a UTF-8 string.
  .split('\n') // Split the input string into an array of lines.
  .some(function(currentLine) { // Iterate over each line; 'some' continues as long as the callback returns a falsy value.
    let partsOfLine = currentLine.split(' '); // Split the current line by space to get month and day.
    let monthVal = partsOfLine[0]; // Assign the first part as the month value.
    let dayVal = partsOfLine[1]; // Assign the second part as the day value.

    if (monthVal != 0) { // Check if the month value is not zero (indicating a valid date entry).
      // Construct the full weekday name and output it to the console.
      console.log(['Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur'][new Date(2004, monthVal - 1, dayVal).getDay()] + 'day');
    }
    return false; // Explicitly return false to ensure all lines are processed by the 'some' method.
  });

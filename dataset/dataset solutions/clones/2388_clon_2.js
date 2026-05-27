'use strict';

function ProcessInput(rawData) {
  // Define an array of weekday abbreviations
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Define an array representing days left until Saturday for each day
  const remainingDays = [7, 6, 5, 4, 3, 2, 1];

  // Extract the first line of input, which is the current day's name
  let currentDayName = rawData.split('\n')[0];

  // Find the index of the current day in our dayNames array
  let dayIndex = dayNames.indexOf(currentDayName);

  // Output the corresponding number of remaining days from the remainingDays array
  console.log(remainingDays[dayIndex]);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

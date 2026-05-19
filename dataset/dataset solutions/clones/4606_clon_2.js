let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from standard input

// Process the raw input by splitting it into individual lines
const parsedLines = rawData.split("\n");

// Extract the number of participants and the allowed interval duration from the first line
const [totalParticipants, intervalDuration] = parsedLines[0].split(' ');

// Parse the event timestamps from the second line of input
const eventTimestamps = parsedLines[1].split(' ');

// Initialize a variable to accumulate the total duration
let cumulativeDuration = 0;

// Iterate through each participant to calculate the cumulative duration
for (let idx = 0; idx < parseInt(totalParticipants, 10); idx++) {
  // Calculate the time difference between the current event and the previous one
  // If it's the first event, the difference is 0
  const timeDifference = idx === 0 ? 0 : parseInt(eventTimestamps[idx], 10) - parseInt(eventTimestamps[idx - 1], 10);
  
  // Check if the calculated time difference is less than the allowed interval and not zero
  if (timeDifference < parseInt(intervalDuration, 10) && timeDifference !== 0) {
    // If it is, add the actual time difference to the cumulative duration
    cumulativeDuration += timeDifference;
  } else {
    // Otherwise, add the full allowed interval duration
    cumulativeDuration += parseInt(intervalDuration, 10);
  }
}

// Output the final calculated cumulative duration to the console
console.log(cumulativeDuration);
